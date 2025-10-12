# 🚀 Mobile Voice Astrology App - AWS Cloud Architecture

## 🏗️ AWS-Native Architecture Overview

This specification outlines how to leverage AWS services for building a scalable, production-ready mobile voice astrology application with optimal performance and cost-efficiency.

## 🌐 AWS Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   AWS Services  │    │   OpenAI API    │
│  (React Native) │◄──►│   Frontend      │◄──►│   Realtime      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AWS Cognito   │    │  API Gateway    │
│  Authentication │    │   + Lambda      │
└─────────────────┘    └─────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AWS RDS       │    │   AWS S3        │
│  PostgreSQL     │    │  Audio Storage  │
└─────────────────┘    └─────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  ElastiCache    │    │  CloudFront     │
│   Redis Cache   │    │      CDN        │
└─────────────────┘    └─────────────────┘
```

## 🎯 AWS Services Mapping

### Core Infrastructure
| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| **Authentication** | AWS Cognito | User registration, login, JWT tokens |
| **API Backend** | API Gateway + Lambda | Serverless REST & WebSocket APIs |
| **Database** | RDS PostgreSQL | Primary user & conversation data |
| **Cache** | ElastiCache Redis | Session data & conversation context |
| **File Storage** | S3 | Audio files, avatars, documents |
| **CDN** | CloudFront | Fast audio delivery globally |

### Advanced Features
| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| **Push Notifications** | SNS | Daily horoscopes & engagement |
| **Analytics** | Pinpoint + CloudWatch | User behavior & app performance |
| **Voice Processing** | Polly + Transcribe | Regional Hindi accents |
| **Machine Learning** | SageMaker | Custom voice training |
| **Monitoring** | X-Ray + CloudWatch | Performance tracing |
| **Security** | WAF + Secrets Manager | Rate limiting & API keys |

### DevOps & Deployment
| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| **Infrastructure** | CDK/CloudFormation | Infrastructure as Code |
| **CI/CD** | CodeBuild + CodePipeline | Automated deployments |
| **Container Registry** | ECR | Docker image storage |
| **Load Balancing** | ALB + Auto Scaling | High availability |
| **Testing** | Device Farm | Mobile app testing |

## 📱 Phase-by-Phase AWS Implementation

### Phase 1: MVP Foundation with AWS Core Services

#### Task 1: Set up AWS development environment and infrastructure
**AWS Services:** IAM, CLI, CDK
**Estimated Effort:** 6 hours

**Deliverables:**
- [ ] AWS account setup with proper IAM roles
- [ ] AWS CLI configuration
- [ ] AWS CDK project initialization
- [ ] Development environment with AWS SDK
- [ ] Basic security groups and VPC setup

**AWS Setup Commands:**
```bash
# Install AWS CLI and CDK
brew install awscli
npm install -g aws-cdk

# Configure AWS credentials
aws configure

# Initialize CDK project
mkdir astro-voice-aws-infra
cd astro-voice-aws-infra
cdk init app --language typescript

# Bootstrap CDK
cdk bootstrap
```

**CDK Stack Structure:**
```typescript
// lib/astro-voice-stack.ts
export class AstroVoiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC for secure networking
    const vpc = new ec2.Vpc(this, 'AstroVoiceVPC', {
      maxAzs: 2,
      natGateways: 1
    });

    // RDS PostgreSQL
    const database = new rds.DatabaseInstance(this, 'AstroVoiceDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('astrovoice-admin'),
      multiAz: false, // true for production
      deletionProtection: false // true for production
    });

    // S3 bucket for audio storage
    const audioBucket = new s3.Bucket(this, 'AstroVoiceAudio', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*']
      }]
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'AstroVoiceCDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(audioBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    });
  }
}
```

---

#### Task 3: Implement basic user authentication with AWS Cognito
**AWS Services:** Cognito User Pools, Cognito Identity Pools
**Estimated Effort:** 8 hours

**Deliverables:**
- [ ] Cognito User Pool for authentication
- [ ] Cognito Identity Pool for AWS resource access
- [ ] Mobile app integration with Amplify Auth
- [ ] JWT token handling
- [ ] Phone number verification
- [ ] Social login options (Google, Apple)

**CDK Cognito Setup:**
```typescript
// Add to AstroVoiceStack
const userPool = new cognito.UserPool(this, 'AstroVoiceUserPool', {
  userPoolName: 'AstroVoiceUsers',
  signInAliases: {
    email: true,
    phone: true
  },
  selfSignUpEnabled: true,
  userVerification: {
    emailSubject: 'Welcome to AstroVoice!',
    emailBody: 'Your verification code is {####}',
    smsMessage: 'Your AstroVoice verification code is {####}'
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true
  },
  standardAttributes: {
    givenName: { required: true, mutable: true },
    birthdate: { required: false, mutable: true },
    phoneNumber: { required: true, mutable: true }
  }
});

const userPoolClient = new cognito.UserPoolClient(this, 'AstroVoiceUserPoolClient', {
  userPool,
  generateSecret: false,
  authFlows: {
    adminUserPassword: true,
    userPassword: true,
    userSrp: true
  }
});

const identityPool = new cognito.CfnIdentityPool(this, 'AstroVoiceIdentityPool', {
  allowUnauthenticatedIdentities: false,
  cognitoIdentityProviders: [{
    clientId: userPoolClient.userPoolClientId,
    providerName: userPool.userPoolProviderName
  }]
});
```

**Mobile App Integration:**
```bash
# Install Amplify in React Native project
npm install aws-amplify @aws-amplify/react-native
npx expo install @aws-amplify/react-native @react-native-async-storage/async-storage
```

---

#### Task 5: Deploy FastAPI backend to AWS ECS/Lambda
**AWS Services:** Lambda, API Gateway, ECS (optional)
**Estimated Effort:** 12 hours

**Architecture Decision:**
- **Lambda + API Gateway** for cost-effective serverless approach
- **ECS Fargate** for consistent container-based deployment
- **API Gateway WebSocket** for real-time voice streaming

**Lambda Deployment:**
```typescript
// FastAPI Lambda function
const fastApiLambda = new lambda.Function(this, 'AstroVoiceFastAPI', {
  runtime: lambda.Runtime.PYTHON_3_11,
  handler: 'main.handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    DATABASE_URL: database.instanceEndpoint.socketAddress,
    OPENAI_API_KEY: openaiApiKey.secretValue.toString()
  },
  timeout: Duration.seconds(30),
  memorySize: 1024
});

// API Gateway REST API
const api = new apigateway.RestApi(this, 'AstroVoiceAPI', {
  restApiName: 'AstroVoice API',
  description: 'Voice Astrology API',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS
  }
});

const lambdaIntegration = new apigateway.LambdaIntegration(fastApiLambda);
api.root.addProxy({
  defaultIntegration: lambdaIntegration,
  anyMethod: true
});

// WebSocket API for real-time voice
const webSocketApi = new apigatewayv2.WebSocketApi(this, 'AstroVoiceWebSocket', {
  apiName: 'AstroVoice WebSocket',
  description: 'Real-time voice communication'
});
```

**Lambda Handler for FastAPI:**
```python
# lambda/main.py
from mangum import Mangum
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AstroVoice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import your existing FastAPI routes
from openai_realtime_handler import openai_realtime_handler
from routes import auth, astrologers, conversations

app.include_router(auth.router, prefix="/auth")
app.include_router(astrologers.router, prefix="/astrologers")
app.include_router(conversations.router, prefix="/conversations")

# Lambda handler
handler = Mangum(app)
```

---

#### Task 6: Implement WebSocket connection via AWS API Gateway
**AWS Services:** API Gateway WebSocket, Lambda
**Estimated Effort:** 10 hours

**WebSocket Lambda Functions:**
```typescript
// Connection management Lambda
const connectLambda = new lambda.Function(this, 'WebSocketConnect', {
  runtime: lambda.Runtime.PYTHON_3_11,
  handler: 'websocket.connect_handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    CONNECTIONS_TABLE: connectionsTable.tableName
  }
});

const disconnectLambda = new lambda.Function(this, 'WebSocketDisconnect', {
  runtime: lambda.Runtime.PYTHON_3_11,
  handler: 'websocket.disconnect_handler',
  code: lambda.Code.fromAsset('lambda')
});

const messageLambda = new lambda.Function(this, 'WebSocketMessage', {
  runtime: lambda.Runtime.PYTHON_3_11,
  handler: 'websocket.message_handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: Duration.seconds(30)
});

// WebSocket routes
webSocketApi.addRoute('$connect', {
  integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
    'ConnectIntegration',
    connectLambda
  )
});

webSocketApi.addRoute('$disconnect', {
  integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
    'DisconnectIntegration',
    disconnectLambda
  )
});

webSocketApi.addRoute('voice_message', {
  integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
    'MessageIntegration',
    messageLambda
  )
});
```

---

#### Task 8: Build voice chat with AWS S3 audio storage
**AWS Services:** S3, CloudFront
**Estimated Effort:** 14 hours

**Audio Storage Strategy:**
```typescript
// S3 bucket with lifecycle policies
const audioBucket = new s3.Bucket(this, 'AstroVoiceAudio', {
  bucketName: 'astrovoice-audio-files',
  versioned: false,
  encryption: s3.BucketEncryption.S3_MANAGED,
  lifecycleRules: [{
    id: 'DeleteOldAudio',
    enabled: true,
    expiration: Duration.days(30), // Auto-delete after 30 days
    transitions: [{
      storageClass: s3.StorageClass.INFREQUENT_ACCESS,
      transitionAfter: Duration.days(7)
    }]
  }],
  cors: [{
    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
    allowedOrigins: ['*'],
    allowedHeaders: ['*'],
    maxAge: 3000
  }]
});

// CloudFront for audio delivery
const audioDistribution = new cloudfront.Distribution(this, 'AudioCDN', {
  defaultBehavior: {
    origin: new origins.S3Origin(audioBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS
  },
  priceClass: cloudfront.PriceClass.PRICE_CLASS_100 // US, Canada, Europe
});
```

---

### Phase 2: Multi-Astrologer System with AWS Scaling

#### Task 12: Design multi-astrologer system with AWS DynamoDB
**AWS Services:** DynamoDB, DAX (for caching)
**Estimated Effort:** 10 hours

**DynamoDB Tables:**
```typescript
// Astrologers table
const astrologersTable = new dynamodb.Table(this, 'Astrologers', {
  tableName: 'AstroVoice-Astrologers',
  partitionKey: { name: 'astrologerId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  encryption: dynamodb.TableEncryption.AWS_MANAGED,
  pointInTimeRecovery: true,
  globalSecondaryIndexes: [{
    indexName: 'SpecializationIndex',
    partitionKey: { name: 'specialization', type: dynamodb.AttributeType.STRING },
    projectionType: dynamodb.ProjectionType.ALL
  }]
});

// User-Astrologer contexts
const userContextsTable = new dynamodb.Table(this, 'UserContexts', {
  tableName: 'AstroVoice-UserContexts',
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'astrologerId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  encryption: dynamodb.TableEncryption.AWS_MANAGED,
  timeToLiveAttribute: 'ttl' // Auto-expire old contexts
});

// DAX cluster for high performance
const daxCluster = new dax.Cluster(this, 'AstrologersCache', {
  clusterName: 'astrovoice-dax',
  iamRole: daxRole,
  nodeType: dax.NodeType.T3_SMALL,
  replicationFactor: 1, // 3 for production
  subnetGroup: daxSubnetGroup
});
```

#### Task 14: Implement context management with AWS ElastiCache Redis
**AWS Services:** ElastiCache Redis
**Estimated Effort:** 8 hours

```typescript
// Redis cluster for session management
const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCache', {
  cacheNodeType: 'cache.t3.micro',
  engine: 'redis',
  numCacheNodes: 1,
  vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
  cacheSubnetGroupName: redisSubnetGroup.ref
});
```

---

### Phase 3: Enhanced UX with AWS Advanced Services

#### Task 19: Implement push notifications via AWS SNS
**AWS Services:** SNS, Pinpoint
**Estimated Effort:** 8 hours

```typescript
// SNS topic for push notifications
const pushTopic = new sns.Topic(this, 'PushNotifications', {
  topicName: 'AstroVoice-PushNotifications',
  displayName: 'AstroVoice Push Notifications'
});

// Pinpoint project for advanced messaging
const pinpointProject = new pinpoint.CfnApp(this, 'AstroVoicePinpoint', {
  name: 'AstroVoice-Messaging'
});
```

#### Task 21: Create analytics with AWS Pinpoint and CloudWatch
**AWS Services:** Pinpoint, CloudWatch, QuickSight
**Estimated Effort:** 10 hours

```typescript
// CloudWatch dashboard
const dashboard = new cloudwatch.Dashboard(this, 'AstroVoiceDashboard', {
  dashboardName: 'AstroVoice-Metrics',
  widgets: [
    [new cloudwatch.GraphWidget({
      title: 'API Requests',
      left: [api.metricCount()],
      width: 12
    })],
    [new cloudwatch.GraphWidget({
      title: 'Lambda Duration',
      left: [fastApiLambda.metricDuration()],
      width: 12
    })]
  ]
});
```

---

### Phase 4: Production Infrastructure with AWS Enterprise Services

#### Task 23: Implement payments with AWS Payment Cryptography
**AWS Services:** Payment Cryptography, Lambda, Secrets Manager
**Estimated Effort:** 20 hours

#### Task 24: Set up production infrastructure with AWS CDK
**AWS Services:** CDK, Auto Scaling, ALB, Route 53
**Estimated Effort:** 16 hours

```typescript
// Production infrastructure
export class AstroVoiceProductionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Multi-AZ RDS with read replicas
    const database = new rds.DatabaseCluster(this, 'AstroVoiceCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_2
      }),
      instances: 2,
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.LARGE),
        vpc: vpc
      },
      backup: {
        retention: Duration.days(7)
      }
    });

    // Auto Scaling Group for ECS
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      minCapacity: 2,
      maxCapacity: 10,
      desiredCapacity: 2
    });

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true
    });

    // Route 53 hosted zone
    const hostedZone = new route53.HostedZone(this, 'HostedZone', {
      zoneName: 'astrovoice.app'
    });
  }
}
```

#### Task 26: Implement rate limiting with AWS WAF
**AWS Services:** WAF, Shield
**Estimated Effort:** 12 hours

```typescript
// WAF Web ACL for rate limiting
const webAcl = new wafv2.CfnWebACL(this, 'AstroVoiceWAF', {
  scope: 'CLOUDFRONT',
  defaultAction: { allow: {} },
  rules: [{
    name: 'RateLimitRule',
    priority: 1,
    statement: {
      rateBasedStatement: {
        limit: 2000,
        aggregateKeyType: 'IP'
      }
    },
    action: { block: {} },
    visibilityConfig: {
      sampledRequestsEnabled: true,
      cloudWatchMetricsEnabled: true,
      metricName: 'RateLimitRule'
    }
  }]
});
```

---

### Phase 5: Advanced AI Features with AWS ML Services

#### Task 28: Develop regional accents with AWS Polly
**AWS Services:** Polly, S3
**Estimated Effort:** 24 hours

```typescript
// Lambda function for text-to-speech
const pollyLambda = new lambda.Function(this, 'PollyTTS', {
  runtime: lambda.Runtime.PYTHON_3_11,
  handler: 'polly_handler.synthesize_speech',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    AUDIO_BUCKET: audioBucket.bucketName
  },
  timeout: Duration.seconds(60)
});

audioBucket.grantWrite(pollyLambda);
```

**Regional Hindi Voices:**
```python
# lambda/polly_handler.py
import boto3

polly = boto3.client('polly')

HINDI_VOICES = {
    'delhi': {'VoiceId': 'Aditi', 'LanguageCode': 'hi-IN'},
    'mumbai': {'VoiceId': 'Raveena', 'LanguageCode': 'hi-IN'},
    'south': {'VoiceId': 'Aditi', 'LanguageCode': 'hi-IN'}  # Custom neural voice
}

def synthesize_speech(text, region='delhi'):
    voice_config = HINDI_VOICES.get(region, HINDI_VOICES['delhi'])

    response = polly.synthesize_speech(
        Text=text,
        OutputFormat='mp3',
        VoiceId=voice_config['VoiceId'],
        LanguageCode=voice_config['LanguageCode'],
        Engine='neural'
    )

    return response['AudioStream'].read()
```

#### Task 31: Add custom voice training with AWS SageMaker
**AWS Services:** SageMaker, S3
**Estimated Effort:** 22 hours

```typescript
// SageMaker endpoint for voice training
const sageMakerRole = new iam.Role(this, 'SageMakerRole', {
  assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess')
  ]
});

const voiceTrainingModel = new sagemaker.CfnModel(this, 'VoiceTrainingModel', {
  modelName: 'astrovoice-voice-training',
  executionRoleArn: sageMakerRole.roleArn,
  primaryContainer: {
    image: '763104351884.dkr.ecr.us-west-2.amazonaws.com/pytorch-training:1.13.1-gpu-py39-cu117-ubuntu20.04',
    modelDataUrl: 's3://astrovoice-models/voice-training-model.tar.gz'
  }
});
```

---

### Phase 6: Deployment and Monitoring

#### Task 33: Deploy to app stores via AWS Device Farm
**AWS Services:** Device Farm, CodeBuild
**Estimated Effort:** 20 hours

```typescript
// CodeBuild project for mobile app
const mobileBuildProject = new codebuild.Project(this, 'MobileBuild', {
  projectName: 'AstroVoice-Mobile-Build',
  source: codebuild.Source.gitHub({
    owner: 'your-github-username',
    repo: 'astrovoice-mobile'
  }),
  environment: {
    buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
    computeType: codebuild.ComputeType.MEDIUM
  },
  buildSpec: codebuild.BuildSpec.fromObject({
    version: '0.2',
    phases: {
      install: {
        'runtime-versions': {
          nodejs: '18'
        },
        commands: [
          'npm install -g @expo/cli',
          'npm install'
        ]
      },
      build: {
        commands: [
          'expo build:android --type apk',
          'expo build:ios --type archive'
        ]
      }
    },
    artifacts: {
      files: ['**/*']
    }
  })
});
```

---

## 💰 AWS Cost Optimization

### Development Environment (Monthly)
- **RDS t3.micro:** $15
- **Lambda:** $5 (within free tier)
- **S3:** $5
- **CloudFront:** $1
- **API Gateway:** $10
- **Total:** ~$36/month

### Production Environment (Monthly at 10K users)
- **RDS Aurora (2 instances):** $200
- **Lambda (heavy usage):** $50
- **S3 + CloudFront:** $30
- **DynamoDB:** $25
- **ElastiCache:** $50
- **ALB:** $25
- **WAF:** $10
- **Total:** ~$390/month

### Cost Optimization Strategies
1. **Reserved Instances** for predictable workloads (30-60% savings)
2. **Spot Instances** for development environments
3. **S3 Lifecycle Policies** for automatic cost reduction
4. **Lambda Provisioned Concurrency** only for critical functions
5. **CloudWatch Log Groups** with retention policies

## 🔐 AWS Security Best Practices

### Identity and Access Management
```typescript
// IAM policies with least privilege
const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
  ],
  inlinePolicies: {
    DynamoDBAccess: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
          resources: [astrologersTable.tableArn]
        })
      ]
    })
  }
});
```

### Encryption and Secrets
- **S3 Server-Side Encryption** for all audio files
- **RDS Encryption at Rest** for database
- **Secrets Manager** for API keys
- **Parameter Store** for configuration
- **KMS** for custom encryption keys

## 📊 Monitoring and Alerting

### CloudWatch Alarms
```typescript
// API Gateway 4xx errors
new cloudwatch.Alarm(this, 'APIGateway4xxAlarm', {
  metric: api.metricClientError(),
  threshold: 10,
  evaluationPeriods: 2,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
});

// Lambda error rate
new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
  metric: fastApiLambda.metricErrors(),
  threshold: 5,
  evaluationPeriods: 1
});
```

### X-Ray Tracing
```typescript
// Enable X-Ray tracing
fastApiLambda.addEnvironment('_X_AMZN_TRACE_ID', '1');
```

---

## 🚀 Deployment Commands

### Infrastructure Deployment
```bash
# Deploy development environment
cdk deploy AstroVoice-Dev-Stack

# Deploy production environment
cdk deploy AstroVoice-Prod-Stack --require-approval never

# Update specific service
cdk deploy AstroVoice-Prod-Stack --hotswap
```

### Mobile App Deployment
```bash
# Deploy to AWS Amplify hosting
amplify init
amplify add hosting
amplify publish

# Deploy to Device Farm for testing
aws devicefarm create-upload --project-arn arn:aws:devicefarm:us-west-2:123456789012:project:astrovoice --name app.apk --type ANDROID_APP
```

This AWS-native architecture provides:
- **Scalability:** Auto-scaling Lambda and RDS
- **Performance:** CloudFront CDN and ElastiCache
- **Cost-Effectiveness:** Pay-per-use serverless model
- **Security:** WAF, Cognito, and encrypted storage
- **Monitoring:** Comprehensive CloudWatch metrics
- **Global Reach:** Multi-region deployment capability

Ready to start with Task 1: AWS environment setup?