# AWS Deployment Instructions

## Prerequisites

### 1. Docker Desktop Required ⚠️

CDK needs Docker to bundle Lambda function code.

**Install & Start Docker:**
```bash
# Install Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Start Docker Desktop (macOS)
open -a Docker

# Wait for Docker to fully start (check system tray/status)
docker ps  # Should work without errors
```

### 2. AWS CLI Configured

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Default region: ap-south-1
# Default output: json
```

### 3. CDK Bootstrapped

```bash
cd infrastructure
npx cdk bootstrap aws://677502935540/ap-south-1
```

## Deployment Steps

### Step 1: Start Docker

```bash
# Make sure Docker Desktop is running
docker ps
```

### Step 2: Deploy

```bash
cd infrastructure
npx aws-cdk deploy --require-approval never
```

**This will:**
- Bundle Lambda functions using Docker
- Deploy API Gateway endpoints
- Create/update AWS resources
- Take 5-10 minutes

### Step 3: Test Endpoints

```bash
cd ..
./test_aws_api.sh
```

## Troubleshooting

### Error: "spawnSync docker ENOENT"
**Solution:** Start Docker Desktop

### Error: "CDK not bootstrapped"
**Solution:** Run `npx cdk bootstrap aws://677502935540/ap-south-1`

### Error: "AWS credentials not configured"
**Solution:** Run `aws configure`

