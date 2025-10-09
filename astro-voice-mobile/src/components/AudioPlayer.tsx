import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { AudioService, PlaybackStatus } from '../services/audioService';

interface AudioPlayerProps {
  uri: string;
  onPlaybackComplete?: () => void;
  onPlaybackStart?: () => void;
  onPlaybackPause?: () => void;
  autoPlay?: boolean;
  showProgress?: boolean;
  showDuration?: boolean;
  buttonSize?: number;
  accentColor?: string;
}

export default function AudioPlayer({
  uri,
  onPlaybackComplete,
  onPlaybackStart,
  onPlaybackPause,
  autoPlay = false,
  showProgress = true,
  showDuration = true,
  buttonSize = 50,
  accentColor = '#FF6B35'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    duration: 0,
    position: 0
  });
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const previousUri = useRef<string | null>(null);

  useEffect(() => {
    if (uri && uri !== previousUri.current) {
      previousUri.current = uri;
      if (autoPlay) {
        handlePlay();
      }
    }

    return () => {
      cleanup();
    };
  }, [uri, autoPlay]);

  useEffect(() => {
    if (!isSeeking && playbackStatus.duration > 0) {
      setSliderValue(playbackStatus.position / playbackStatus.duration);
    }
  }, [playbackStatus.position, playbackStatus.duration, isSeeking]);

  const cleanup = async () => {
    await AudioService.stopSound();
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleStatusUpdate = (status: PlaybackStatus) => {
    setPlaybackStatus(status);
    setIsPlaying(status.isPlaying);
    setIsLoading(!status.isLoaded);

    // Check if playback completed
    if (status.isLoaded && !status.isPlaying && status.position >= status.duration && status.duration > 0) {
      setIsPlaying(false);
      onPlaybackComplete?.();
    }
  };

  const handlePlay = async () => {
    if (!uri) return;

    setIsLoading(true);
    try {
      const result = await AudioService.playSound(uri, handleStatusUpdate);
      if (result.success) {
        setIsPlaying(true);
        onPlaybackStart?.();
      } else {
        console.error('Play failed:', result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Play error:', error);
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      const result = await AudioService.pauseSound();
      if (result.success) {
        setIsPlaying(false);
        onPlaybackPause?.();
      }
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const handleResume = async () => {
    try {
      const result = await AudioService.resumeSound();
      if (result.success) {
        setIsPlaying(true);
        onPlaybackStart?.();
      }
    } catch (error) {
      console.error('Resume error:', error);
    }
  };

  const handleStop = async () => {
    try {
      await AudioService.stopSound();
      setIsPlaying(false);
      setPlaybackStatus({
        isLoaded: false,
        isPlaying: false,
        duration: 0,
        position: 0
      });
      setSliderValue(0);
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handleSliderStart = () => {
    setIsSeeking(true);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  const handleSliderComplete = async (value: number) => {
    setIsSeeking(false);
    if (playbackStatus.duration > 0) {
      const positionMillis = value * playbackStatus.duration;
      await AudioService.setPositionAsync(positionMillis);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlayButtonIcon = () => {
    if (isLoading) {
      return 'reload';
    } else if (isPlaying) {
      return 'pause';
    } else {
      return 'play';
    }
  };

  const handlePlayPause = () => {
    if (isLoading) return;

    if (isPlaying) {
      handlePause();
    } else if (playbackStatus.isLoaded) {
      handleResume();
    } else {
      handlePlay();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.playButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: accentColor
            },
          ]}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          <Ionicons
            name={getPlayButtonIcon()}
            size={buttonSize * 0.5}
            color="#fff"
          />
        </TouchableOpacity>

        {playbackStatus.isLoaded && (
          <TouchableOpacity
            style={[styles.stopButton, { borderColor: accentColor }]}
            onPress={handleStop}
          >
            <Ionicons name="stop" size={20} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>

      {showProgress && playbackStatus.isLoaded && (
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            value={sliderValue}
            onValueChange={handleSliderChange}
            onSlidingStart={handleSliderStart}
            onSlidingComplete={handleSliderComplete}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={accentColor}
            maximumTrackTintColor="#ccc"
            thumbStyle={{ backgroundColor: accentColor }}
          />
        </View>
      )}

      {showDuration && playbackStatus.isLoaded && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(playbackStatus.position)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(playbackStatus.duration)}
          </Text>
        </View>
      )}

      {isLoading && (
        <Text style={styles.statusText}>लोड हो रहा है...</Text>
      )}

      {!playbackStatus.isLoaded && !isLoading && (
        <Text style={styles.statusText}>प्लेबैक के लिए तैयार</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  stopButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  progressContainer: {
    width: '100%',
    marginTop: 15,
    paddingHorizontal: 10
  },
  slider: {
    width: '100%',
    height: 40
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 5
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace'
  },
  statusText: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
    textAlign: 'center'
  }
});