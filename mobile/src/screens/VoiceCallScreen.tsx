import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import apiService from '../services/apiService';
import storage from '../utils/storage';

type VoiceCallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VoiceCall'>;
type VoiceCallScreenRouteProp = RouteProp<RootStackParamList, 'VoiceCall'>;

const VoiceCallScreen = () => {
  const navigation = useNavigation<VoiceCallScreenNavigationProp>();
  const route = useRoute<VoiceCallScreenRouteProp>();
  const { astrologer } = route.params;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [walletBalance, setWalletBalance] = useState(500);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voice call session
  useEffect(() => {
    const initializeVoiceSession = async () => {
      try {
        console.log('🎤 VoiceCallScreen: Starting voice session initialization...');
        setIsLoadingSession(true);
        
        // Get user ID
        let userId = await storage.getUserId();
        if (!userId) {
          console.log('⚠️ No user ID found, using test user for demo');
          userId = 'test_user_demo';
        }
        
        // Get wallet balance
        const walletResponse = await apiService.getWalletBalance(userId);
        if (walletResponse.success) {
          setWalletBalance(walletResponse.balance);
        }
        
        // Start voice session
        console.log('🎤 Starting voice call with', astrologer.name);
        await connectToVoiceSession(userId);
        
      } catch (error: any) {
        console.error('❌ Failed to start voice session:', error);
        Alert.alert(
          'Voice Call Failed',
          error.message || 'Failed to start voice call. Please try again.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    initializeVoiceSession();
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isConnected && !isSessionEnded) {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
        
        // Deduct balance every 60 seconds (₹12/min)
        if (callDuration % 60 === 0 && callDuration > 0) {
          setWalletBalance(prev => {
            const newBalance = Math.max(0, prev - 12);
            if (newBalance === 0) {
              Alert.alert(
                'Insufficient Balance',
                'Your wallet balance is low. Please recharge to continue the call.',
                [{ text: 'OK', onPress: () => endCall() }]
              );
            }
            return newBalance;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, isSessionEnded, callDuration]);

  const connectToVoiceSession = async (userId: string) => {
    try {
      setIsConnecting(true);
      
      // Connect to WebSocket
      const wsUrl = `ws://localhost:8000/ws-mobile/${userId}?astrologer_id=${astrologer.id}`;
      console.log('🔌 Connecting to voice WebSocket:', wsUrl);
      console.log('🔌 User ID:', userId);
      console.log('🔌 Astrologer ID:', astrologer.id);
      
      websocketRef.current = new WebSocket(wsUrl);
      
      websocketRef.current.onopen = () => {
        console.log('✅ Voice WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Initialize audio recording
        initializeAudioRecording();
      };
      
      websocketRef.current.onmessage = (event) => {
        try {
          console.log('📨 Raw WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          console.log('📨 Parsed WebSocket data:', data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          console.error('❌ Raw message:', event.data);
        }
      };
      
      websocketRef.current.onclose = () => {
        console.log('🔌 Voice WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('❌ Voice WebSocket error:', error);
        setIsConnecting(false);
        Alert.alert('Connection Error', 'Failed to connect to voice service. Please try again.');
      };
      
    } catch (error) {
      console.error('❌ Failed to connect to voice session:', error);
      setIsConnecting(false);
      throw error;
    }
  };

  const initializeAudioRecording = async () => {
    try {
      if (Platform.OS !== 'web') {
        console.log('⚠️ Voice recording only supported on web platform');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        sendAudioToServer(audioBlob);
      };
      
      console.log('🎤 Audio recording initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize audio recording:', error);
      Alert.alert(
        'Microphone Access Required',
        'Please allow microphone access to use voice call feature.'
      );
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log('🎤 Started recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('🎤 Stopped recording');
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const message = {
          type: 'audio',
          data: base64Audio,
          format: 'webm'
        };
        
        websocketRef.current.send(JSON.stringify(message));
        console.log('📤 Sent audio to server');
      }
    } catch (error) {
      console.error('❌ Failed to send audio:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    console.log('📨 Received WebSocket message:', data.type);
    
    switch (data.type) {
      case 'audio_response':
        // Play received audio (format specified by backend)
        playAudio(data.audio, data.format || 'wav');
        break;
      case 'audio':
        // Legacy support for raw audio
        playAudio(data.data);
        break;
      case 'text':
        console.log('📝 Astrologer said:', data.text);
        break;
      case 'text_response':
        console.log('📝 Astrologer said (response):', data.text);
        break;
      case 'error':
        console.error('❌ Server error:', data.message);
        Alert.alert('Voice Call Error', data.message);
        break;
      default:
        console.log('📨 Unknown message type:', data.type);
    }
  };

  const playAudio = async (base64Audio: string, format: string = 'wav') => {
    try {
      if (Platform.OS !== 'web') {
        console.log('⚠️ Audio playback only supported on web platform');
        return;
      }

      console.log('🔊 Playing audio response...');
      console.log('🔊 Format:', format);
      console.log('🔊 Base64 length:', base64Audio.length);
      
      // Decode base64 audio data
      const audioData = atob(base64Audio);
      console.log('🔊 Decoded audio data length:', audioData.length);
      
      // Try the specified format first, then fallback to others
      const formatMap = {
        'mp3': { type: 'audio/mpeg', description: 'MP3' },
        'wav': { type: 'audio/wav', description: 'WAV' },
        'ogg': { type: 'audio/ogg', description: 'OGG' },
        'webm': { type: 'audio/webm', description: 'WebM' }
      };
      
      const primaryFormat = formatMap[format] || formatMap['wav'];
      const formats = [primaryFormat, ...Object.values(formatMap).filter(f => f !== primaryFormat)];
      
      for (const format of formats) {
        try {
          console.log(`🔊 Trying ${format.description} format...`);
          
          const audioBlob = new Blob([audioData], { type: format.type });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Create audio element and play
          const audio = new Audio(audioUrl);
          
          // Add event listeners for debugging
          audio.onloadstart = () => console.log(`🎵 ${format.description} loading started`);
          audio.oncanplay = () => console.log(`🎵 ${format.description} can play`);
          audio.onplay = () => console.log(`🎵 ${format.description} playback started`);
          audio.onended = () => console.log(`🎵 ${format.description} playback ended`);
          audio.onerror = (e) => console.error(`🎵 ${format.description} error:`, e);
          
          // Try to play the audio
          await audio.play();
          console.log(`✅ ${format.description} audio playback initiated`);
          
          // Clean up after a delay
          setTimeout(() => {
            URL.revokeObjectURL(audioUrl);
          }, 10000); // Keep URL alive for 10 seconds
          
          return; // Success, exit the function
          
        } catch (formatError) {
          console.log(`❌ ${format.description} failed:`, formatError.message);
          continue; // Try next format
        }
      }
      
      // If all formats failed, try a different approach
      console.log('🔊 All formats failed, trying alternative approach...');
      
      // Create a simple WAV file with proper headers
      const wavData = createSimpleWav(audioData);
      const wavBlob = new Blob([wavData], { type: 'audio/wav' });
      const wavUrl = URL.createObjectURL(wavBlob);
      
      const audio = new Audio(wavUrl);
      audio.onerror = (e) => console.error('🎵 Custom WAV error:', e);
      await audio.play();
      console.log('✅ Custom WAV playback initiated');
      
      setTimeout(() => {
        URL.revokeObjectURL(wavUrl);
      }, 10000);
      
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
    }
  };

  const createSimpleWav = (pcmData: string) => {
    // Create a simple WAV header for 24kHz, 16-bit, mono
    const sampleRate = 24000;
    const channels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * channels * bitsPerSample / 8;
    const blockAlign = channels * bitsPerSample / 8;
    const dataSize = pcmData.length;
    const fileSize = 36 + dataSize;
    
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF header
    view.setUint32(0, 0x46464952, false); // "RIFF"
    view.setUint32(4, fileSize, true);
    view.setUint32(8, 0x45564157, false); // "WAVE"
    
    // fmt chunk
    view.setUint32(12, 0x20746d66, false); // "fmt "
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, channels, true); // channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, byteRate, true); // byte rate
    view.setUint16(32, blockAlign, true); // block align
    view.setUint16(34, bitsPerSample, true); // bits per sample
    
    // data chunk
    view.setUint32(36, 0x61746164, false); // "data"
    view.setUint32(40, dataSize, true); // data size
    
    // Combine header and data
    const headerArray = new Uint8Array(header);
    const dataArray = new Uint8Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      dataArray[i] = pcmData.charCodeAt(i);
    }
    
    const result = new Uint8Array(headerArray.length + dataArray.length);
    result.set(headerArray);
    result.set(dataArray, headerArray.length);
    
    return result.buffer;
  };

  const endCall = () => {
    setIsSessionEnded(true);
    
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      stopRecording();
    }
    
    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    
    // Stop media stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    console.log('📞 Call ended');
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Show loading screen while initializing session
  if (isLoadingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Connecting to voice call...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <Text style={styles.astrologerName} numberOfLines={1}>
            {astrologer.name}
          </Text>
          <View style={styles.callInfo}>
            <Text style={styles.callIcon}>📞</Text>
            <Text style={styles.callTime}>{formatTime(callDuration)}</Text>
            <Text style={styles.callDivider}>•</Text>
            <Text style={styles.walletIcon}>💳</Text>
            <Text style={[
              styles.walletBalance,
              walletBalance === 0 && styles.walletBalanceZero
            ]}>
              ₹{walletBalance}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Voice Call Interface */}
      <View style={styles.callContainer}>
        <View style={styles.astrologerAvatar}>
          <Text style={styles.avatarText}>
            {astrologer.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        
        <Text style={styles.astrologerNameLarge}>{astrologer.name}</Text>
        <Text style={styles.callStatus}>
          {isConnecting ? 'Connecting...' : 
           isConnected ? (isRecording ? 'Listening...' : 'Connected') : 
           'Disconnected'}
        </Text>
        
        {isConnected && (
          <View style={styles.recordingIndicator}>
            <View style={[styles.indicatorDot, isRecording && styles.indicatorDotActive]} />
            <Text style={styles.recordingText}>
              {isRecording ? 'Tap to stop' : 'Tap to speak'}
            </Text>
          </View>
        )}
      </View>

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        {isConnected ? (
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isSessionEnded}
          >
            <Text style={styles.recordButtonIcon}>
              {isRecording ? '⏹️' : '🎤'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.connectingText}>
              {isConnecting ? 'Connecting...' : 'Connection lost'}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.endCallButton}
          onPress={endCall}
        >
          <Text style={styles.endCallIcon}>📞</Text>
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
  },
  profileInfo: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  callTime: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  callDivider: {
    fontSize: 14,
    color: '#d1d5db',
    marginHorizontal: 8,
  },
  walletIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  walletBalance: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  walletBalanceZero: {
    color: '#dc2626',
  },
  callContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  astrologerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  astrologerNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    marginRight: 8,
  },
  indicatorDotActive: {
    backgroundColor: '#ef4444',
  },
  recordingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  controlsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
  },
  recordButtonIcon: {
    fontSize: 32,
  },
  connectingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  connectingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ef4444',
    borderRadius: 24,
  },
  endCallIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  endCallText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default VoiceCallScreen;
