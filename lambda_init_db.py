"""
AWS Lambda function to initialize database schema
Deploy this to Lambda to run schema initialization from within VPC
"""

import json
import boto3
import psycopg2

def get_db_credentials(secret_arn):
    """Get database credentials from AWS Secrets Manager"""
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_arn)
    secret = json.loads(response['SecretString'])
    
    return {
        'host': secret['host'],
        'port': secret['port'],
        'database': secret.get('dbname', 'astrovoice'),
        'user': secret['username'],
        'password': secret['password']
    }

def lambda_handler(event, context):
    """Lambda handler to initialize database"""
    
    # Get secret ARN from environment or event
    secret_arn = event.get('secret_arn', 'AstroVoiceStackAstroVoiceDB-3e032wdi0ISh')
    
    try:
        # Get credentials
        creds = get_db_credentials(secret_arn)
        
        # Connect to database
        conn = psycopg2.connect(**creds)
        
        # Check existing tables
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            existing_tables = [row[0] for row in cursor.fetchall()]
        
        if existing_tables:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Database already initialized',
                    'tables': existing_tables,
                    'count': len(existing_tables)
                })
            }
        
        # Read and execute schema
        # Note: In production, read schema from S3 or include in deployment package
        schema_sql = open('database_schema.sql', 'r').read()
        
        with conn.cursor() as cursor:
            cursor.execute(schema_sql)
            conn.commit()
        
        # Verify tables created
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            created_tables = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Database schema initialized successfully',
                'tables': created_tables,
                'count': len(created_tables)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to initialize database'
            })
        }

