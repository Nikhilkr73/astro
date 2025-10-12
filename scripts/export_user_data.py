#!/usr/bin/env python3
"""
Export User Data to Various Formats
Export user data from local/AWS storage to JSON, CSV, or Excel
"""

import json
import csv
import os
from datetime import datetime
from typing import Dict, Any, List
import argparse
from dotenv import load_dotenv

load_dotenv()

class UserDataExporter:
    """Export user data in various formats"""
    
    def __init__(self):
        self.user_states_file = "user_states.json"
        self.user_profiles_file = "astrology_data/user_profiles.json"
        self.export_dir = "exports"
        
        # Create exports directory
        os.makedirs(self.export_dir, exist_ok=True)
    
    def load_local_data(self) -> Dict[str, Any]:
        """Load all local data"""
        data = {
            'user_states': {},
            'user_profiles': {}
        }
        
        try:
            if os.path.exists(self.user_states_file):
                with open(self.user_states_file, 'r') as f:
                    data['user_states'] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load user states: {e}")
        
        try:
            if os.path.exists(self.user_profiles_file):
                with open(self.user_profiles_file, 'r') as f:
                    data['user_profiles'] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load user profiles: {e}")
        
        return data
    
    def merge_user_data(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Merge user states and profiles into unified records"""
        merged = []
        
        # Get all unique user IDs
        all_users = set()
        all_users.update(data['user_states'].keys())
        all_users.update(data['user_profiles'].keys())
        
        for user_id in all_users:
            state = data['user_states'].get(user_id, {})
            profile = data['user_profiles'].get(user_id, {})
            
            # Merge data
            record = {
                'user_id': user_id,
                'name': profile.get('name') or state.get('name') or 'N/A',
                'birth_date': profile.get('birth_date') or state.get('birth_date') or 'N/A',
                'birth_time': profile.get('birth_time') or state.get('birth_time') or 'N/A',
                'birth_location': profile.get('birth_location') or state.get('birth_location') or 'N/A',
                'profile_complete': state.get('profile_complete', False),
                'subscription_type': profile.get('subscription_type', 'free'),
                'total_readings': profile.get('total_readings', 0),
                'created_at': profile.get('created_at', 'N/A'),
                'last_reading': profile.get('last_reading_date', 'N/A'),
                'email': profile.get('email', 'N/A'),
                'language': profile.get('language', 'en'),
                'preferred_system': profile.get('preferred_system', 'vedic')
            }
            
            merged.append(record)
        
        return merged
    
    def export_json(self, data: List[Dict[str, Any]], filename: str = None):
        """Export data as JSON"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"user_data_export_{timestamp}.json"
        
        filepath = os.path.join(self.export_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Exported to: {filepath}")
        print(f"   Total records: {len(data)}")
        return filepath
    
    def export_csv(self, data: List[Dict[str, Any]], filename: str = None):
        """Export data as CSV"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"user_data_export_{timestamp}.csv"
        
        filepath = os.path.join(self.export_dir, filename)
        
        if not data:
            print("⚠️  No data to export")
            return None
        
        # Get all keys from first record
        fieldnames = list(data[0].keys())
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"✅ Exported to: {filepath}")
        print(f"   Total records: {len(data)}")
        return filepath
    
    def export_summary(self, data: List[Dict[str, Any]], filename: str = None):
        """Export summary statistics"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"user_summary_{timestamp}.txt"
        
        filepath = os.path.join(self.export_dir, filename)
        
        # Calculate statistics
        total_users = len(data)
        complete_profiles = sum(1 for u in data if u.get('profile_complete'))
        total_readings = sum(u.get('total_readings', 0) for u in data)
        
        # Subscription breakdown
        subscriptions = {}
        for user in data:
            sub_type = user.get('subscription_type', 'free')
            subscriptions[sub_type] = subscriptions.get(sub_type, 0) + 1
        
        # Language breakdown
        languages = {}
        for user in data:
            lang = user.get('language', 'en')
            languages[lang] = languages.get(lang, 0) + 1
        
        # System preference breakdown
        systems = {}
        for user in data:
            sys = user.get('preferred_system', 'vedic')
            systems[sys] = systems.get(sys, 0) + 1
        
        # Create summary report
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("="*80 + "\n")
            f.write("ASTROVOICE USER DATA SUMMARY\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*80 + "\n\n")
            
            f.write("OVERVIEW\n")
            f.write("-"*80 + "\n")
            f.write(f"Total Users:              {total_users}\n")
            f.write(f"Complete Profiles:        {complete_profiles} ({complete_profiles/total_users*100:.1f}%)\n")
            f.write(f"Incomplete Profiles:      {total_users - complete_profiles}\n")
            f.write(f"Total Readings:           {total_readings}\n")
            f.write(f"Avg Readings per User:    {total_readings/total_users:.2f}\n\n")
            
            f.write("SUBSCRIPTION BREAKDOWN\n")
            f.write("-"*80 + "\n")
            for sub_type, count in sorted(subscriptions.items()):
                f.write(f"{sub_type.capitalize():20} {count:5} ({count/total_users*100:5.1f}%)\n")
            f.write("\n")
            
            f.write("LANGUAGE PREFERENCES\n")
            f.write("-"*80 + "\n")
            for lang, count in sorted(languages.items()):
                f.write(f"{lang:20} {count:5} ({count/total_users*100:5.1f}%)\n")
            f.write("\n")
            
            f.write("ASTROLOGY SYSTEM PREFERENCES\n")
            f.write("-"*80 + "\n")
            for sys, count in sorted(systems.items()):
                f.write(f"{sys.capitalize():20} {count:5} ({count/total_users*100:5.1f}%)\n")
            f.write("\n")
            
            f.write("TOP USERS BY READINGS\n")
            f.write("-"*80 + "\n")
            top_users = sorted(data, key=lambda x: x.get('total_readings', 0), reverse=True)[:10]
            for i, user in enumerate(top_users, 1):
                f.write(f"{i:2}. {user['name']:20} {user['total_readings']:3} readings\n")
        
        print(f"✅ Summary exported to: {filepath}")
        return filepath
    
    def export_single_user(self, user_id: str):
        """Export data for a single user"""
        data = self.load_local_data()
        
        user_data = {
            'user_id': user_id,
            'conversation_state': data['user_states'].get(user_id, {}),
            'profile': data['user_profiles'].get(user_id, {}),
            'exported_at': datetime.now().isoformat()
        }
        
        filename = f"user_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(self.export_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ User data exported to: {filepath}")
        return filepath


def main():
    parser = argparse.ArgumentParser(description='Export AstroVoice user data')
    parser.add_argument('--format', choices=['json', 'csv', 'summary', 'all'], 
                       default='json', help='Export format (default: json)')
    parser.add_argument('--user', type=str, help='Export specific user only')
    parser.add_argument('--output', type=str, help='Output filename')
    
    args = parser.parse_args()
    
    exporter = UserDataExporter()
    
    print("🚀 AstroVoice Data Exporter")
    print("="*80)
    
    if args.user:
        # Export single user
        print(f"\n📤 Exporting data for user: {args.user}")
        exporter.export_single_user(args.user)
    else:
        # Load and merge all data
        print("\n📥 Loading local data...")
        raw_data = exporter.load_local_data()
        
        print("🔄 Merging user records...")
        merged_data = exporter.merge_user_data(raw_data)
        
        print(f"✅ Loaded {len(merged_data)} user records")
        
        # Export based on format
        print(f"\n📤 Exporting as {args.format}...\n")
        
        if args.format == 'json' or args.format == 'all':
            exporter.export_json(merged_data, args.output if args.format == 'json' else None)
        
        if args.format == 'csv' or args.format == 'all':
            exporter.export_csv(merged_data, args.output if args.format == 'csv' else None)
        
        if args.format == 'summary' or args.format == 'all':
            exporter.export_summary(merged_data, args.output if args.format == 'summary' else None)
    
    print("\n✨ Export complete!")
    print(f"📁 Check the 'exports' directory for your files\n")


if __name__ == "__main__":
    main()

