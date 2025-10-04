#!/usr/bin/env python3
"""
Real-time Dashboard for AstroVoice User Data
Monitor users, conversations, and AWS resources in real-time
"""

import os
import json
import time
from datetime import datetime
from typing import Dict, Any
import boto3
from dotenv import load_dotenv

load_dotenv()

class AstroVoiceDashboard:
    """Real-time monitoring dashboard"""
    
    def __init__(self):
        self.user_states_file = "user_states.json"
        self.user_profiles_file = "astrology_data/user_profiles.json"
        
        # Try to initialize AWS
        try:
            self.aws_region = os.getenv('AWS_REGION', 'ap-south-1')
            self.dynamodb = boto3.client('dynamodb', region_name=self.aws_region)
            self.s3 = boto3.client('s3', region_name=self.aws_region)
            self.aws_available = True
        except:
            self.aws_available = False
    
    def clear_screen(self):
        """Clear terminal screen"""
        os.system('clear' if os.name != 'nt' else 'cls')
    
    def get_local_stats(self) -> Dict[str, Any]:
        """Get statistics from local storage"""
        stats = {
            'total_users': 0,
            'complete_profiles': 0,
            'incomplete_profiles': 0,
            'total_readings': 0,
            'recent_users': []
        }
        
        try:
            # User states
            if os.path.exists(self.user_states_file):
                with open(self.user_states_file, 'r') as f:
                    user_states = json.load(f)
                stats['total_users'] = len(user_states)
                
                for user_id, state in user_states.items():
                    if state.get('profile_complete'):
                        stats['complete_profiles'] += 1
                    else:
                        stats['incomplete_profiles'] += 1
            
            # User profiles
            if os.path.exists(self.user_profiles_file):
                with open(self.user_profiles_file, 'r') as f:
                    profiles = json.load(f)
                
                for user_id, profile in profiles.items():
                    stats['total_readings'] += profile.get('total_readings', 0)
                    
                    # Get recent users (created in last 24 hours)
                    created = profile.get('created_at', '')
                    if created:
                        try:
                            created_date = datetime.fromisoformat(created.replace('Z', '+00:00'))
                            if (datetime.now() - created_date.replace(tzinfo=None)).days < 1:
                                stats['recent_users'].append({
                                    'user_id': user_id,
                                    'name': profile.get('name', 'Unknown'),
                                    'created': created_date.strftime('%H:%M')
                                })
                        except:
                            pass
        
        except Exception as e:
            print(f"Error getting local stats: {e}")
        
        return stats
    
    def get_aws_stats(self) -> Dict[str, Any]:
        """Get statistics from AWS"""
        stats = {
            'active_connections': 0,
            'audio_files': 0,
            'total_audio_size': 0
        }
        
        if not self.aws_available:
            return stats
        
        try:
            # DynamoDB connections
            response = self.dynamodb.scan(TableName='astro-voice-websocket-connections')
            stats['active_connections'] = len(response.get('Items', []))
        except:
            pass
        
        try:
            # S3 audio files
            buckets = self.s3.list_buckets()
            for bucket in buckets.get('Buckets', []):
                if 'astro-voice-audio' in bucket['Name']:
                    response = self.s3.list_objects_v2(Bucket=bucket['Name'])
                    objects = response.get('Contents', [])
                    stats['audio_files'] = len(objects)
                    stats['total_audio_size'] = sum(obj['Size'] for obj in objects)
                    break
        except:
            pass
        
        return stats
    
    def format_size(self, bytes):
        """Format bytes to human readable"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024:
                return f"{bytes:.2f} {unit}"
            bytes /= 1024
        return f"{bytes:.2f} TB"
    
    def render_dashboard(self):
        """Render the dashboard"""
        self.clear_screen()
        
        # Header
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print("=" * 80)
        print("🌟 ASTROVOICE REAL-TIME DASHBOARD".center(80))
        print(f"{now}".center(80))
        print("=" * 80)
        
        # Get stats
        local = self.get_local_stats()
        aws = self.get_aws_stats()
        
        # Local data section
        print("\n📂 LOCAL DEVELOPMENT DATA")
        print("-" * 80)
        print(f"""
  👥 Total Users:              {local['total_users']}
  ✅ Complete Profiles:        {local['complete_profiles']}
  ⏳ Incomplete Profiles:      {local['incomplete_profiles']}
  📖 Total Readings:           {local['total_readings']}
""")
        
        # Recent users
        if local['recent_users']:
            print("  🆕 Recent Users (Last 24h):")
            for user in local['recent_users'][:5]:
                print(f"     • {user['name']} ({user['user_id']}) - {user['created']}")
        else:
            print("  🆕 No new users in last 24 hours")
        
        # AWS section
        print("\n\n☁️  AWS PRODUCTION DATA")
        print("-" * 80)
        
        if self.aws_available:
            print(f"""
  🔌 Active WebSocket Connections: {aws['active_connections']}
  🎵 Audio Files Stored:           {aws['audio_files']}
  💾 Total Audio Storage:          {self.format_size(aws['total_audio_size'])}
""")
        else:
            print("  ⚠️  AWS not configured - run 'aws configure' to enable")
        
        # System status
        print("\n\n⚙️  SYSTEM STATUS")
        print("-" * 80)
        
        # Check if backend is running
        import subprocess
        try:
            result = subprocess.run(['lsof', '-ti:8000'], capture_output=True, text=True)
            backend_running = bool(result.stdout.strip())
        except:
            backend_running = False
        
        backend_status = "🟢 RUNNING" if backend_running else "🔴 STOPPED"
        aws_status = "🟢 CONFIGURED" if self.aws_available else "🟡 NOT CONFIGURED"
        
        print(f"""
  Backend Server (Port 8000):  {backend_status}
  AWS Integration:             {aws_status}
  Local Storage:               🟢 AVAILABLE
""")
        
        # Quick actions
        print("\n\n🎯 QUICK ACTIONS")
        print("-" * 80)
        print("""
  View all data:      python3 view_user_data.py
  View specific user: python3 view_user_data.py --user USER_ID
  View AWS data:      python3 view_user_data.py --source aws
  View logs:          tail -f backend.log
""")
        
        print("\n" + "=" * 80)
        print("Press Ctrl+C to exit | Dashboard refreshes every 5 seconds".center(80))
        print("=" * 80)


def main():
    dashboard = AstroVoiceDashboard()
    
    print("🚀 Starting AstroVoice Dashboard...")
    print("   Monitoring local and AWS data...")
    time.sleep(2)
    
    try:
        while True:
            dashboard.render_dashboard()
            time.sleep(5)  # Refresh every 5 seconds
    except KeyboardInterrupt:
        dashboard.clear_screen()
        print("\n\n👋 Dashboard stopped. Goodbye!\n")


if __name__ == "__main__":
    main()

