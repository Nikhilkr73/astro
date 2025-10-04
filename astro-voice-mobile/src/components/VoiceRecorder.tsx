import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioService, AudioRecording } from '../services/audioService';

interface VoiceRecorderProps {
  onRecordingComplete?: (recording: AudioRecording) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
  maxDuration?: number; // in milliseconds
  buttonSize?: number;
  buttonColor?: string;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
  maxDuration = 300000, // 5 minutes default
  buttonSize = 80,
  buttonColor = '#FF6B35',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permission, setPermission] = useState<boolean | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkPermissions();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startDurationTimer();
    } else {
      stopPulseAnimation();
      stopDurationTimer();
    }
  }, [isRecording]);

  const checkPermissions = async () => {
    try {
      const hasPermission = await AudioService.requestPermissions();
      setPermission(hasPermission);

      if (!hasPermission) {
        Alert.alert(
          'अनुमति आवश्यक',
          'वॉयस रिकॉर्डिंग के लिए माइक्रोफोन की अनुमति आवश्यक है।',
          [{ text: 'ठीक है', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setPermission(false);
    }
  };

  const startPulseAnimation = () => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startDurationTimer = () => {
    const startTime = Date.now();
    durationInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRecordingDuration(elapsed);

      // Auto-stop if max duration reached
      if (elapsed >= maxDuration) {
        handleStopRecording();
      }
    }, 100);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    setRecordingDuration(0);
  };

  const handleStartRecording = async () => {
    if (disabled || !permission) {
      if (!permission) {
        await checkPermissions();
      }
      return;
    }

    try {
      const result = await AudioService.startRecording();
      if (result.success) {
        setIsRecording(true);
        onRecordingStart?.();
      } else {
        Alert.alert('Error', result.error || 'Could not start recording');
      }
    } catch (error) {
      console.error('Start recording failed:', error);
      Alert.alert('Error', 'Recording failed');
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    try {
      const result = await AudioService.stopRecording();
      setIsRecording(false);
      onRecordingStop?.();

      if (result.success && result.recording) {
        onRecordingComplete?.(result.recording);
      } else {
        Alert.alert('Error', result.error || 'Could not save recording');
      }
    } catch (error) {
      console.error('Stop recording failed:', error);
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
    }
  };

  const cleanup = async () => {
    stopDurationTimer();
    await AudioService.cleanup();
  };

  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getButtonIcon = () => {
    if (isRecording) {
      return 'stop';
    } else {
      return 'mic';
    }
  };

  const isDisabled = disabled || permission === false;

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: isRecording ? '#d32f2f' : buttonColor,
            },
            isDisabled && styles.disabledButton,
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getButtonIcon()}
            size={buttonSize * 0.4}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>

      {!isRecording && (
        <Text style={styles.instructionText}>
          {isDisabled
            ? 'माइक्रोफोन की अनुमति आवश्यक है'
            : 'रिकॉर्डिंग के लिए टैप करें'}
        </Text>
      )}

      {isRecording && (
        <Text style={styles.recordingText}>
          रिकॉर्डिंग चल रही है...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recordButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d32f2f',
    marginRight: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  instructionText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recordingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});