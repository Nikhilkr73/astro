import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute } from '@react-navigation/native';
import VoiceRecorder from '../components/VoiceRecorder';
import AudioPlayer from '../components/AudioPlayer';
import { AudioRecording } from '../services/audioService';
import { WebSocketService } from '../services/websocketService';
import { RootStackParamList } from '../types';
import { astrologersData } from '../data/astrologers';

interface VoiceMessage {
  id: string;
  uri: string;
  duration: number;
  timestamp: Date;
  isUser: boolean;
  text?: string; // For display purposes
}

type VoiceChatScreenRouteProp = RouteProp<RootStackParamList, 'VoiceChat'>;

export default function VoiceChatScreen() {
  const route = useRoute<VoiceChatScreenRouteProp>();
  const { astrologerId } = route.params;

  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState(astrologersData[0]);

  // Get astrologer data
  useEffect(() => {
    const astrologer = astrologersData.find(a => a.id === astrologerId);
    if (astrologer) {
      setSelectedAstrologer(astrologer);
    }
  }, [astrologerId]);

  // Connect to WebSocket on component mount
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await WebSocketService.connect('user-123', {
          onConnected: () => {
            console.log('✅ WebSocket connected for voice chat');
            setIsConnected(true);
          },
          onDisconnected: () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
          },
          onAudioResponse: (audioBase64) => {
            console.log('🔊 Received complete audio response from Realtime API');
            
            // Create astrologer message with complete audio (WAV format)
            const astrologerMessage: VoiceMessage = {
              id: Date.now().toString(),
              uri: `data:audio/wav;base64,${audioBase64}`,
              duration: 5000,
              timestamp: new Date(),
              isUser: false,
              text: 'Voice response from astrologer',
            };

            setMessages(prev => [...prev, astrologerMessage]);
            setIsProcessing(false);
          },
          onTextResponse: (text) => {
            console.log('📝 Received text response:', text);
            // Text is sent with audio, so we handle display in onAudioResponse
          },
          onError: (error) => {
            console.error('WebSocket error:', error);
            Alert.alert('Connection Error', error);
          },
        });
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const handleRecordingComplete = async (recording: AudioRecording) => {
    try {
      // Check WebSocket connection
      if (!isConnected) {
        Alert.alert('Error', 'Not connected to server. Please wait...');
        return;
      }

      // Add user message to chat
      const userMessage: VoiceMessage = {
        id: Date.now().toString(),
        uri: recording.uri,
        duration: recording.duration,
        timestamp: new Date(),
        isUser: true,
      };
      setMessages(prev => [...prev, userMessage]);

      // Set processing state
      setIsProcessing(true);

      try {
        // Send audio via WebSocket to Realtime API
        console.log('📤 Sending audio via WebSocket...');
        await WebSocketService.sendAudio(recording);
        console.log('✅ Audio sent, waiting for response...');

        // Response will come via WebSocket callbacks
        // The onAudioResponse callback will set isProcessing to false

      } catch (wsError) {
        console.error('WebSocket send error:', wsError);
        setIsProcessing(false);
        Alert.alert('Error', 'Failed to send audio. Please try again.');
      }

    } catch (error) {
      console.error('Failed to process recording:', error);
      Alert.alert('Error', 'Failed to process recording');
      setIsProcessing(false);
    }
  };

  return (
    <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.astrologerInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#fff" />
          </View>
          <Text style={styles.astrologerName}>{selectedAstrologer.name}</Text>
          <Text style={styles.status}>
            {selectedAstrologer.availability ? 'Online' : 'Offline'} • {selectedAstrologer.specialization[0]}
          </Text>
          <View style={[styles.connectionStatus, isConnected ? styles.connected : styles.disconnected]}>
            <Text style={styles.connectionText}>
              {isConnected ? '🔊 Realtime Connected' : '⏳ Connecting...'}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Welcome! Press the mic button to ask your question
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.astrologerMessage,
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>
                    {message.isUser ? 'You' : 'Astrologer'}
                  </Text>
                  <Text style={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString('hi-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                {message.uri ? (
                  <AudioPlayer
                    uri={message.uri}
                    buttonSize={40}
                    accentColor={message.isUser ? '#4CAF50' : '#FF6B35'}
                    autoPlay={!message.isUser}
                    showProgress={true}
                    showDuration={true}
                  />
                ) : message.text ? (
                  <View style={styles.textMessage}>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}

          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>
                Astrologer is preparing your response...
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.controls}>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isProcessing}
            maxDuration={120000} // 2 minutes max
            buttonSize={80}
            buttonColor="rgba(255,255,255,0.3)"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  astrologerInfo: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  astrologerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  status: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8
  },
  chatArea: {
    flex: 1,
    marginBottom: 20
  },
  chatContent: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 20
  },
  welcomeContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  astrologerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.9,
  },
  messageTime: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.7,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 15,
    marginVertical: 10,
  },
  processingText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 20
  },
  connectionStatus: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connected: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  disconnected: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  connectionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  textMessage: {
    marginTop: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});