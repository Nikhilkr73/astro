/**
 * WebSocket Service for Real-time Voice Communication
 * Uses OpenAI Realtime API for true voice-to-voice
 */

import { AudioRecording } from './audioService';
import { configService } from './configService';

export interface WebSocketMessage {
  type: 'audio' | 'audio_response' | 'text_response' | 'ping' | 'pong' | 'error';
  audio?: string;
  text?: string;
  error?: string;
}

export interface RealtimeCallbacks {
  onAudioResponse?: (audioBase64: string) => void;
  onTextResponse?: (text: string) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class WebSocketService {
  private static ws: WebSocket | null = null;
  private static callbacks: RealtimeCallbacks = {};
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Connect to WebSocket server
   */
  static connect(userId: string, callbacks: RealtimeCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.callbacks = callbacks;
        
        // Get WebSocket URL - use local network IP for mobile devices
        // TODO: Make this configurable from environment
        const wsUrl = `ws://192.168.0.107:8000/ws-mobile/${userId}`;
        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          this.callbacks.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.callbacks.onError?.('WebSocket connection error');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.callbacks.onDisconnected?.();
          this.ws = null;
          
          // Auto-reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            this.reconnectTimeout = setTimeout(() => {
              this.connect(userId, this.callbacks);
            }, 2000 * this.reconnectAttempts);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Send audio to server
   */
  static async sendAudio(recording: AudioRecording): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    try {
      // Convert audio file to base64
      const response = await fetch(recording.uri);
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data:audio/... prefix
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const message: WebSocketMessage = {
        type: 'audio',
        audio: base64,
      };

      this.ws.send(JSON.stringify(message));
      console.log('📤 Audio sent via WebSocket');
    } catch (error) {
      console.error('Failed to send audio:', error);
      throw error;
    }
  }

  /**
   * Handle incoming messages
   */
  private static handleMessage(message: WebSocketMessage): void {
    console.log('📨 WebSocket message:', message.type);

    switch (message.type) {
      case 'audio_response':
        if (message.audio) {
          this.callbacks.onAudioResponse?.(message.audio);
        }
        break;

      case 'text_response':
        if (message.text) {
          this.callbacks.onTextResponse?.(message.text);
        }
        break;

      case 'error':
        if (message.error) {
          this.callbacks.onError?.(message.error);
        }
        break;

      case 'pong':
        console.log('🏓 Pong received');
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Send astrologer configuration
   */
  static sendAstrologerConfig(astrologerId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ Cannot send config: WebSocket not connected');
      return;
    }

    try {
      const message = {
        type: 'config',
        astrologer_id: astrologerId,
      };

      this.ws.send(JSON.stringify(message));
      console.log(`🎭 Sent astrologer config: ${astrologerId}`);
    } catch (error) {
      console.error('Failed to send astrologer config:', error);
    }
  }

  /**
   * Send ping to keep connection alive
   */
  static sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }

  /**
   * Disconnect WebSocket
   */
  static disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.callbacks = {};
    this.reconnectAttempts = 0;
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Check if connected
   */
  static isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Convert base64 audio to playable URI
   */
  static convertAudioToUri(audioBase64: string): string {
    // Backend converts PCM16 to WAV format
    return `data:audio/wav;base64,${audioBase64}`;
  }
}

