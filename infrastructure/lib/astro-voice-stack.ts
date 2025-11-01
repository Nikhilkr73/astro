import * as cdk from 'aws-cdk-lib';

import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as rds from 'aws-cdk-lib/aws-rds';

import * as s3 from 'aws-cdk-lib/aws-s3';

import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';

import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import * as cognito from 'aws-cdk-lib/aws-cognito';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';



export class AstroVoiceStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);



    // VPC for our infrastructure

    const vpc = new ec2.Vpc(this, 'AstroVoiceVPC', {

      maxAzs: 2,

      natGateways: 1,

      subnetConfiguration: [

        {

          cidrMask: 24,

          name: 'public',

          subnetType: ec2.SubnetType.PUBLIC,

        },

        {

          cidrMask: 24,

          name: 'private',

          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,

        },

      ],

    });



    // Security groups

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {

      vpc,

      description: 'Security group for AstroVoice database',

    });



    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {

      vpc,

      description: 'Security group for AstroVoice Lambda functions',

    });



    // Allow Lambda to access database

    dbSecurityGroup.addIngressRule(

      lambdaSecurityGroup,

      ec2.Port.tcp(5432),

      'Allow Lambda access to PostgreSQL'

    );



    // S3 bucket for audio storage

    const audioBucket = new s3.Bucket(this, 'AstroVoiceAudioBucket', {

      bucketName: `astro-voice-audio-${this.account}-${this.region}`,

      versioned: false,

      encryption: s3.BucketEncryption.S3_MANAGED,

      cors: [

        {

          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],

          allowedOrigins: ['*'],

          allowedHeaders: ['*'],

        },

      ],

    });



    // PostgreSQL database

    const database = new rds.DatabaseInstance(this, 'AstroVoiceDB', {

      engine: rds.DatabaseInstanceEngine.postgres({

        version: rds.PostgresEngineVersion.VER_14,

      }),

      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),

      vpc,

      securityGroups: [dbSecurityGroup],

      credentials: rds.Credentials.fromGeneratedSecret('astrovoice_admin', {

        excludeCharacters: '"@/\\',

      }),

      allocatedStorage: 20,

      storageEncrypted: true,

      backupRetention: cdk.Duration.days(7),

      deletionProtection: false, // Set to true in production

    });



    // Cognito User Pool for authentication

    const userPool = new cognito.UserPool(this, 'AstroVoiceUserPool', {

      selfSignUpEnabled: true,

      signInAliases: {

        email: true,

        phone: true,

      },

      autoVerify: {

        email: true,

      },

      standardAttributes: {

        email: {

          required: true,

          mutable: true,

        },

        phoneNumber: {

          required: false,

          mutable: true,

        },

      },

      passwordPolicy: {

        minLength: 8,

        requireLowercase: true,

        requireUppercase: true,

        requireDigits: true,

        requireSymbols: false,

      },

    });



    const userPoolClient = new cognito.UserPoolClient(this, 'AstroVoiceUserPoolClient', {

      userPool,

      generateSecret: false,

      authFlows: {

        userPassword: true,

        userSrp: true,

      },

    });



    // Lambda function for voice processing using FastAPI

    const voiceProcessorLambda = new lambda.Function(this, 'VoiceProcessorLambda', {

      runtime: lambda.Runtime.PYTHON_3_10,

      handler: 'lambda_handler.lambda_handler',

      code: lambda.Code.fromAsset('../backend-deployment'),

      vpc: vpc,

      securityGroups: [lambdaSecurityGroup],

      environment: {

        DB_SECRET_ARN: database.secret!.secretArn,

        AUDIO_BUCKET: audioBucket.bucketName,

        USER_POOL_ID: userPool.userPoolId,

        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

      },

      timeout: cdk.Duration.minutes(5),

      memorySize: 1024,

    });



    // Lambda function for mobile API

    const mobileApiLambda = new lambda.Function(this, 'MobileApiLambda', {

      runtime: lambda.Runtime.PYTHON_3_10,

      handler: 'mobile_lambda_handler.lambda_handler',

      code: lambda.Code.fromAsset('../backend-deployment'),

      vpc: vpc,

      securityGroups: [lambdaSecurityGroup],

      environment: {

        DB_HOST: database.instanceEndpoint.hostname,

        DB_PORT: '5432',

        DB_NAME: 'astrovoice',

        DB_SECRET_ARN: database.secret!.secretArn,

        AUDIO_BUCKET: audioBucket.bucketName,

      },

      timeout: cdk.Duration.seconds(30),

      memorySize: 512,

    });

    // Lambda function to initialize database schema
    const initDbLambda = new lambda.Function(this, "InitDbLambda", {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "init_db_lambda.lambda_handler",
      code: lambda.Code.fromAsset("../backend-deployment"),
      vpc: vpc,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_SECRET_ARN: database.secret?.secretArn || "",
        REGION: this.region,
      },
      timeout: cdk.Duration.minutes(5),
    });

    // Grant permissions
    database.secret?.grantRead(initDbLambda);
    database.connections.allowFrom(initDbLambda, ec2.Port.tcp(5432));

    // Quick Lambda to create otp_verifications table (if missing)
    const createOtpTableLambda = new lambda.Function(this, "CreateOtpTableLambda", {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "create_otp_table.lambda_handler",
      code: lambda.Code.fromAsset("../backend-deployment"),
      vpc: vpc,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_SECRET_ARN: database.secret?.secretArn || "",
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
    });
    
    database.secret?.grantRead(createOtpTableLambda);
    database.connections.allowFrom(createOtpTableLambda, ec2.Port.tcp(5432));

    // Lambda to create ALL essential tables
    const createAllTablesLambda = new lambda.Function(this, "CreateAllTablesLambda", {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "create_all_tables.lambda_handler",
      code: lambda.Code.fromAsset("../backend-deployment"),
      vpc: vpc,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_SECRET_ARN: database.secret?.secretArn || "",
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
    });
    
    database.secret?.grantRead(createAllTablesLambda);
    database.connections.allowFrom(createAllTablesLambda, ec2.Port.tcp(5432));

    // Lambda to sync astrologers from JSON to database
    const syncAstrologersLambda = new lambda.Function(this, "SyncAstrologersLambda", {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "sync_astrologers_lambda.lambda_handler",
      code: lambda.Code.fromAsset("../backend-deployment"),
      vpc: vpc,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_SECRET_ARN: database.secret?.secretArn || "",
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
    });
    
    database.secret?.grantRead(syncAstrologersLambda);
    database.connections.allowFrom(syncAstrologersLambda, ec2.Port.tcp(5432));
    
    
    
        
    



    // DynamoDB table for WebSocket connections

    const connectionTable = new dynamodb.Table(this, 'WebSocketConnections', {

      tableName: 'astro-voice-websocket-connections',

      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN in production

      pointInTimeRecovery: true,

    });



    // Lambda function for WebSocket handling

    const websocketLambda = new lambda.Function(this, 'WebSocketLambda', {

      runtime: lambda.Runtime.PYTHON_3_10,

      handler: 'websocket_handler.lambda_handler',

      code: lambda.Code.fromAsset('../backend-deployment'),

      vpc: vpc,

      securityGroups: [lambdaSecurityGroup],

      environment: {

        DB_SECRET_ARN: database.secret!.secretArn,

        AUDIO_BUCKET: audioBucket.bucketName,

        USER_POOL_ID: userPool.userPoolId,

        CONNECTION_TABLE_NAME: connectionTable.tableName,

        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

      },

      timeout: cdk.Duration.minutes(5),

      memorySize: 1024,

    });



    // Grant Lambda permissions

    database.secret?.grantRead(voiceProcessorLambda);

    audioBucket.grantReadWrite(voiceProcessorLambda);



    database.secret?.grantRead(websocketLambda);

    audioBucket.grantReadWrite(websocketLambda);

    connectionTable.grantReadWriteData(websocketLambda);



    database.secret?.grantRead(mobileApiLambda);

    audioBucket.grantReadWrite(mobileApiLambda);

    database.connections.allowFrom(mobileApiLambda, ec2.Port.tcp(5432));



    // API Gateway with WebSocket support

    const api = new apigateway.RestApi(this, 'AstroVoiceAPI', {

      restApiName: 'AstroVoice API',

      description: 'API for AstroVoice mobile application',

      defaultCorsPreflightOptions: {

        allowOrigins: apigateway.Cors.ALL_ORIGINS,

        allowMethods: apigateway.Cors.ALL_METHODS,

        allowHeaders: ['Content-Type', 'Authorization'],

      },

    });



    

    // Grant API Gateway permission to invoke mobileApiLambda (single wildcard permission to avoid policy size limit)

    mobileApiLambda.addPermission('ApiGatewayInvokePermission', {

      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),

      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${api.restApiId}/*/*`,

    });

// API endpoints for FastAPI backend

    const apiResource = api.root.addResource('api');



    // Health check endpoint

    const healthResource = apiResource.addResource('health');

    healthResource.addMethod('GET', new apigateway.LambdaIntegration(mobileApiLambda));



    // Customization endpoint

    const customizeResource = apiResource.addResource('customize');

    customizeResource.addMethod('POST', new apigateway.LambdaIntegration(voiceProcessorLambda));



    // Text processing endpoint

    const processTextResource = apiResource.addResource('process-text');

    processTextResource.addMethod('POST', new apigateway.LambdaIntegration(voiceProcessorLambda));



    // Audio processing endpoint

    const processAudioResource = apiResource.addResource('process-audio');

    processAudioResource.addMethod('POST', new apigateway.LambdaIntegration(voiceProcessorLambda));



    // Test Gemini endpoint

    const testGeminiResource = apiResource.addResource('test_gemini');

    testGeminiResource.addMethod('POST', new apigateway.LambdaIntegration(voiceProcessorLambda));

    // Root /health endpoint - use mobileApiLambda

    const healthRootResource = api.root.addResource("health");

    healthRootResource.addMethod("GET", new apigateway.LambdaIntegration(mobileApiLambda));

    

    // Fix /api/health to use mobileApiLambda (was using voiceProcessorLambda)

    

    // Mobile API endpoints using proxy resources (consolidated to avoid Lambda policy size limit)

    const authProxy = apiResource.addResource("auth").addProxy({

      defaultIntegration: new apigateway.LambdaIntegration(mobileApiLambda),

    });

    

    const usersProxy = apiResource.addResource("users").addProxy({

      defaultIntegration: new apigateway.LambdaIntegration(mobileApiLambda),

    });

    

    // Astrologers endpoint - direct GET for list
    const astrologersResource = apiResource.addResource("astrologers");
    astrologersResource.addMethod("GET", new apigateway.LambdaIntegration(mobileApiLambda));
    // Also add proxy for sub-paths like /api/astrologers/{id}
    const astrologersProxy = astrologersResource.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(mobileApiLambda),
    });

    

    const chatProxy = apiResource.addResource("chat").addProxy({

      defaultIntegration: new apigateway.LambdaIntegration(mobileApiLambda),

    });

    

    const walletProxy = apiResource.addResource("wallet").addProxy({

      defaultIntegration: new apigateway.LambdaIntegration(mobileApiLambda),

    });

    

    const reviewsProxy = apiResource.addResource("reviews").addProxy({

      defaultIntegration: new apigateway.LambdaIntegration(mobileApiLambda),

    });



    // WebSocket API for real-time voice chat

    const websocketApi = new apigatewayv2.WebSocketApi(this, 'AstroVoiceWebSocketAPI', {

      apiName: 'AstroVoice WebSocket API',

      description: 'WebSocket API for real-time voice chat',

      connectRouteOptions: {

        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(

          'ConnectIntegration',

          websocketLambda

        ),

      },

      disconnectRouteOptions: {

        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(

          'DisconnectIntegration',

          websocketLambda

        ),

      },

      defaultRouteOptions: {

        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(

          'DefaultIntegration',

          websocketLambda

        ),

      },

    });



    // WebSocket stage

    const websocketStage = new apigatewayv2.WebSocketStage(this, 'AstroVoiceWebSocketStage', {

      webSocketApi: websocketApi,

      stageName: 'prod',

      autoDeploy: true,

    });



    // Grant WebSocket API permission to invoke Lambda

    websocketLambda.addPermission('WebSocketApiInvokePermission', {

      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),

      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${websocketApi.apiId}/*/*`,

    });



    // Output important values

    new cdk.CfnOutput(this, 'UserPoolId', {

      value: userPool.userPoolId,

      description: 'Cognito User Pool ID',

    });



    new cdk.CfnOutput(this, 'UserPoolClientId', {

      value: userPoolClient.userPoolClientId,

      description: 'Cognito User Pool Client ID',

    });



    new cdk.CfnOutput(this, 'ApiUrl', {

      value: api.url,

      description: 'API Gateway URL',

    });



    new cdk.CfnOutput(this, 'AudioBucketName', {

      value: audioBucket.bucketName,

      description: 'S3 Audio Bucket Name',

    });



    new cdk.CfnOutput(this, 'DatabaseEndpoint', {

      value: database.instanceEndpoint.hostname,

      description: 'RDS Database Endpoint',

    });



    new cdk.CfnOutput(this, 'WebSocketApiUrl', {

      value: websocketStage.url,

      description: 'WebSocket API URL',

    });



    new cdk.CfnOutput(this, 'ConnectionTableName', {

      value: connectionTable.tableName,

      description: 'DynamoDB Connection Table Name',

    });

  }

}