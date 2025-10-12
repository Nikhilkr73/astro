#!/bin/bash
# Get AWS RDS Database Credentials from Secrets Manager

echo "=========================================================================="
echo "🔍 Fetching AWS Database Credentials"
echo "=========================================================================="
echo ""

# Get secret name
SECRET_NAME="AstroVoiceStackAstroVoiceDB-3e032wdi0ISh"
REGION="ap-south-1"

# Get database endpoint from CloudFormation
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name AstroVoiceStack \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text 2>/dev/null)

echo "📍 Database Endpoint: $DB_ENDPOINT"
echo ""

# Get secret value
echo "🔐 Retrieving credentials from AWS Secrets Manager..."
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id $SECRET_NAME \
  --region $REGION \
  --query SecretString \
  --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    # Parse JSON
    DB_USERNAME=$(echo $SECRET_JSON | jq -r '.username')
    DB_PASSWORD=$(echo $SECRET_JSON | jq -r '.password')
    DB_NAME=$(echo $SECRET_JSON | jq -r '.dbname // "postgres"')
    DB_PORT=$(echo $SECRET_JSON | jq -r '.port // "5432"')
    
    echo "✅ Credentials retrieved successfully!"
    echo ""
    echo "=========================================================================="
    echo "📋 Database Connection Details"
    echo "=========================================================================="
    echo ""
    echo "Host:     $DB_ENDPOINT"
    echo "Port:     $DB_PORT"
    echo "Database: $DB_NAME"
    echo "Username: $DB_USERNAME"
    echo "Password: ${DB_PASSWORD:0:4}****"
    echo ""
    
    # Update .env file
    echo "📝 Updating .env file..."
    
    # Backup existing .env
    if [ -f .env ]; then
        cp .env .env.backup
        echo "✅ Backed up existing .env to .env.backup"
    fi
    
    # Add/update database configuration
    {
        # Keep existing content
        if [ -f .env ]; then
            grep -v "^DB_HOST=" .env | grep -v "^DB_PORT=" | grep -v "^DB_NAME=" | grep -v "^DB_USER=" | grep -v "^DB_PASSWORD="
        fi
        
        # Add database config
        echo ""
        echo "# AWS RDS PostgreSQL Database Configuration"
        echo "DB_HOST=$DB_ENDPOINT"
        echo "DB_PORT=$DB_PORT"
        echo "DB_NAME=$DB_NAME"
        echo "DB_USER=$DB_USERNAME"
        echo "DB_PASSWORD=$DB_PASSWORD"
    } > .env.tmp && mv .env.tmp .env
    
    echo "✅ .env file updated with AWS database credentials"
    echo ""
    
    # Test connection
    echo "=========================================================================="
    echo "🧪 Testing Database Connection"
    echo "=========================================================================="
    echo ""
    
    python3 - <<EOF
import psycopg2
import sys

try:
    conn = psycopg2.connect(
        host='$DB_ENDPOINT',
        port='$DB_PORT',
        database='$DB_NAME',
        user='$DB_USERNAME',
        password='$DB_PASSWORD',
        connect_timeout=10
    )
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    version = cursor.fetchone()[0]
    print(f"✅ Database connection successful!")
    print(f"📊 PostgreSQL version: {version.split(',')[0]}")
    cursor.close()
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("")
    print("💡 Common issues:")
    print("   1. Security group not allowing your IP")
    print("   2. Database not publicly accessible")
    print("   3. VPC/subnet configuration")
    sys.exit(1)
EOF
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================================================="
        echo "✅ Setup Complete!"
        echo "=========================================================================="
        echo ""
        echo "You can now:"
        echo "  1. Initialize database schema: python3 database_manager.py"
        echo "  2. Test database operations: python3 -c 'from database_manager import db; print(db.get_all_astrologers())'"
        echo ""
    else
        echo ""
        echo "=========================================================================="
        echo "⚠️  Connection Test Failed"
        echo "=========================================================================="
        echo ""
        echo "Your credentials are saved in .env, but connection failed."
        echo "This might be due to:"
        echo "  • Security group restrictions"
        echo "  • VPC configuration (database in private subnet)"
        echo "  • Need to use bastion host or VPN"
        echo ""
        echo "To connect, you may need to:"
        echo "  1. Add your IP to security group"
        echo "  2. Make database publicly accessible (not recommended for production)"
        echo "  3. Use AWS Systems Manager Session Manager or bastion host"
        echo ""
    fi
    
else
    echo "❌ Failed to retrieve secret from AWS"
    echo ""
    echo "Please check:"
    echo "  1. AWS credentials are configured: aws configure"
    echo "  2. You have permissions to read secrets"
    echo "  3. The secret name is correct"
fi

