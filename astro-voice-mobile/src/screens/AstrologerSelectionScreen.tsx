import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, Astrologer } from '../types';
import AstrologerCard from '../components/AstrologerCard';
import AstrologerDetailsModal from '../components/AstrologerDetailsModal';
import { astrologersData, getAstrologersByCategory } from '../data/astrologers';
import { Colors, Spacing, BorderRadius, Fonts } from '../config/theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CATEGORY_TABS = [
  { id: 'All', label: 'All', icon: require('../../assets/icons/icon_all.png'), color: Colors.categoryAll },
  { id: 'Love', label: 'Love', icon: require('../../assets/icons/icon_love.png'), color: Colors.categoryLove },
  { id: 'Marriage', label: 'Marriage', icon: require('../../assets/icons/icon_marriage.png'), color: Colors.categoryMarriage },
  { id: 'Career', label: 'Career', icon: require('../../assets/icons/icon_career.png'), color: Colors.categoryCareer },
];

export default function AstrologerSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter astrologers by category
  const filteredAstrologers = useMemo(() => {
    return getAstrologersByCategory(selectedCategory);
  }, [selectedCategory]);

  const handleAstrologerSelect = (astrologer: Astrologer) => {
    if (astrologer.availability) {
      navigation.navigate('VoiceChat', { astrologerId: astrologer.id });
    }
  };

  const handleViewDetails = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedAstrologer(null);
  };

  const handleStartChatFromModal = (astrologer: Astrologer) => {
    handleModalClose();
    handleAstrologerSelect(astrologer);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Kundli Branding */}
      <LinearGradient colors={Colors.gradientPrimary} style={styles.header}>
        <View style={styles.headerContent}>
          {/* Kundli Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo/kundli_logo.png')}
              style={styles.kundliLogoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Kundli</Text>
          </View>
          
          <Text style={styles.headerTitle}>Chat with AI Astrologers</Text>
          <Text style={styles.headerSubtitle}>
            {filteredAstrologers.length} astrologers available
          </Text>
        </View>
      </LinearGradient>

      {/* Category Tabs - HiAstro Style */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORY_TABS.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryTab}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.categoryIconContainer,
                  isActive && { backgroundColor: Colors.primaryLight }
                ]}>
                  <Image 
                    source={category.icon} 
                    style={styles.categoryIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  isActive && styles.categoryLabelActive
                ]}>
                  {category.label}
                </Text>
                {isActive && <View style={styles.categoryIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Chat with AI Astrologers</Text>
        </View>
      </View>

      {/* Astrologers List - Card Style */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredAstrologers.map((astrologer) => (
          <AstrologerCard
            key={astrologer.id}
            astrologer={astrologer}
            onSelect={handleAstrologerSelect}
            onViewDetails={handleViewDetails}
          />
        ))}

        {/* Empty State */}
        {filteredAstrologers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No astrologers found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting a different category
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Astrologer Details Modal */}
      <AstrologerDetailsModal
        visible={isModalVisible}
        astrologer={selectedAstrologer}
        onClose={handleModalClose}
        onStartChat={handleStartChatFromModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kundliLogoImage: {
    width: 48,
    height: 48,
    marginRight: Spacing.sm,
  },
  brandName: {
    fontSize: Fonts.sizes.title,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.textOnPrimary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.medium as any,
    color: Colors.textOnPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  categoryContainer: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  categoryTab: {
    alignItems: 'center',
    minWidth: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIconImage: {
    width: 36,
    height: 36,
  },
  categoryLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium as any,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: Fonts.weights.semiBold as any,
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 30,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 4,
    height: 20,
    backgroundColor: Colors.accent,
    marginRight: Spacing.sm,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold as any,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.semiBold as any,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
