import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface AudioRecording {
  uri: string;
  duration: number;
  size: number;
}

export interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  duration: number;
  position: number;
}

export class AudioService {
  private static recording: Audio.Recording | null = null;
  private static sound: Audio.Sound | null = null;
  private static isRecordingInitialized = false;

  static async initialize(): Promise<void> {
    try {
      // Minimal audio mode for recording - only essential settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // Remove Android-specific and other problematic settings
        // shouldDuckAndroid: true,
        // playThroughEarpieceAndroid: false,
        // staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('🔥 DETAILED AUDIO ERROR:', {
        error,
        stack: error?.stack,
        message: error?.message,
        name: error?.name,
        location: 'AudioService.initialize',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      return false;
    }
  }

  static async startRecording(): Promise<{ success: boolean; error?: string }> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Audio recording permission denied' };
      }

      // Initialize audio mode
      await this.initialize();

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Create new recording
      this.recording = new Audio.Recording();

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: 'mp4',
          audioEncoder: 'aac',
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 'mp4',
          audioQuality: 'high',
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      this.isRecordingInitialized = true;

      return { success: true };
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      return { success: false, error: error.message || 'Failed to start recording' };
    }
  }

  static async stopRecording(): Promise<{ success: boolean; recording?: AudioRecording; error?: string }> {
    try {
      if (!this.recording || !this.isRecordingInitialized) {
        return { success: false, error: 'No active recording found' };
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      if (!uri) {
        return { success: false, error: 'Failed to get recording URI' };
      }

      const recording: AudioRecording = {
        uri,
        duration: status.durationMillis || 0,
        size: 0, // File size would need platform-specific implementation
      };

      // Cleanup
      this.recording = null;
      this.isRecordingInitialized = false;

      return { success: true, recording };
    } catch (error: any) {
      console.error('Failed to stop recording:', error);
      this.recording = null;
      this.isRecordingInitialized = false;
      return { success: false, error: error.message || 'Failed to stop recording' };
    }
  }

  static async playSound(uri: string, onStatusUpdate?: (status: PlaybackStatus) => void): Promise<{ success: boolean; error?: string }> {
    try {
      // Stop any existing playback
      await this.stopSound();

      console.log('🎵 Loading audio from URI...');
      
      // Create and load new sound with optimized settings for long audio
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: false,
          progressUpdateIntervalMillis: 500, // Update status every 500ms
        },
        onStatusUpdate ? (status) => {
          const playbackStatus: PlaybackStatus = {
            isLoaded: status.isLoaded || false,
            isPlaying: (status.isLoaded && status.isPlaying) || false,
            duration: status.isLoaded ? status.durationMillis || 0 : 0,
            position: status.isLoaded ? status.positionMillis || 0 : 0,
          };
          
          // Log playback progress for debugging
          if (status.isLoaded && status.isPlaying) {
            const progress = status.durationMillis > 0 
              ? ((status.positionMillis / status.durationMillis) * 100).toFixed(1)
              : 0;
            console.log(`▶️  Playing: ${(status.positionMillis / 1000).toFixed(1)}s / ${(status.durationMillis / 1000).toFixed(1)}s (${progress}%)`);
          }
          
          if (status.didJustFinish) {
            console.log('✅ Audio playback completed');
          }
          
          onStatusUpdate(playbackStatus);
        } : undefined
      );

      this.sound = sound;
      
      // Get and log audio duration
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        console.log(`📊 Audio loaded: ${(status.durationMillis / 1000).toFixed(1)}s duration`);
      }
      
      // Start playback
      await this.sound.playAsync();
      console.log('▶️  Audio playback started');

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to play sound:', error);
      return { success: false, error: error.message || 'Failed to play sound' };
    }
  }

  static async stopSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  }

  static async pauseSound(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        return { success: true };
      }
      return { success: false, error: 'No active sound to pause' };
    } catch (error: any) {
      console.error('Failed to pause sound:', error);
      return { success: false, error: error.message || 'Failed to pause sound' };
    }
  }

  static async resumeSound(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        return { success: true };
      }
      return { success: false, error: 'No active sound to resume' };
    } catch (error: any) {
      console.error('Failed to resume sound:', error);
      return { success: false, error: error.message || 'Failed to resume sound' };
    }
  }

  static async setPositionAsync(positionMillis: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
        return { success: true };
      }
      return { success: false, error: 'No active sound' };
    } catch (error: any) {
      console.error('Failed to set position:', error);
      return { success: false, error: error.message || 'Failed to set position' };
    }
  }

  static isRecording(): boolean {
    return this.isRecordingInitialized && this.recording !== null;
  }

  static isPlaying(): boolean {
    return this.sound !== null;
  }

  static async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.stopRecording();
      }
      if (this.sound) {
        await this.stopSound();
      }
    } catch (error) {
      console.error('Failed to cleanup audio service:', error);
    }
  }
}