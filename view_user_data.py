#!/usr/bin/env python3
"""
User Data Viewer for AstroVoice
Comprehensive tool to view and manage user data from the database
"""

import sys
import os
from datetime import datetime
from typing import List, Dict, Any

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.database.manager import db
except ImportError:
    from database_manager import DatabaseManager
    db = DatabaseManager()


def get_all_users(limit: int = 50) -> List[Dict]:
    """Get all users from database"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT user_id, full_name, phone_number, email, 
                           birth_date, birth_time, birth_location, gender,
                           language_preference, subscription_type, 
                           created_at, updated_at, metadata
                    FROM users 
                    ORDER BY created_at DESC 
                    LIMIT %s
                """, (limit,))
                
                columns = [desc[0] for desc in cursor.description]
                users = []
                for row in cursor.fetchall():
                    user_dict = dict(zip(columns, row))
                    users.append(user_dict)
                return users
    except Exception as e:
        print(f"❌ Error getting users: {e}")
        return []


def get_user_by_id(user_id: str) -> Dict:
    """Get specific user by ID"""
    return db.get_user(user_id)


def get_user_wallet(user_id: str) -> Dict:
    """Get user wallet information"""
    return db.get_wallet(user_id)


def get_user_transactions(user_id: str, limit: int = 20) -> List[Dict]:
    """Get user transaction history"""
    return db.get_user_transactions(user_id, limit)


def analyze_customer_id_format():
    """Analyze the customer ID format and scalability"""
    print("🔍 CUSTOMER ID FORMAT ANALYSIS")
    print("=" * 60)
    
    users = get_all_users(20)
    
    print("📊 Current Customer ID Patterns:")
    patterns = {}
    
    for user in users:
        user_id = user['user_id']
        
        if user_id.startswith('user_'):
            # Extract the part after 'user_'
            suffix = user_id[5:]  # Remove 'user_' prefix
            
            if suffix.isdigit():
                pattern = "Phone Number"
            elif len(suffix) == 12 and all(c in '0123456789abcdef' for c in suffix):
                pattern = "UUID Hex"
            elif len(suffix) > 12 and all(c in '0123456789abcdef' for c in suffix):
                pattern = "UUID Hex (Long)"
            else:
                pattern = "Other"
        else:
            pattern = "Custom"
        
        if pattern not in patterns:
            patterns[pattern] = []
        patterns[pattern].append(user_id)
    
    for pattern, ids in patterns.items():
        print(f"\n🔸 {pattern} Pattern ({len(ids)} users):")
        for user_id in ids[:5]:  # Show first 5 examples
            print(f"   • {user_id}")
        if len(ids) > 5:
            print(f"   ... and {len(ids) - 5} more")
    
    print(f"\n📈 SCALABILITY ANALYSIS:")
    print(f"   • Total users analyzed: {len(users)}")
    print(f"   • Pattern types: {len(patterns)}")
    
    # Check UUID implementation
    uuid_ids = patterns.get("UUID Hex", []) + patterns.get("UUID Hex (Long)", [])
    phone_based_ids = patterns.get("Phone Number", [])
    
    if uuid_ids:
        print(f"\n✅ UUID IMPLEMENTATION:")
        print(f"   • UUID-based IDs: {len(uuid_ids)}")
        print(f"   • Scalability: Excellent (globally unique)")
        print(f"   • Conflict risk: Virtually zero")
    
    if phone_based_ids:
        print(f"\n⚠️  LEGACY ISSUES:")
        print(f"   • Phone-based IDs: {len(phone_based_ids)}")
        print(f"   • Risk: Multiple users with same phone = ID conflicts")
        print(f"   • Recommendation: Migrate to UUID-based IDs")
    
    print(f"\n🎯 RECOMMENDATIONS:")
    print(f"   • ✅ New users: Use UUID-based IDs (implemented)")
    print(f"   • 🔄 Legacy users: Consider migration to UUID")
    print(f"   • 📊 Monitoring: Track ID pattern distribution")


def display_user_details(user_id: str):
    """Display comprehensive user details"""
    print(f"\n👤 USER DETAILS: {user_id}")
    print("=" * 60)
    
    # Get user data
    user_data = get_user_by_id(user_id)
    if not user_data:
        print("❌ User not found")
        return
    
    # Basic info
    print(f"📋 BASIC INFORMATION:")
    print(f"   • User ID: {user_data.get('user_id', 'N/A')}")
    print(f"   • Full Name: {user_data.get('full_name', 'N/A')}")
    print(f"   • Display Name: {user_data.get('display_name', 'N/A')}")
    print(f"   • Phone: {user_data.get('phone_number', 'N/A')}")
    print(f"   • Email: {user_data.get('email', 'N/A')}")
    print(f"   • Gender: {user_data.get('gender', 'N/A')}")
    print(f"   • Language: {user_data.get('language_preference', 'N/A')}")
    
    # Birth info
    print(f"\n🎂 BIRTH INFORMATION:")
    print(f"   • Birth Date: {user_data.get('birth_date', 'N/A')}")
    print(f"   • Birth Time: {user_data.get('birth_time', 'N/A')}")
    print(f"   • Birth Location: {user_data.get('birth_location', 'N/A')}")
    print(f"   • Birth Timezone: {user_data.get('birth_timezone', 'N/A')}")
    
    # Account info
    print(f"\n🔐 ACCOUNT INFORMATION:")
    print(f"   • Subscription: {user_data.get('subscription_type', 'N/A')}")
    print(f"   • Status: {user_data.get('account_status', 'N/A')}")
    print(f"   • Email Verified: {user_data.get('email_verified', False)}")
    print(f"   • Phone Verified: {user_data.get('phone_verified', False)}")
    print(f"   • Created: {user_data.get('created_at', 'N/A')}")
    print(f"   • Updated: {user_data.get('updated_at', 'N/A')}")
    print(f"   • Last Login: {user_data.get('last_login_at', 'N/A')}")
    
    # Metadata
    metadata = user_data.get('metadata', {})
    if metadata:
        print(f"\n📊 METADATA:")
        for key, value in metadata.items():
            print(f"   • {key}: {value}")
    
    # Wallet info
    wallet_data = get_user_wallet(user_id)
    if wallet_data:
        print(f"\n💰 WALLET INFORMATION:")
        print(f"   • Wallet ID: {wallet_data.get('wallet_id', 'N/A')}")
        print(f"   • Balance: ₹{wallet_data.get('balance', 0)}")
        print(f"   • Currency: {wallet_data.get('currency', 'N/A')}")
        print(f"   • Created: {wallet_data.get('created_at', 'N/A')}")
        print(f"   • Updated: {wallet_data.get('updated_at', 'N/A')}")
    
    # Transaction history
    transactions = get_user_transactions(user_id, 5)
    if transactions:
        print(f"\n💳 RECENT TRANSACTIONS:")
        for txn in transactions:
            print(f"   • {txn.get('transaction_type', 'N/A')}: ₹{txn.get('amount', 0)} - {txn.get('created_at', 'N/A')}")


def execute_sql_query(query: str):
    """Execute SQL query and display results"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                
                if cursor.description:
                    # Fetch column names
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    if rows:
                        # Display results in table format
                        print(f"\n🔍 SQL QUERY RESULTS")
                        print("=" * 80)
                        print(f"Query: {query}")
                        print()
                        
                        # Simple table display
                        col_widths = [max(len(str(row[i])) for row in rows + [columns]) for i in range(len(columns))]
                        
                        # Header
                        header = "│ " + " │ ".join(f"{col:<{col_widths[i]}}" for i, col in enumerate(columns)) + " │"
                        separator = "├─" + "─┼─".join("─" * col_widths[i] for i in range(len(columns))) + "─┤"
                        top_border = "┌─" + "─┬─".join("─" * col_widths[i] for i in range(len(columns))) + "─┐"
                        bottom_border = "└─" + "─┴─".join("─" * col_widths[i] for i in range(len(columns))) + "─┘"
                        
                        print(top_border)
                        print(header)
                        print(separator)
                        
                        # Data rows
                        for row in rows:
                            row_str = "│ " + " │ ".join(f"{str(row[i]):<{col_widths[i]}}" for i in range(len(row))) + " │"
                            print(row_str)
                        
                        print(bottom_border)
                        print(f"\n📊 {len(rows)} rows returned")
                    else:
                        print(f"\n🔍 SQL QUERY RESULTS")
                        print("=" * 80)
                        print(f"Query: {query}")
                        print("\n✅ Query executed successfully (no results)")
                else:
                    print(f"\n🔍 SQL QUERY RESULTS")
                    print("=" * 80)
                    print(f"Query: {query}")
                    print("\n✅ Query executed successfully")
                    
    except Exception as e:
        print(f"\n❌ SQL Error: {e}")
        print(f"Query: {query}")


def list_tables():
    """List all database tables"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT table_name, 
                           (SELECT COUNT(*) FROM information_schema.columns 
                            WHERE table_name = t.table_name) as column_count
                    FROM information_schema.tables t
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
                tables = cursor.fetchall()
                
                print(f"\n🗄️  DATABASE TABLES")
                print("=" * 60)
                for table_name, column_count in tables:
                    print(f"  • {table_name} ({column_count} columns)")
                    
    except Exception as e:
        print(f"❌ Error listing tables: {e}")


def show_table_schema(table_name: str):
    """Show schema for a specific table"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = %s AND table_schema = 'public'
                    ORDER BY ordinal_position
                """, (table_name,))
                
                columns = cursor.fetchall()
                
                if columns:
                    print(f"\n📋 TABLE SCHEMA: {table_name}")
                    print("=" * 80)
                    print(f"{'Column':<20} {'Type':<20} {'Nullable':<10} {'Default'}")
                    print("-" * 80)
                    for col_name, data_type, nullable, default in columns:
                        default_str = str(default) if default else "None"
                        print(f"{col_name:<20} {data_type:<20} {nullable:<10} {default_str}")
                else:
                    print(f"❌ Table '{table_name}' not found")
                    
    except Exception as e:
        print(f"❌ Error showing schema: {e}")


def export_to_csv(query: str, filename: str = None):
    """Export SQL query results to CSV file"""
    import csv
    from datetime import datetime
    
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_{timestamp}.csv"
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                
                if cursor.description:
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                        writer = csv.writer(csvfile)
                        writer.writerow(columns)  # Header
                        writer.writerows(rows)
                    
                    print(f"✅ Data exported to: {filename}")
                    print(f"📊 {len(rows)} rows exported")
                    print(f"📁 File location: {os.path.abspath(filename)}")
                else:
                    print("❌ No data to export")
                    
    except Exception as e:
        print(f"❌ Export error: {e}")


def export_to_json(query: str, filename: str = None):
    """Export SQL query results to JSON file"""
    import json
    from datetime import datetime
    
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_{timestamp}.json"
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                
                if cursor.description:
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    # Convert to list of dictionaries
                    data = []
                    for row in rows:
                        row_dict = {}
                        for i, value in enumerate(row):
                            # Convert datetime objects to strings
                            if hasattr(value, 'isoformat'):
                                row_dict[columns[i]] = value.isoformat()
                            else:
                                row_dict[columns[i]] = value
                        data.append(row_dict)
                    
                    with open(filename, 'w', encoding='utf-8') as jsonfile:
                        json.dump(data, jsonfile, indent=2, ensure_ascii=False)
                    
                    print(f"✅ Data exported to: {filename}")
                    print(f"📊 {len(data)} rows exported")
                    print(f"📁 File location: {os.path.abspath(filename)}")
                else:
                    print("❌ No data to export")
                    
    except Exception as e:
        print(f"❌ Export error: {e}")


def main():
    """Main function"""
    print("🔮 AstroVoice User Data Viewer")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "list":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
            users = get_all_users(limit)
            
            print(f"\n📊 ALL USERS (showing {len(users)} of latest)")
            print("-" * 60)
            
            for user in users:
                print(f"• {user['user_id']} - {user['full_name']} ({user['phone_number']}) - {user['created_at']}")
        
        elif command == "show":
            if len(sys.argv) > 2:
                user_id = sys.argv[2]
                display_user_details(user_id)
            else:
                print("❌ Please provide user ID: python3 view_user_data.py show <user_id>")
        
        elif command == "analyze":
            analyze_customer_id_format()
        
        elif command == "--sql":
            if len(sys.argv) > 2:
                query = sys.argv[2]
                execute_sql_query(query)
            else:
                print("❌ Please provide SQL query: python3 view_user_data.py --sql \"SELECT * FROM users\"")
        
        elif command == "--export-csv":
            if len(sys.argv) > 2:
                query = sys.argv[2]
                filename = sys.argv[3] if len(sys.argv) > 3 else None
                export_to_csv(query, filename)
            else:
                print("❌ Please provide SQL query: python3 view_user_data.py --export-csv \"SELECT * FROM users\"")
        
        elif command == "--export-json":
            if len(sys.argv) > 2:
                query = sys.argv[2]
                filename = sys.argv[3] if len(sys.argv) > 3 else None
                export_to_json(query, filename)
            else:
                print("❌ Please provide SQL query: python3 view_user_data.py --export-json \"SELECT * FROM users\"")
        
        elif command == "--tables":
            list_tables()
        
        elif command == "--schema":
            if len(sys.argv) > 2:
                table_name = sys.argv[2]
                show_table_schema(table_name)
            else:
                print("❌ Please provide table name: python3 view_user_data.py --schema users")
        
        else:
            print("❌ Unknown command. Available commands:")
            print("   • list [limit] - List all users")
            print("   • show <user_id> - Show detailed user info")
            print("   • analyze - Analyze customer ID format")
            print("   • --sql \"QUERY\" - Execute SQL query")
            print("   • --export-csv \"QUERY\" [filename] - Export to CSV")
            print("   • --export-json \"QUERY\" [filename] - Export to JSON")
            print("   • --tables - List all database tables")
            print("   • --schema <table> - Show table schema")
    
    else:
        print("📋 Available Commands:")
        print("   • python3 view_user_data.py list [limit]")
        print("   • python3 view_user_data.py show <user_id>")
        print("   • python3 view_user_data.py analyze")
        print("   • python3 view_user_data.py --sql \"SELECT * FROM users\"")
        print("   • python3 view_user_data.py --export-csv \"SELECT * FROM users\"")
        print("   • python3 view_user_data.py --export-json \"SELECT * FROM users\"")
        print("   • python3 view_user_data.py --tables")
        print("   • python3 view_user_data.py --schema users")
        print("\n💡 Examples:")
        print("   • python3 view_user_data.py list 10")
        print("   • python3 view_user_data.py show user_test_success")
        print("   • python3 view_user_data.py analyze")
        print("   • python3 view_user_data.py --sql \"SELECT gender, COUNT(*) FROM users GROUP BY gender\"")
        print("   • python3 view_user_data.py --export-csv \"SELECT * FROM users\" users.csv")
        print("   • python3 view_user_data.py --export-json \"SELECT * FROM users\" users.json")
        print("   • python3 view_user_data.py --tables")
        print("   • python3 view_user_data.py --schema wallets")


if __name__ == "__main__":
    main()