import { AudioRecording } from './audioService';
import { configService } from './configService';

export interface AstroResponse {
  response_text: string;
  audio_url?: string;
  audio_base64?: string;
  astrologer_id: string;
  session_id: string;
}

export interface VoiceUploadRequest {
  audio_base64: string;
  astrologer_id: string;
  user_id: string;
  session_id?: string;
}

export class ApiService {

  /**
   * Upload voice recording and get astrologer response
   */
  static async processVoiceMessage(
    recording: AudioRecording,
    astrologerId: string,
    userId: string,
    sessionId?: string
  ): Promise<AstroResponse> {
    try {
      // Convert audio file to base64
      const audioBase64 = await this.convertAudioToBase64(recording.uri);

      const requestData: VoiceUploadRequest = {
        audio_base64: audioBase64,
        astrologer_id: astrologerId,
        user_id: userId,
        session_id: sessionId
      };

      const response = await fetch(configService.getProcessAudioEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorResponse = await response.text();
          errorDetails = errorResponse;
        } catch (e) {
          errorDetails = 'Could not read error response';
        }

        console.error('🔥 DETAILED HTTP ERROR:', {
          status: response.status,
          statusText: response.statusText,
          url: configService.getProcessAudioEndpoint(),
          errorBody: errorDetails,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        });

        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorDetails}`);
      }

      const result: AstroResponse = await response.json();
      return result;
    } catch (error) {
      console.error('🔥 DETAILED API ERROR:', {
        error,
        stack: error?.stack,
        message: error?.message,
        name: error?.name,
        location: 'ApiService.processVoiceMessage',
        timestamp: new Date().toISOString(),
        requestData: { astrologerId, userId, sessionId }
      });
      throw new Error('Problem processing voice. Please try again.');
    }
  }

  /**
   * Send text message and get astrologer response
   */
  static async processTextMessage(
    text: string,
    astrologerId: string,
    userId: string,
    sessionId?: string
  ): Promise<AstroResponse> {
    try {
      const requestData = {
        text,
        astrologer_id: astrologerId,
        user_id: userId,
        session_id: sessionId
      };

      const response = await fetch(configService.getProcessTextEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: AstroResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Text processing failed:', error);
      throw new Error('Problem processing text. Please try again.');
    }
  }

  /**
   * Check API health
   */
  static async checkHealth(): Promise<boolean> {
    try {
      // For development, always return true to bypass health check
      if (__DEV__) {
        return true;
      }
      const response = await fetch(configService.getHealthCheckEndpoint(), {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Convert audio file to base64 string
   */
  private static async convertAudioToBase64(uri: string): Promise<string> {
    try {
      // For React Native, we need to use fetch to read the file and convert to base64
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]; // Remove data:audio/... prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert audio to base64:', error);
      throw new Error('Problem processing audio file');
    }
  }

  /**
   * Download and save response audio to local storage
   */
  static async downloadResponseAudio(audioUrl: string): Promise<string> {
    try {
      // For simplicity, return the URL directly
      // In production, you might want to download and cache locally
      return audioUrl;
    } catch (error) {
      console.error('Failed to download response audio:', error);
      throw new Error('Problem downloading audio');
    }
  }

  /**
   * Convert base64 audio to playable URI
   */
  static convertBase64ToAudioUri(base64Audio: string): string {
    // Create a data URI that can be played by the audio player
    // Backend now returns MP3 from OpenAI TTS
    return `data:audio/mp3;base64,${base64Audio}`;
  }

  /**
   * Update API configuration (for when AWS URLs are available)
   */
  static updateApiConfig(deploymentOutput: {
    restApiUrl?: string;
    webSocketApiUrl?: string;
    userPoolId?: string;
    userPoolClientId?: string;
  }) {
    configService.updateFromDeploymentOutput(deploymentOutput);
    console.log('✅ API configuration updated with AWS endpoints');
  }
}