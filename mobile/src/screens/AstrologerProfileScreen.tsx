import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, Astrologer} from '../types';

type AstrologerProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AstrologerProfile'>;
type AstrologerProfileScreenRouteProp = RouteProp<RootStackParamList, 'AstrologerProfile'>;

const AstrologerProfileScreen = () => {
  const navigation = useNavigation<AstrologerProfileScreenNavigationProp>();
  const route = useRoute<AstrologerProfileScreenRouteProp>();
  const { astrologer } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartChat = () => {
    navigation.navigate('ChatSession', { astrologer });
  };

  const handleStartCall = () => {
    // Simulate call session - for now just show alert
    // In the original app, this would start a call session
    console.log('Call feature coming soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Astrologer Profile</Text>
          <View style={styles.headerSpace} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: astrologer.image }}
              style={styles.profileImage}
            />
            {/* Online Status */}
            <View style={[
              styles.onlineIndicator,
              { backgroundColor: astrologer.isOnline ? '#10b981' : '#6b7280' }
            ]}>
              {astrologer.isOnline && <View style={styles.onlineDot} />}
              <Text style={styles.onlineText}>
                {astrologer.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <Text style={styles.astrologerName}>{astrologer.name}</Text>
          
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{astrologer.category}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{astrologer.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💼</Text>
              <Text style={styles.statValue}>{astrologer.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{astrologer.reviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Languages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languagesContainer}>
            {astrologer.languages.map((language, index) => (
              <View key={index} style={styles.languageTag}>
                <Text style={styles.languageText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specialization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialization</Text>
          <View style={styles.specializationContainer}>
            <Text style={styles.specializationText}>{astrologer.category}</Text>
            <Text style={styles.specializationDescription}>
              Expert in providing insights and guidance through {astrologer.category.toLowerCase()} practices with over {astrologer.experience} of experience.
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Welcome! I am {astrologer.name}, a professional astrologer specializing in {astrologer.category}. 
            With {astrologer.experience} of experience, I have helped thousands of people find clarity and direction in their lives. 
            I am fluent in {astrologer.languages.join(', ')} and provide personalized consultations to help you understand your path better.
          </Text>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Rates</Text>
          <View style={styles.pricingContainer}>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingIcon}>💬</Text>
              <View style={styles.pricingInfo}>
                <Text style={styles.pricingType}>Chat Consultation</Text>
                <Text style={styles.pricingRate}>₹8 per minute</Text>
              </View>
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingIcon}>📞</Text>
              <View style={styles.pricingInfo}>
                <Text style={styles.pricingType}>Voice Call</Text>
                <Text style={styles.pricingRate}>₹12 per minute</Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleStartChat}
          activeOpacity={0.9}
        >
          <Text style={styles.chatButtonIcon}>💬</Text>
          <Text style={styles.chatButtonText}>Start Chat</Text>
          <Text style={styles.chatButtonRate}>₹8/min</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleStartCall}
          disabled={true}
          activeOpacity={0.6}
        >
          <Text style={styles.callButtonIcon}>📞</Text>
          <Text style={styles.callButtonText}>Voice Call</Text>
          <Text style={styles.callButtonRate}>₹12/min</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>Soon</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSpace: {
    width: 40,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  astrologerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  specializationContainer: {
    gap: 8,
  },
  specializationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  specializationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  pricingContainer: {
    gap: 12,
  },
  pricingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    position: 'relative',
  },
  pricingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  pricingInfo: {
    flex: 1,
  },
  pricingType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  pricingRate: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  comingSoonBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chatButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  chatButtonRate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  callButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 2,
  },
  callButtonRate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  soonBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  soonBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default AstrologerProfileScreen;
