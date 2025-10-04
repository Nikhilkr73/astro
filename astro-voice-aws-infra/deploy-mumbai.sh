#!/bin/bash

# AWS Deployment Script for AstroVoice - Mumbai Region (ap-south-1)
# Account ID: 677502935540

echo "🚀 Deploying AstroVoice to AWS Mumbai Region (ap-south-1)"
echo "Account ID: 677502935540"
echo "=================================================="

# Set AWS environment variables for Mumbai region
export AWS_REGION=ap-south-1
export CDK_DEFAULT_REGION=ap-south-1
export CDK_DEFAULT_ACCOUNT=677502935540

# Check if AWS CLI is configured
echo "🔍 Checking AWS CLI configuration..."
aws sts get-caller-identity --region ap-south-1

if [ $? -ne 0 ]; then
    echo "❌ AWS CLI not configured or incorrect credentials"
    echo "Please run: aws configure"
    echo "Or check your AWS credentials"
    exit 1
fi

echo "✅ AWS CLI configured successfully"

# Check if CDK is bootstrapped for this account/region
echo "🔍 Checking CDK bootstrap status..."
aws cloudformation describe-stacks --stack-name CDKToolkit --region ap-south-1 > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️  CDK not bootstrapped for this account/region"
    echo "🔧 Bootstrapping CDK for account 677502935540 in ap-south-1..."
    npx cdk bootstrap aws://677502935540/ap-south-1

    if [ $? -ne 0 ]; then
        echo "❌ CDK bootstrap failed"
        exit 1
    fi
    echo "✅ CDK bootstrap completed"
else
    echo "✅ CDK already bootstrapped"
fi

# Install dependencies
echo "📦 Installing CDK dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

# Build the project
echo "🔨 Building CDK project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Synthesize the stack
echo "🔍 Synthesizing CDK stack..."
npx cdk synth

if [ $? -ne 0 ]; then
    echo "❌ CDK synth failed"
    exit 1
fi

echo "✅ CDK synthesis completed"

# Deploy with confirmation
echo "🚀 Ready to deploy to ap-south-1 (Mumbai)"
echo "This will create the following resources:"
echo "  • VPC with public/private subnets"
echo "  • RDS PostgreSQL database (t3.micro)"
echo "  • S3 bucket for audio storage"
echo "  • Lambda functions for API and WebSocket"
echo "  • API Gateway (REST + WebSocket)"
echo "  • Cognito User Pool"
echo "  • DynamoDB table for connections"
echo ""

read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying AstroVoice stack..."
    npx cdk deploy --require-approval never

    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment completed successfully!"
        echo "📍 Region: ap-south-1 (Mumbai)"
        echo "📊 Check AWS Console for resource details"
        echo ""
        echo "🔗 Next steps:"
        echo "1. Note down the API Gateway URLs from the output"
        echo "2. Update your mobile app configuration"
        echo "3. Set up your Gemini and OpenAI API keys"
        echo ""
    else
        echo "❌ Deployment failed"
        exit 1
    fi
else
    echo "❌ Deployment cancelled"
    exit 0
fi