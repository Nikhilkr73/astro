#!/bin/bash
# Simple database initialization using psql via AWS Systems Manager Session Manager
# Alternative: Use RDS Data API or direct connection

echo "📝 To initialize database, run this locally with network access to RDS:"
echo ""
echo "DB_SECRET_ARN=\"arn:aws:secretsmanager:ap-south-1:677502935540:secret:AstroVoiceStackAstroVoiceDB-3e032wdi0ISh-B8mybW\""
echo "AWS_REGION=\"ap-south-1\""
echo ""
echo "# Get credentials"
echo "SECRET=\$(aws secretsmanager get-secret-value --secret-id \$DB_SECRET_ARN --region \$AWS_REGION --query SecretString --output text)"
echo ""
echo "# Connect and run schema"
echo "PGPASSWORD=\$(echo \$SECRET | python3 -c \"import sys,json; print(json.load(sys.stdin)['password'])\") \\"
echo "psql -h \$(echo \$SECRET | python3 -c \"import sys,json; print(json.load(sys.stdin)['host'])\") \\"
echo "     -U \$(echo \$SECRET | python3 -c \"import sys,json; print(json.load(sys.stdin)['username'])\") \\"
echo "     -d postgres \\"
echo "     -f backend/database/schema.sql"
