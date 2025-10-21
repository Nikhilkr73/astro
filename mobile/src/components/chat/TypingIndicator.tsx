import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  astrologerName?: string;
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  astrologerName = "Astrologer", 
  isVisible 
}) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isVisible) {
      const animateDots = () => {
        const createAnimation = (dot: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(dot, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0.3,
                duration: 600,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400),
        ]).start();
      };

      animateDots();
    } else {
      // Reset dots when not visible
      dot1.setValue(0.3);
      dot2.setValue(0.3);
      dot3.setValue(0.3);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  console.log('⌨️ TypingIndicator: Rendering component with isVisible:', isVisible);

  return (
    <View style={styles.container}>
      <View style={styles.messageBubble}>
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{astrologerName} is typing</Text>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Debug background
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFE4B5',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F7931E',
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
