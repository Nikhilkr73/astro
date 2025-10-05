# 🏗️ CDK Database Integration Guide

## ✅ Your Current Setup

Your AWS infrastructure is properly managed via CDK and deployed through CloudFormation:
- **Stack Name:** AstroVoiceStack
- **Status:** ✅ Deployed (UPDATE_COMPLETE)
- **Region:** ap-south-1 (Mumbai)

---

## 📊 Database Already in CDK

Your `astro-voice-aws-infra/lib/astro-voice-stack.ts` already includes:

```typescript
// PostgreSQL database (lines 68-83)
const database = new rds.DatabaseInstance(this, 'AstroVoiceDB', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_14,
  }),
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
  vpc,
  securityGroups: [dbSecurityGroup],
  credentials: rds.Credentials.fromGeneratedSecret('astrovoice_admin'),
  allocatedStorage: 20,
  storageEncrypted: true,
  backupRetention: cdk.Duration.days(7),
});
```

✅ **No need to create manually - already deployed!**

---

## 🎯 What You Need: Initialize Schema Only

Since the database is already created by CDK, you just need to:

### **1. Get Credentials from Secrets Manager**
```bash
./get_aws_db_credentials.sh
```

### **2. Run Schema SQL**
```bash
# Option A: Via Python
python3 database_manager.py

# Option B: Via psql (if you have access)
psql -h <endpoint> -U astrovoice_admin -d postgres -f database_schema.sql
```

### **3. Use Database**
```python
from database_manager import db
db.create_user({...})
```

---

## 🔄 Updating CDK for Schema Initialization

If you want CDK to automatically initialize the schema, add this to your stack:

```typescript
// Add to astro-voice-stack.ts after database creation

// Lambda function to initialize database schema
const dbInitLambda = new lambda.Function(this, 'DbInitFunction', {
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda/db-init'),
  vpc: vpc,
  securityGroups: [lambdaSecurityGroup],
  environment: {
    DB_SECRET_ARN: database.secret!.secretArn,
    DB_ENDPOINT: database.instanceEndpoint.hostname,
  },
  timeout: cdk.Duration.minutes(2),
});

database.secret?.grantRead(dbInitLambda);

// Custom resource to run on deploy
new cdk.CustomResource(this, 'DbInitCustomResource', {
  serviceToken: dbInitLambda.functionArn,
  properties: {
    Version: Date.now().toString(), // Force run on each deploy
  },
});
```

---

## 📝 Best Practice: Keep Schema in Version Control

Your current approach is good:
- ✅ `database_schema.sql` in repo
- ✅ `database_manager.py` for operations
- ✅ CDK manages infrastructure
- ✅ Manual schema initialization (gives you control)

**Recommended workflow:**
1. CDK creates database (done ✅)
2. Manual schema init after deploy
3. Future changes via migration scripts

---

## 🔐 Accessing Database

Your database is in a **private VPC** (secure! ✅), so you have options:

### **Option 1: Bastion Host (Recommended)**
Add to CDK:
```typescript
const bastion = new ec2.BastionHostLinux(this, 'Bastion', {
  vpc,
  subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
});

dbSecurityGroup.addIngressRule(
  bastion.connections.securityGroups[0],
  ec2.Port.tcp(5432)
);
```

### **Option 2: Lambda Function (For Operations)**
Your Lambda functions already have access! Use them to:
- Initialize schema
- Run migrations
- Perform database operations

### **Option 3: Temporary Public Access (Dev Only)**
```bash
# Make publicly accessible temporarily
aws rds modify-db-instance \
  --db-instance-identifier <your-db-id> \
  --publicly-accessible \
  --region ap-south-1

# Don't forget to revert!
```

---

## 🚀 Quick Start

```bash
# 1. Get credentials
./get_aws_db_credentials.sh

# 2. Initialize schema
python3 database_manager.py

# 3. Done!
```

---

**Status:** Infrastructure ✅ | Schema ⏭️ Needs initialization

