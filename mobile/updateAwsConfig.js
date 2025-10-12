#!/usr/bin/env node

/**
 * Script to update mobile app configuration with AWS deployment outputs
 */

const { ApiService } = require('./src/services/apiService');

// AWS Deployment Outputs
const deploymentOutput = {
  restApiUrl: 'https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/',
  webSocketApiUrl: 'wss://g3jnrrvfxf.execute-api.ap-south-1.amazonaws.com/prod',
  userPoolId: 'ap-south-1_tZUkCIGwk',
  userPoolClientId: '44sfdu8765ga836a3ug6mjm6l2',
  region: 'ap-south-1'
};

console.log('🔧 Updating mobile app configuration with AWS endpoints...');
console.log('📡 REST API URL:', deploymentOutput.restApiUrl);
console.log('🔌 WebSocket URL:', deploymentOutput.webSocketApiUrl);
console.log('👤 User Pool ID:', deploymentOutput.userPoolId);
console.log('🗝️  Client ID:', deploymentOutput.userPoolClientId);
console.log('🌍 Region:', deploymentOutput.region);

// Update the API service configuration
try {
  ApiService.updateApiConfig(deploymentOutput);
  console.log('✅ Configuration updated successfully!');
  console.log('🚀 Your mobile app is now connected to AWS infrastructure in Mumbai region');
  console.log('💡 You can now test voice recording and playback with the AWS backend');
} catch (error) {
  console.error('❌ Failed to update configuration:', error.message);
  process.exit(1);
}