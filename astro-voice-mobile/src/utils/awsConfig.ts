import { AWSConfig } from '../types';

export const awsConfig: AWSConfig = {
  region: 'us-east-1',
  userPoolId: '', // Will be populated from CDK outputs
  userPoolWebClientId: '', // Will be populated from CDK outputs
  apiGatewayUrl: '', // Will be populated from CDK outputs
  s3BucketName: '', // Will be populated from CDK outputs
};

// Amplify configuration
export const amplifyConfig = {
  Auth: {
    region: awsConfig.region,
    userPoolId: awsConfig.userPoolId,
    userPoolWebClientId: awsConfig.userPoolWebClientId,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
  },
  API: {
    endpoints: [
      {
        name: 'astroVoiceAPI',
        endpoint: awsConfig.apiGatewayUrl,
        region: awsConfig.region,
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: awsConfig.s3BucketName,
      region: awsConfig.region,
    },
  },
};

// Environment-specific configurations
export const getEnvironmentConfig = (env: 'development' | 'staging' | 'production') => {
  const baseConfig = { ...awsConfig };

  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        // Development-specific overrides
      };
    case 'staging':
      return {
        ...baseConfig,
        // Staging-specific overrides
      };
    case 'production':
      return {
        ...baseConfig,
        // Production-specific overrides
      };
    default:
      return baseConfig;
  }
};