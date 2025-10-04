#!/usr/bin/env python3
"""
AWS User Data Viewer
Tool to view and monitor user data stored across AWS services
"""

import json
import os
import boto3
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv
from tabulate import tabulate
import argparse

load_dotenv()

class AWSUserDataViewer:
    """View user data across AWS services"""
    
    def __init__(self):
        # AWS Configuration
        self.aws_region = os.getenv('AWS_REGION', 'ap-south-1')
        
        # Initialize AWS clients
        try:
            self.dynamodb = boto3.client('dynamodb', region_name=self.aws_region)
            self.s3 = boto3.client('s3', region_name=self.aws_region)
            self.rds_data = boto3.client('rds-data', region_name=self.aws_region)
            self.cognito = boto3.client('cognito-idp', region_name=self.aws_region)
            self.aws_available = True
            print("✅ AWS clients initialized successfully")
        except Exception as e:
            print(f"⚠️  AWS clients not available: {e}")
            self.aws_available = False
        
        # Local file paths
        self.user_states_file = "user_states.json"
        self.user_profiles_file = "astrology_data/user_profiles.json"
    
    def view_local_data(self):
        """View data stored locally"""
        print("\n" + "="*80)
        print("📂 LOCAL DATA STORAGE")
        print("="*80)
        
        # User states
        print("\n🔄 USER CONVERSATION STATES (user_states.json)")
        print("-" * 80)
        try:
            if os.path.exists(self.user_states_file):
                with open(self.user_states_file, 'r') as f:
                    user_states = json.load(f)
                
                if user_states:
                    # Format as table
                    table_data = []
                    for user_id, state in user_states.items():
                        table_data.append([
                            user_id,
                            state.get('name', 'N/A'),
                            state.get('birth_date', 'N/A'),
                            state.get('birth_time', 'N/A'),
                            state.get('birth_location', 'N/A'),
                            '✅' if state.get('profile_complete') else '❌'
                        ])
                    
                    headers = ['User ID', 'Name', 'Birth Date', 'Birth Time', 'Location', 'Complete']
                    print(tabulate(table_data, headers=headers, tablefmt='grid'))
                    print(f"\n📊 Total users: {len(user_states)}")
                else:
                    print("No user states found")
            else:
                print(f"❌ File not found: {self.user_states_file}")
        except Exception as e:
            print(f"❌ Error reading user states: {e}")
        
        # User profiles
        print("\n\n⭐ ASTROLOGY PROFILES (astrology_data/user_profiles.json)")
        print("-" * 80)
        try:
            if os.path.exists(self.user_profiles_file):
                with open(self.user_profiles_file, 'r') as f:
                    user_profiles = json.load(f)
                
                if user_profiles:
                    # Format as table
                    table_data = []
                    for user_id, profile in user_profiles.items():
                        table_data.append([
                            user_id,
                            profile.get('name', 'N/A'),
                            profile.get('birth_date', 'N/A'),
                            profile.get('birth_time', 'N/A'),
                            profile.get('birth_location', 'N/A'),
                            profile.get('subscription_type', 'free'),
                            profile.get('total_readings', 0),
                            profile.get('created_at', 'N/A')[:10] if profile.get('created_at') else 'N/A'
                        ])
                    
                    headers = ['User ID', 'Name', 'Birth Date', 'Time', 'Location', 'Plan', 'Readings', 'Created']
                    print(tabulate(table_data, headers=headers, tablefmt='grid'))
                    print(f"\n📊 Total profiles: {len(user_profiles)}")
                else:
                    print("No user profiles found")
            else:
                print(f"❌ File not found: {self.user_profiles_file}")
        except Exception as e:
            print(f"❌ Error reading user profiles: {e}")
    
    def view_user_detail(self, user_id: str):
        """View detailed data for a specific user"""
        print("\n" + "="*80)
        print(f"👤 DETAILED VIEW: {user_id}")
        print("="*80)
        
        # Local conversation state
        print("\n🔄 Conversation State:")
        print("-" * 80)
        try:
            if os.path.exists(self.user_states_file):
                with open(self.user_states_file, 'r') as f:
                    user_states = json.load(f)
                if user_id in user_states:
                    print(json.dumps(user_states[user_id], indent=2))
                else:
                    print(f"❌ No conversation state found for {user_id}")
            else:
                print("❌ user_states.json not found")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Astrology profile
        print("\n\n⭐ Astrology Profile:")
        print("-" * 80)
        try:
            if os.path.exists(self.user_profiles_file):
                with open(self.user_profiles_file, 'r') as f:
                    user_profiles = json.load(f)
                if user_id in user_profiles:
                    print(json.dumps(user_profiles[user_id], indent=2))
                else:
                    print(f"❌ No profile found for {user_id}")
            else:
                print("❌ user_profiles.json not found")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def view_aws_dynamodb(self):
        """View DynamoDB data"""
        if not self.aws_available:
            print("❌ AWS not configured")
            return
        
        print("\n" + "="*80)
        print("☁️  AWS DYNAMODB - WebSocket Connections")
        print("="*80)
        
        try:
            table_name = 'astro-voice-websocket-connections'
            response = self.dynamodb.scan(TableName=table_name)
            
            items = response.get('Items', [])
            if items:
                print(f"\n📊 Active WebSocket connections: {len(items)}")
                for item in items:
                    connection_id = item.get('connectionId', {}).get('S', 'N/A')
                    print(f"  • Connection ID: {connection_id}")
            else:
                print("No active WebSocket connections")
        except Exception as e:
            print(f"❌ Error accessing DynamoDB: {e}")
            print("💡 Make sure the table exists and you have proper AWS credentials")
    
    def view_aws_s3_audio(self):
        """View S3 audio storage"""
        if not self.aws_available:
            print("❌ AWS not configured")
            return
        
        print("\n" + "="*80)
        print("☁️  AWS S3 - Audio Files")
        print("="*80)
        
        try:
            # Try to find the audio bucket
            buckets = self.s3.list_buckets()
            audio_bucket = None
            
            for bucket in buckets.get('Buckets', []):
                if 'astro-voice-audio' in bucket['Name']:
                    audio_bucket = bucket['Name']
                    break
            
            if audio_bucket:
                print(f"\n📦 Bucket: {audio_bucket}")
                
                # List objects in bucket
                response = self.s3.list_objects_v2(Bucket=audio_bucket)
                objects = response.get('Contents', [])
                
                if objects:
                    print(f"📊 Total audio files: {len(objects)}")
                    
                    # Group by user
                    user_files = {}
                    for obj in objects:
                        key = obj['Key']
                        # Extract user ID from path (assuming format: user_id/...)
                        parts = key.split('/')
                        if len(parts) > 1:
                            user_id = parts[0]
                            if user_id not in user_files:
                                user_files[user_id] = []
                            user_files[user_id].append({
                                'file': key,
                                'size': obj['Size'],
                                'modified': obj['LastModified']
                            })
                    
                    # Display by user
                    for user_id, files in user_files.items():
                        total_size = sum(f['size'] for f in files)
                        print(f"\n  👤 User: {user_id}")
                        print(f"     Files: {len(files)}")
                        print(f"     Total size: {total_size / 1024:.2f} KB")
                        for f in files[:5]:  # Show first 5 files
                            print(f"       • {f['file']} ({f['size']} bytes)")
                        if len(files) > 5:
                            print(f"       ... and {len(files) - 5} more files")
                else:
                    print("No audio files found in bucket")
            else:
                print("❌ Audio bucket not found")
        except Exception as e:
            print(f"❌ Error accessing S3: {e}")
            print("💡 Make sure you have proper AWS credentials and permissions")
    
    def view_aws_cognito_users(self):
        """View Cognito user pool"""
        if not self.aws_available:
            print("❌ AWS not configured")
            return
        
        print("\n" + "="*80)
        print("☁️  AWS COGNITO - User Authentication")
        print("="*80)
        
        try:
            # List user pools
            user_pools = self.cognito.list_user_pools(MaxResults=10)
            
            astro_pool = None
            for pool in user_pools.get('UserPools', []):
                if 'AstroVoice' in pool['Name']:
                    astro_pool = pool
                    break
            
            if astro_pool:
                pool_id = astro_pool['Id']
                print(f"\n🔐 User Pool: {astro_pool['Name']}")
                print(f"   ID: {pool_id}")
                
                # List users in pool
                users = self.cognito.list_users(UserPoolId=pool_id)
                
                if users.get('Users'):
                    print(f"\n📊 Total users: {len(users['Users'])}")
                    
                    table_data = []
                    for user in users['Users']:
                        username = user['Username']
                        status = user['UserStatus']
                        created = user['UserCreateDate'].strftime('%Y-%m-%d %H:%M')
                        
                        # Extract email from attributes
                        email = 'N/A'
                        for attr in user.get('Attributes', []):
                            if attr['Name'] == 'email':
                                email = attr['Value']
                        
                        table_data.append([username, email, status, created])
                    
                    headers = ['Username', 'Email', 'Status', 'Created']
                    print(tabulate(table_data, headers=headers, tablefmt='grid'))
                else:
                    print("No users found in pool")
            else:
                print("❌ AstroVoice user pool not found")
        except Exception as e:
            print(f"❌ Error accessing Cognito: {e}")
            print("💡 Make sure you have proper AWS credentials and permissions")
    
    def view_all(self):
        """View all data sources"""
        self.view_local_data()
        
        if self.aws_available:
            print("\n\n")
            self.view_aws_dynamodb()
            self.view_aws_s3_audio()
            self.view_aws_cognito_users()
        else:
            print("\n\n⚠️  AWS data not available. Configure AWS credentials to view cloud data.")
            print("   Run: aws configure")
    
    def get_statistics(self):
        """Get overall statistics"""
        print("\n" + "="*80)
        print("📊 OVERALL STATISTICS")
        print("="*80)
        
        stats = {
            'local_states': 0,
            'local_profiles': 0,
            'aws_connections': 0,
            'aws_users': 0,
            'total_audio_files': 0
        }
        
        # Count local data
        try:
            if os.path.exists(self.user_states_file):
                with open(self.user_states_file, 'r') as f:
                    stats['local_states'] = len(json.load(f))
            
            if os.path.exists(self.user_profiles_file):
                with open(self.user_profiles_file, 'r') as f:
                    stats['local_profiles'] = len(json.load(f))
        except Exception as e:
            print(f"Error reading local files: {e}")
        
        # Count AWS data
        if self.aws_available:
            try:
                # DynamoDB connections
                response = self.dynamodb.scan(TableName='astro-voice-websocket-connections')
                stats['aws_connections'] = len(response.get('Items', []))
            except:
                pass
            
            try:
                # Cognito users
                user_pools = self.cognito.list_user_pools(MaxResults=10)
                for pool in user_pools.get('UserPools', []):
                    if 'AstroVoice' in pool['Name']:
                        users = self.cognito.list_users(UserPoolId=pool['Id'])
                        stats['aws_users'] = len(users.get('Users', []))
                        break
            except:
                pass
            
            try:
                # S3 audio files
                buckets = self.s3.list_buckets()
                for bucket in buckets.get('Buckets', []):
                    if 'astro-voice-audio' in bucket['Name']:
                        response = self.s3.list_objects_v2(Bucket=bucket['Name'])
                        stats['total_audio_files'] = len(response.get('Contents', []))
                        break
            except:
                pass
        
        # Display stats
        print(f"""
📂 Local Storage:
   • User States: {stats['local_states']}
   • User Profiles: {stats['local_profiles']}

☁️  AWS Storage:
   • Active WebSocket Connections: {stats['aws_connections']}
   • Authenticated Users (Cognito): {stats['aws_users']}
   • Audio Files (S3): {stats['total_audio_files']}
""")


def main():
    parser = argparse.ArgumentParser(description='View AstroVoice user data across all storage systems')
    parser.add_argument('--source', choices=['local', 'aws', 'all'], default='all',
                       help='Data source to view (default: all)')
    parser.add_argument('--user', type=str, help='View detailed data for a specific user ID')
    parser.add_argument('--stats', action='store_true', help='Show statistics only')
    
    args = parser.parse_args()
    
    viewer = AWSUserDataViewer()
    
    if args.stats:
        viewer.get_statistics()
    elif args.user:
        viewer.view_user_detail(args.user)
    elif args.source == 'local':
        viewer.view_local_data()
    elif args.source == 'aws':
        if viewer.aws_available:
            viewer.view_aws_dynamodb()
            viewer.view_aws_s3_audio()
            viewer.view_aws_cognito_users()
        else:
            print("❌ AWS not configured. Run: aws configure")
    else:
        viewer.view_all()


if __name__ == "__main__":
    main()

