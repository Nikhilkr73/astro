import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface ContinueChatBarProps {
  visible: boolean;
  astrologerImage: string;
  astrologerName: string;
  userName: string;
  rate: number;
  originalRate?: number;
  onContinue: () => void;
}

export function ContinueChatBar({ 
  visible, 
  astrologerImage, 
  astrologerName, 
  userName, 
  rate, 
  originalRate,
  onContinue 
}: ContinueChatBarProps) {
  if (!visible) {
    return null;
  }

  const hasDiscount = originalRate && originalRate > rate;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Astrologer Profile Picture */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: astrologerImage }}
            style={styles.profileImage}
          />
        </View>
        
        {/* Message Text */}
        <View style={styles.textContainer}>
          <Text style={styles.messageText}>
            <Text style={styles.greeting}>Hi {userName}, </Text>
            let's continue this chat at discounted price of
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹ {rate.toFixed(1)}/min</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}> ₹ {originalRate!.toFixed(1)}/min</Text>
            )}
          </View>
        </View>
        
        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0', // Light orange background
    borderTopWidth: 1,
    borderTopColor: '#FFE4B5', // Light orange border
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#2E2E2E', // Primary text
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  greeting: {
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931E', // Orange
    fontFamily: 'Poppins_500Medium',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    color: '#9CA3AF', // Gray for crossed out
    marginLeft: 8,
    fontFamily: 'Poppins_400Regular',
  },
  continueButton: {
    backgroundColor: '#F7931E', // Primary orange button (matching design system)
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
});

export default ContinueChatBar;

