import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Astrologer } from '../types';

interface AstrologerDetailsModalProps {
  visible: boolean;
  astrologer: Astrologer | null;
  onClose: () => void;
  onStartChat: (astrologer: Astrologer) => void;
}

const { width } = Dimensions.get('window');

export default function AstrologerDetailsModal({
  visible,
  astrologer,
  onClose,
  onStartChat,
}: AstrologerDetailsModalProps) {
  if (!astrologer) return null;

  const getAccentIcon = (accent: string) => {
    switch (accent) {
      case 'north_indian': return '🇮🇳';
      case 'south_indian': return '🌴';
      case 'western': return '🌍';
      case 'bengali': return '🐅';
      case 'punjabi': return '🌾';
      default: return '🎵';
    }
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'formal': return '🎩';
      case 'friendly': return '😊';
      case 'wise': return '🧙‍♂️';
      case 'energetic': return '⚡';
      default: return '🗣️';
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'vedic astrology': return '🕉️';
      case 'नुमेरोलॉजी': return '🔢';
      case 'ताड़ जोतिष': return '🌴';
      case 'हस्तरेखा': return '✋';
      case 'वास्तु शास्त्र': return '🏠';
      case 'रत्न विज्ञान': return '💎';
      case 'तंत्र मंत्र': return '🔮';
      case 'कुंडली मिलान': return '💑';
      case 'मुहूर्त': return '⏰';
      case 'फेस रीडिंग': return '👤';
      default: return '⭐';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ज्योतिषी विवरण</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {astrologer.avatar ? (
                <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={styles.avatarPlaceholder}
                >
                  <Ionicons name="person" size={40} color="#fff" />
                </LinearGradient>
              )}
              <View style={[
                styles.statusIndicator,
                { backgroundColor: astrologer.availability ? '#4CAF50' : '#F44336' }
              ]}>
                <Text style={styles.statusText}>
                  {astrologer.availability ? '🟢 उपलब्ध' : '🔴 व्यस्त'}
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{astrologer.nameHindi}</Text>
              <Text style={styles.englishName}>{astrologer.name}</Text>

              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>{astrologer.rating} रेटिंग</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.statText}>{astrologer.experience} वर्ष अनुभव</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 परिचय</Text>
            <Text style={styles.description}>{astrologer.descriptionHindi}</Text>
            <Text style={styles.englishDescription}>{astrologer.description}</Text>
          </View>

          {/* Specializations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 विशेषज्ञता</Text>
            <View style={styles.specializationsGrid}>
              {astrologer.specialization.map((spec, index) => (
                <View key={index} style={styles.specializationCard}>
                  <Text style={styles.specializationIcon}>
                    {getSpecializationIcon(spec)}
                  </Text>
                  <Text style={styles.specializationName}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Voice Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎙️ आवाज़ प्रोफाइल</Text>
            <View style={styles.voiceProfileGrid}>
              <View style={styles.voiceCard}>
                <Text style={styles.voiceIcon}>{getAccentIcon(astrologer.voiceProfile.accent)}</Text>
                <Text style={styles.voiceLabel}>उच्चारण</Text>
                <Text style={styles.voiceValue}>
                  {astrologer.voiceProfile.accent === 'north_indian' && 'उत्तर भारतीय'}
                  {astrologer.voiceProfile.accent === 'south_indian' && 'दक्षिण भारतीय'}
                  {astrologer.voiceProfile.accent === 'western' && 'पश्चिमी'}
                  {astrologer.voiceProfile.accent === 'bengali' && 'बंगाली'}
                  {astrologer.voiceProfile.accent === 'punjabi' && 'पंजाबी'}
                </Text>
              </View>

              <View style={styles.voiceCard}>
                <Text style={styles.voiceIcon}>{getToneIcon(astrologer.voiceProfile.tone)}</Text>
                <Text style={styles.voiceLabel}>स्वर</Text>
                <Text style={styles.voiceValue}>
                  {astrologer.voiceProfile.tone === 'formal' && 'औपचारिक'}
                  {astrologer.voiceProfile.tone === 'friendly' && 'मित्रवत'}
                  {astrologer.voiceProfile.tone === 'wise' && 'विद्वतापूर्ण'}
                  {astrologer.voiceProfile.tone === 'energetic' && 'उत्साही'}
                </Text>
              </View>

              <View style={styles.voiceCard}>
                <Text style={styles.voiceIcon}>🎵</Text>
                <Text style={styles.voiceLabel}>पिच</Text>
                <Text style={styles.voiceValue}>
                  {astrologer.voiceProfile.pitch === 'low' && 'धीमी'}
                  {astrologer.voiceProfile.pitch === 'medium' && 'मध्यम'}
                  {astrologer.voiceProfile.pitch === 'high' && 'तेज़'}
                </Text>
              </View>

              <View style={styles.voiceCard}>
                <Text style={styles.voiceIcon}>⚡</Text>
                <Text style={styles.voiceLabel}>गति</Text>
                <Text style={styles.voiceValue}>
                  {astrologer.voiceProfile.speed === 'slow' && 'धीमी'}
                  {astrologer.voiceProfile.speed === 'medium' && 'मध्यम'}
                  {astrologer.voiceProfile.speed === 'fast' && 'तेज़'}
                </Text>
              </View>
            </View>
          </View>

          {/* Personality Traits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎭 व्यक्तित्व विशेषताएं</Text>

            <View style={styles.personalitySection}>
              <Text style={styles.personalityLabel}>🙏 अभिवादन शैली:</Text>
              <Text style={styles.personalityText}>{astrologer.personality.greetingStyle}</Text>
            </View>

            <View style={styles.personalitySection}>
              <Text style={styles.personalityLabel}>💬 उत्तर शैली:</Text>
              <Text style={styles.personalityText}>{astrologer.personality.responseStyle}</Text>
            </View>

            {astrologer.personality.specialPhrases.length > 0 && (
              <View style={styles.personalitySection}>
                <Text style={styles.personalityLabel}>✨ विशेष वाक्य:</Text>
                {astrologer.personality.specialPhrases.map((phrase, index) => (
                  <Text key={index} style={styles.phraseText}>• {phrase}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Cultural References */}
          {astrologer.personality.culturalReferences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏛️ सांस्कृतिक संदर्भ</Text>
              <View style={styles.culturalGrid}>
                {astrologer.personality.culturalReferences.map((ref, index) => (
                  <View key={index} style={styles.culturalTag}>
                    <Text style={styles.culturalText}>{ref}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Spacer for button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Start Chat Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.chatButton,
              { opacity: astrologer.availability ? 1 : 0.6 }
            ]}
            onPress={() => onStartChat(astrologer)}
            disabled={!astrologer.availability}
          >
            <LinearGradient
              colors={astrologer.availability ? ['#FF6B35', '#F7931E'] : ['#ccc', '#999']}
              style={styles.chatButtonGradient}
            >
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <Text style={styles.chatButtonText}>
                {astrologer.availability ? 'बातचीत शुरू करें' : 'ज्योतिषी व्यस्त हैं'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  englishName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 8,
  },
  englishDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  specializationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: (width - 56) / 3, // 3 columns with margins
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  specializationIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  specializationName: {
    fontSize: 12,
    color: '#1565c0',
    textAlign: 'center',
    fontWeight: '600',
  },
  voiceProfileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: (width - 56) / 2, // 2 columns
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  voiceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  voiceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  voiceValue: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
    textAlign: 'center',
  },
  personalitySection: {
    marginBottom: 12,
  },
  personalityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 4,
  },
  personalityText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  phraseText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginLeft: 8,
  },
  culturalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  culturalTag: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  culturalText: {
    fontSize: 12,
    color: '#f57c00',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  chatButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});