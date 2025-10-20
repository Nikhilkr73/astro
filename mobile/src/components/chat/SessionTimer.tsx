import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

// =============================================================================
// TYPES
// =============================================================================

interface SessionTimerProps {
  startTime: number;
  pausedTime?: number;
  totalPausedDuration: number;
  isPaused: boolean;
  format?: 'mm:ss' | 'hh:mm:ss';
  style?: any;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SessionTimer({
  startTime,
  pausedTime,
  totalPausedDuration,
  isPaused,
  format = 'mm:ss',
  style,
}: SessionTimerProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every second when not paused
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Calculate session duration
  const calculateDuration = () => {
    const now = isPaused ? (pausedTime || startTime) : currentTime;
    const totalDuration = Math.floor((now - startTime) / 1000) - totalPausedDuration;
    return Math.max(0, totalDuration);
  };

  // Format duration based on format prop
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (format === 'hh:mm:ss' || hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const duration = calculateDuration();
  const formattedTime = formatDuration(duration);

  return (
    <Text style={[styles.timer, style]}>
      {formattedTime}
    </Text>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  timer: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'monospace', // Use monospace font for consistent width
  },
});

export default SessionTimer;
