import { Amplify } from 'aws-amplify';

export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-east-1_PLACEHOLDER',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || 'PLACEHOLDER',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        phone: true,
      },
    },
  },
  API: {
    REST: {
      AstroVoiceAPI: {
        endpoint: process.env.EXPO_PUBLIC_API_ENDPOINT || 'https://api.placeholder.com',
        region: 'us-east-1',
      },
    },
  },
  Storage: {
    S3: {
      bucket: process.env.EXPO_PUBLIC_AUDIO_BUCKET || 'astro-voice-audio-placeholder',
      region: 'us-east-1',
    },
  },
};

export const configureAmplify = () => {
  Amplify.configure(awsConfig);
};