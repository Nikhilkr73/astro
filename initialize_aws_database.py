#!/usr/bin/env python3
"""
Initialize AWS RDS Database Schema
Connects to AWS RDS PostgreSQL and runs the schema file
"""

import os
import json
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_credentials():
    """Get database credentials from AWS Secrets Manager"""
    secret_name = "AstroVoiceStackAstroVoiceDB-3e032wdi0ISh"
    region = "ap-south-1"
    
    print(f"🔑 Fetching credentials from AWS Secrets Manager...")
    print(f"   Secret: {secret_name}")
    print(f"   Region: {region}")
    
    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        
        secret = json.loads(get_secret_value_response['SecretString'])
        print(f"✅ Credentials retrieved successfully")
        
        # The database name is set in CDK to 'astrovoice' but not in secret
        # Default PostgreSQL database is 'postgres', but we'll try 'astrovoice' first
        database = secret.get('dbname', 'astrovoice')
        
        return {
            'host': secret['host'],
            'port': secret['port'],
            'database': database,
            'user': secret['username'],
            'password': secret['password']
        }
    except Exception as e:
        print(f"❌ Error retrieving credentials: {e}")
        raise

def check_database_initialized(conn):
    """Check if database schema is already initialized"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            return [table['table_name'] for table in tables]
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return []

def initialize_schema(conn, schema_file='database_schema.sql'):
    """Initialize database schema from SQL file"""
    print(f"\n📄 Reading schema file: {schema_file}")
    
    try:
        with open(schema_file, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        print(f"✅ Schema file loaded ({len(schema_sql)} characters)")
        
        # Execute schema
        with conn.cursor() as cursor:
            print(f"🔧 Executing schema SQL...")
            cursor.execute(schema_sql)
            conn.commit()
            print(f"✅ Schema executed successfully")
        
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Error executing schema: {e}")
        raise

def main():
    print("=" * 70)
    print("🚀 AWS RDS Database Schema Initialization")
    print("=" * 70)
    
    # Get credentials
    try:
        creds = get_db_credentials()
    except Exception as e:
        print(f"\n❌ Failed to get credentials: {e}")
        return 1
    
    # Connect to database
    print(f"\n🔌 Connecting to database...")
    print(f"   Host: {creds['host']}")
    print(f"   Database: {creds['database']}")
    print(f"   User: {creds['user']}")
    
    try:
        conn = psycopg2.connect(**creds)
        print(f"✅ Connected to database successfully")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return 1
    
    # Check existing tables
    print(f"\n🔍 Checking existing tables...")
    existing_tables = check_database_initialized(conn)
    
    if existing_tables:
        print(f"📋 Found {len(existing_tables)} existing tables:")
        for table in existing_tables:
            print(f"   • {table}")
        
        print(f"\n⚠️  Database already has tables.")
        response = input("Do you want to re-run the schema? (y/N): ")
        
        if response.lower() != 'y':
            print(f"❌ Initialization cancelled")
            conn.close()
            return 0
    else:
        print(f"✅ Database is empty - ready for initialization")
    
    # Initialize schema
    try:
        initialize_schema(conn, 'database_schema.sql')
        
        # Verify tables created
        print(f"\n✅ Verifying schema initialization...")
        tables = check_database_initialized(conn)
        print(f"📋 Created {len(tables)} tables:")
        for table in tables:
            print(f"   • {table}")
        
        # Check sample data
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM astrologers")
            astrologer_count = cursor.fetchone()['count']
            print(f"\n📊 Sample data:")
            print(f"   • Astrologers: {astrologer_count}")
        
        print(f"\n🎉 Database initialization complete!")
        print(f"\n📍 Database endpoint: {creds['host']}")
        print(f"📍 Database name: {creds['database']}")
        
    except Exception as e:
        print(f"\n❌ Initialization failed: {e}")
        return 1
    finally:
        conn.close()
        print(f"\n🔌 Database connection closed")
    
    print("\n" + "=" * 70)
    print("✅ Initialization completed successfully!")
    print("=" * 70)
    return 0

if __name__ == "__main__":
    exit(main())

