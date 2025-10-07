/**
 * Configuration service for managing API endpoints and app settings
 */

export interface ApiConfig {
  REST_API_URL: string;
  WEBSOCKET_API_URL: string;
  REGION: string;
  USER_POOL_ID?: string;
  USER_POOL_CLIENT_ID?: string;
}

export interface AppConfig {
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  API: ApiConfig;
  FEATURES: {
    VOICE_CHAT: boolean;
    TEXT_CHAT: boolean;
    OFFLINE_MODE: boolean;
    PUSH_NOTIFICATIONS: boolean;
  };
}

// Default configuration for development
// NOTE: For mobile devices, use your computer's local network IP instead of localhost
// Get IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
const defaultConfig: AppConfig = {
  APP_VERSION: '1.0.0',
  ENVIRONMENT: 'development',
  API: {
    REST_API_URL: 'http://10.126.109.101:8000',
    WEBSOCKET_API_URL: 'ws://10.126.109.101:8000',
    REGION: 'ap-south-1',
  },
  FEATURES: {
    VOICE_CHAT: true,
    TEXT_CHAT: true,
    OFFLINE_MODE: true,
    PUSH_NOTIFICATIONS: false,
  },
};

// Production configuration for deployed API
// Update these URLs after deploying to Railway/Render/Heroku
const productionConfig: ApiConfig = {
  REST_API_URL: 'https://your-app-name.railway.app', // Replace with your actual deployment URL
  WEBSOCKET_API_URL: 'wss://your-app-name.railway.app', // Replace with your actual deployment URL
  REGION: 'ap-south-1',
};

// AWS Production configuration (updated with actual deployment values)
const awsConfig: ApiConfig = {
  REST_API_URL: 'https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod',
  WEBSOCKET_API_URL: 'wss://g3jnrrvfxf.execute-api.ap-south-1.amazonaws.com/prod',
  REGION: 'ap-south-1',
  USER_POOL_ID: 'ap-south-1_tZUkCIGwk',
  USER_POOL_CLIENT_ID: '44sfdu8765ga836a3ug6mjm6l2',
};

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = { ...defaultConfig };

    // TEMPORARILY DISABLED: Auto-switch to AWS if endpoints are available
    // For development, always use localhost
    const USE_LOCALHOST = true; // Set to false to use AWS
    
    if (!USE_LOCALHOST && awsConfig.REST_API_URL && awsConfig.REST_API_URL !== '') {
      this.config.API = { ...awsConfig };
      this.config.ENVIRONMENT = 'production';
      console.log('🚀 Using AWS production endpoints');
    } else {
      console.log('🔧 Using localhost development endpoints');
    }

    this.detectEnvironment();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get API configuration
   */
  public getApiConfig(): ApiConfig {
    return this.config.API;
  }

  /**
   * Switch to production configuration
   */
  public switchToProduction(): void {
    this.config.API = { ...productionConfig };
    this.config.ENVIRONMENT = 'production';
    console.log('🚀 Switched to production configuration:', this.config.API);
  }

  /**
   * Switch to development configuration
   */
  public switchToDevelopment(): void {
    this.config.API = { ...defaultConfig.API };
    this.config.ENVIRONMENT = 'development';
    console.log('🔧 Switched to development configuration:', this.config.API);
  }

  /**
   * Update API configuration with AWS endpoints
   */
  public updateAwsConfig(newApiConfig: Partial<ApiConfig>): void {
    this.config.API = {
      ...this.config.API,
      ...newApiConfig,
    };

    // Switch to production environment if AWS URLs are provided
    if (newApiConfig.REST_API_URL && newApiConfig.REST_API_URL.includes('amazonaws.com')) {
      this.config.ENVIRONMENT = 'production';
    }

    console.log('✅ API configuration updated:', this.config.API);
  }

  /**
   * Check if using AWS infrastructure
   */
  public isUsingAWS(): boolean {
    return this.config.API.REST_API_URL.includes('amazonaws.com') ||
           this.config.API.REST_API_URL.includes('execute-api');
  }

  /**
   * Check if in development mode
   */
  public isDevelopment(): boolean {
    return this.config.ENVIRONMENT === 'development';
  }

  /**
   * Check if feature is enabled
   */
  public isFeatureEnabled(feature: keyof AppConfig['FEATURES']): boolean {
    return this.config.FEATURES[feature];
  }

  /**
   * Get REST API endpoint for a specific path
   */
  public getApiEndpoint(path: string): string {
    const baseUrl = this.config.API.REST_API_URL;
    return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  /**
   * Get WebSocket API endpoint
   */
  public getWebSocketEndpoint(): string {
    return this.config.API.WEBSOCKET_API_URL;
  }

  /**
   * Auto-detect environment based on available endpoints
   */
  private detectEnvironment(): void {
    // In a real app, you might check for environment variables or other indicators
    // For now, we'll use the default development configuration
    console.log('🔧 Config Service initialized in', this.config.ENVIRONMENT, 'mode');
    console.log('📡 API Base URL:', this.config.API.REST_API_URL);
  }

  /**
   * Update configuration from deployment output
   * This method will be called after AWS deployment completes
   */
  public updateFromDeploymentOutput(deploymentOutput: {
    restApiUrl?: string;
    webSocketApiUrl?: string;
    userPoolId?: string;
    userPoolClientId?: string;
    region?: string;
  }): void {
    const updates: Partial<ApiConfig> = {};

    if (deploymentOutput.restApiUrl) {
      updates.REST_API_URL = deploymentOutput.restApiUrl;
    }

    if (deploymentOutput.webSocketApiUrl) {
      updates.WEBSOCKET_API_URL = deploymentOutput.webSocketApiUrl;
    }

    if (deploymentOutput.userPoolId) {
      updates.USER_POOL_ID = deploymentOutput.userPoolId;
    }

    if (deploymentOutput.userPoolClientId) {
      updates.USER_POOL_CLIENT_ID = deploymentOutput.userPoolClientId;
    }

    if (deploymentOutput.region) {
      updates.REGION = deploymentOutput.region;
    }

    this.updateAwsConfig(updates);
  }

  /**
   * Get health check endpoint
   */
  public getHealthCheckEndpoint(): string {
    return this.getApiEndpoint('/health');
  }

  /**
   * Get process audio endpoint
   */
  public getProcessAudioEndpoint(): string {
    return this.getApiEndpoint('/api/process-audio');
  }

  /**
   * Get process text endpoint
   */
  public getProcessTextEndpoint(): string {
    return this.getApiEndpoint('/api/process-text');
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();

// Export for easy importing
export default configService;