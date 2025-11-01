#!/usr/bin/env python3
"""
Initialize AWS RDS Database Schema
Connects to AWS RDS PostgreSQL and initializes the schema
Can be run locally or as a Lambda function
"""

import os
import json
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
import sys

def get_db_credentials():
    """Get database credentials from AWS Secrets Manager or environment variables"""
    db_secret_arn = os.getenv("DB_SECRET_ARN")
    
    if db_secret_arn:
        try:
            print(f"🔑 Fetching credentials from AWS Secrets Manager...")
            print(f"   Secret ARN: {db_secret_arn}")
            
            region = os.getenv('AWS_REGION', 'ap-south-1')
            client = boto3.client('secretsmanager', region_name=region)
            response = client.get_secret_value(SecretId=db_secret_arn)
            secret = json.loads(response['SecretString'])
            
            db_user = secret.get('username') or secret.get('user', '')
            
            return {
                'host': secret['host'],
                'port': int(secret.get('port', 5432)),
                'database': secret.get('dbname', secret.get('database', 'postgres')),
                'user': db_user,
                'password': secret['password']
            }
        except Exception as e:
            print(f"❌ Error retrieving credentials from Secrets Manager: {e}")
            raise
    else:
        # Fallback to environment variables
        return {
            'host': os.getenv("DB_HOST", "localhost"),
            'port': int(os.getenv("DB_PORT", "5432")),
            'database': os.getenv("DB_NAME", "postgres"),
            'user': os.getenv("DB_USER", "postgres"),
            'password': os.getenv("DB_PASSWORD", "")
        }

def read_schema_file():
    """Read the database schema SQL file"""
    # Try to find schema.sql in multiple locations
    schema_paths = [
        'backend/database/schema.sql',
        './schema.sql',
        '/var/task/backend/database/schema.sql',
        os.path.join(os.path.dirname(__file__), 'backend/database/schema.sql')
    ]
    
    for path in schema_paths:
        if os.path.exists(path):
            print(f"📄 Reading schema from: {path}")
            with open(path, 'r') as f:
                return f.read()
    
    raise FileNotFoundError("Could not find schema.sql file")

def create_database_if_not_exists(conn, db_name):
    """Create database if it doesn't exist"""
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("""
        SELECT 1 FROM pg_database WHERE datname = %s
    """, (db_name,))
    
    if cursor.fetchone():
        print(f"✅ Database '{db_name}' already exists")
        return
    
    # Create database
    try:
        cursor.execute(f'CREATE DATABASE {db_name}')
        print(f"✅ Created database '{db_name}'")
    except Exception as e:
        print(f"⚠️  Could not create database '{db_name}': {e}")
        print(f"   Continuing with existing database...")
    
    cursor.close()
    conn.autocommit = False

def initialize_schema(conn, schema_sql):
    """Initialize database schema"""
    cursor = conn.cursor()
    
    try:
        # Split SQL by semicolons and execute each statement
        statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
        
        print(f"📝 Executing {len(statements)} SQL statements...")
        
        for i, statement in enumerate(statements, 1):
            if statement.strip():
                try:
                    cursor.execute(statement)
                    if 'CREATE TABLE' in statement.upper():
                        table_name = statement.split()[2] if len(statement.split()) > 2 else "unknown"
                        print(f"   [{i}/{len(statements)}] ✅ Created table: {table_name}")
                    elif 'CREATE INDEX' in statement.upper():
                        print(f"   [{i}/{len(statements)}] ✅ Created index")
                    elif 'CREATE SEQUENCE' in statement.upper():
                        print(f"   [{i}/{len(statements)}] ✅ Created sequence")
                except Exception as e:
                    # Ignore "already exists" errors
                    if 'already exists' in str(e).lower() or 'duplicate' in str(e).lower():
                        print(f"   [{i}/{len(statements)}] ⚠️  Already exists (skipping)")
                    else:
                        print(f"   [{i}/{len(statements)}] ❌ Error: {e}")
                        raise
        
        conn.commit()
        print("✅ Schema initialization completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error initializing schema: {e}")
        raise
    finally:
        cursor.close()

def verify_schema(conn):
    """Verify that required tables exist"""
    cursor = conn.cursor()
    
    required_tables = ['users', 'wallets', 'conversations', 'messages', 'otp_verifications', 'astrologers', 'transactions']
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    
    existing_tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    
    print("\n📊 Database Tables:")
    for table in required_tables:
        if table in existing_tables:
            print(f"   ✅ {table}")
        else:
            print(f"   ❌ {table} - MISSING")
    
    missing = [t for t in required_tables if t not in existing_tables]
    if missing:
        print(f"\n⚠️  Warning: {len(missing)} required table(s) missing: {', '.join(missing)}")
    else:
        print(f"\n✅ All required tables exist!")

def main():
    """Main initialization function"""
    print("🚀 Initializing AstroVoice RDS Database Schema")
    print("=" * 60)
    
    try:
        # Get database credentials
        db_config = get_db_credentials()
        print(f"📡 Connecting to: {db_config['host']}:{db_config['port']}")
        print(f"   Database: {db_config['database']}")
        print(f"   User: {db_config['user']}")
        
        # First connect to 'postgres' database to create 'astrovoice' if needed
        if db_config['database'] != 'postgres':
            postgres_config = db_config.copy()
            postgres_config['database'] = 'postgres'
            
            conn_postgres = psycopg2.connect(**postgres_config)
            create_database_if_not_exists(conn_postgres, db_config['database'])
            conn_postgres.close()
        
        # Connect to target database
        conn = psycopg2.connect(**db_config)
        print("✅ Connected to database")
        
        # Read and execute schema
        schema_sql = read_schema_file()
        initialize_schema(conn, schema_sql)
        
        # Verify schema
        verify_schema(conn)
        
        conn.close()
        print("\n🎉 Database initialization completed successfully!")
        return 0
        
    except Exception as e:
        print(f"\n❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
