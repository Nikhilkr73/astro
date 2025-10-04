import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Astrologer } from '../types';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onSelect: (astrologer: Astrologer) => void;
  onViewDetails: (astrologer: Astrologer) => void;
}

export default function AstrologerCard({
  astrologer,
  onSelect,
  onViewDetails
}: AstrologerCardProps) {
  const getAccentColor = (accent: string) => {
    switch (accent) {
      case 'north_indian': return '#4CAF50';
      case 'south_indian': return '#2196F3';
      case 'western': return '#FF9800';
      case 'bengali': return '#9C27B0';
      case 'punjabi': return '#F44336';
      default: return '#FF6B35';
    }
  };

  const getAvailabilityText = () => {
    return astrologer.availability ? 'उपलब्ध' : 'व्यस्त';
  };

  const getSpecializationEmoji = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'वैदिक ज्योतिष': return '🕉️';
      case 'नुमेरोलॉजी': return '🔢';
      case 'ताड़ जोतिष': return '🌴';
      case 'हस्तरेखा': return '✋';
      case 'वास्तु शास्त्र': return '🏠';
      case 'रत्न विज्ञान': return '💎';
      default: return '⭐';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={astrologer.availability ? ['#fff', '#f8f9fa'] : ['#f5f5f5', '#e9ecef']}
        style={styles.card}
      >
        {/* Header with Avatar and Status */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {astrologer.avatar ? (
              <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: getAccentColor(astrologer.voiceProfile.accent) }]}>
                <Ionicons name="person" size={30} color="#fff" />
              </View>
            )}
            <View style={[
              styles.statusBadge,
              { backgroundColor: astrologer.availability ? '#4CAF50' : '#F44336' }
            ]}>
              <Text style={styles.statusText}>{getAvailabilityText()}</Text>
            </View>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{astrologer.nameHindi}</Text>
            <Text style={styles.englishName}>{astrologer.name}</Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{astrologer.rating}</Text>
              <Text style={styles.experience}>• {astrologer.experience} वर्ष</Text>
            </View>
          </View>
        </View>

        {/* Specializations */}
        <View style={styles.specializationContainer}>
          {astrologer.specialization.slice(0, 3).map((spec, index) => (
            <View key={index} style={styles.specializationTag}>
              <Text style={styles.specializationEmoji}>{getSpecializationEmoji(spec)}</Text>
              <Text style={styles.specializationText}>{spec}</Text>
            </View>
          ))}
          {astrologer.specialization.length > 3 && (
            <Text style={styles.moreSpecs}>+{astrologer.specialization.length - 3} और</Text>
          )}
        </View>

        {/* Voice Profile Info */}
        <View style={styles.voiceInfo}>
          <View style={styles.voiceDetail}>
            <Ionicons name="volume-medium" size={16} color="#666" />
            <Text style={styles.voiceText}>
              {astrologer.voiceProfile.accent === 'north_indian' && 'उत्तर भारतीय'}
              {astrologer.voiceProfile.accent === 'south_indian' && 'दक्षिण भारतीय'}
              {astrologer.voiceProfile.accent === 'western' && 'पश्चिमी'}
              {astrologer.voiceProfile.accent === 'bengali' && 'बंगाली'}
              {astrologer.voiceProfile.accent === 'punjabi' && 'पंजाबी'}
            </Text>
          </View>
          <View style={styles.voiceDetail}>
            <Ionicons name="musical-notes" size={16} color="#666" />
            <Text style={styles.voiceText}>
              {astrologer.voiceProfile.tone === 'formal' && 'औपचारिक'}
              {astrologer.voiceProfile.tone === 'friendly' && 'मित्रवत'}
              {astrologer.voiceProfile.tone === 'wise' && 'विद्वतापूर्ण'}
              {astrologer.voiceProfile.tone === 'energetic' && 'उत्साही'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {astrologer.descriptionHindi}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => onViewDetails(astrologer)}
          >
            <Ionicons name="information-circle-outline" size={20} color="#FF6B35" />
            <Text style={styles.detailsText}>विवरण</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chatButton,
              { opacity: astrologer.availability ? 1 : 0.6 }
            ]}
            onPress={() => onSelect(astrologer)}
            disabled={!astrologer.availability}
          >
            <LinearGradient
              colors={astrologer.availability ? ['#FF6B35', '#F7931E'] : ['#ccc', '#999']}
              style={styles.chatButtonGradient}
            >
              <Ionicons name="chatbubbles" size={20} color="#fff" />
              <Text style={styles.chatText}>
                {astrologer.availability ? 'बात करें' : 'व्यस्त'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  englishName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  experience: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  specializationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  specializationEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  specializationText: {
    fontSize: 11,
    color: '#1565C0',
    fontWeight: '500',
  },
  moreSpecs: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  voiceInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  voiceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voiceText: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF8F5',
    gap: 6,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  chatButton: {
    flex: 1,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  chatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});