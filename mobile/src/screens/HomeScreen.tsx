import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, Astrologer} from '../types';
import {categories} from '../constants/astrologers';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import {colors, typography, spacing, borderRadius, shadows, gradients, touchableOpacity} from '../constants/theme';
import LinearGradient from 'expo-linear-gradient';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { joinAstrologerLanguages } from '../utils/astrologerHelpers';
import ActiveChatModal from '../components/chat/ActiveChatModal';
import { useChatSession } from '../contexts/ChatSessionContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [walletBalance, setWalletBalance] = useState(50);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Active chat modal state
  const [showActiveChatModal, setShowActiveChatModal] = useState(false);
  const [pendingAstrologer, setPendingAstrologer] = useState<Astrologer | null>(null);
  const { state: sessionState, actions: sessionActions } = useChatSession();

  // Load astrologers from API
  const loadAstrologers = async () => {
    try {
      setError(null);
      const response = await apiService.getAllAstrologers(
        selectedCategory === "All" ? undefined : selectedCategory
      );
      
      if (response.success) {
        console.log(`✅ Loaded ${response.count} astrologers from API`);
        setAstrologers(response.astrologers);
      }
    } catch (error: any) {
      console.error('❌ Failed to load astrologers:', error);
      setError('Failed to load astrologers. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load wallet balance
  const loadWalletBalance = async () => {
    try {
      const userId = await storage.getUserId();
      if (userId) {
        const response = await apiService.getWalletBalance(userId);
        if (response.success) {
          setWalletBalance(response.balance);
          await storage.saveWalletBalance(response.balance);
        }
      } else {
        // Fallback to cached balance
        const cachedBalance = await storage.getWalletBalance();
        setWalletBalance(cachedBalance);
      }
    } catch (error) {
      console.error('❌ Failed to load wallet balance:', error);
      // Use cached balance
      const cachedBalance = await storage.getWalletBalance();
      setWalletBalance(cachedBalance);
    }
  };

  // Load data on mount and category change
  useEffect(() => {
    setIsLoading(true);
    loadAstrologers();
    loadWalletBalance();
  }, [selectedCategory]);

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAstrologers();
    loadWalletBalance();
  };

  // Filter astrologers (client-side filtering is now handled by API)
  const filteredAstrologers = astrologers;

  const handleAstrologerClick = (astrologer: Astrologer) => {
    navigation.navigate('AstrologerProfile', { astrologer });
  };

  const handleChatClick = (astrologer: Astrologer) => {
    // Check if there's an active session with a different astrologer
    if (sessionState.isActive && sessionState.astrologerId && sessionState.astrologerId !== astrologer.astrologer_id) {
      // Show modal to ask user what to do
      setPendingAstrologer(astrologer);
      setShowActiveChatModal(true);
      console.log(`⚠️ Active chat detected with ${sessionState.astrologerName}, showing modal`);
      return;
    }
    
    // No active session or same astrologer - proceed normally
    navigation.navigate('ChatSession', { astrologer });
  };

  const handleCallClick = (astrologer: Astrologer) => {
    // Voice call disabled for testing - no privacy policy required
    if (FEATURE_FLAGS.VOICE_CHAT_ENABLED) {
      navigation.navigate('VoiceCall', { astrologer });
    } else {
      // Fallback to chat instead
      navigation.navigate('ChatSession', { astrologer });
    }
  };

  const handleWalletClick = () => {
    navigation.navigate('Wallet');
  };

  // Active chat modal handlers
  const handleEndAndSwitch = async () => {
    if (!pendingAstrologer) return;
    
    try {
      // End the current session
      await sessionActions.endSession();
      console.log('✅ Previous session ended, starting new chat');
      
      // Close modal
      setShowActiveChatModal(false);
      
      // Navigate to new chat
      navigation.navigate('ChatSession', { astrologer: pendingAstrologer });
      
      // Clear pending astrologer
      setPendingAstrologer(null);
    } catch (error) {
      console.error('❌ Failed to end session and switch:', error);
      setShowActiveChatModal(false);
    }
  };

  const handleContinuePrevious = () => {
    // Close modal and navigate to existing chat
    setShowActiveChatModal(false);
    setPendingAstrologer(null);
    
    // Navigate to the existing chat session
    navigation.navigate('ChatSession', { 
      conversationId: sessionState.conversationId || undefined 
    });
  };

  const handleCancelModal = () => {
    setShowActiveChatModal(false);
    setPendingAstrologer(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header - MOVED OUTSIDE ScrollView */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* Branding */}
          <View style={styles.branding}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <Text style={styles.appName}>Kundli</Text>
          </View>
          
          {/* Wallet Button */}
          <TouchableOpacity 
            style={styles.walletButton}
            onPress={handleWalletClick}
            activeOpacity={touchableOpacity}
          >
            <Text style={styles.walletIcon}>Wallet</Text>
            <Text style={styles.walletAmount}>₹{walletBalance}</Text>
            <View style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
              <TouchableOpacity
                key={category.name}
                style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                onPress={() => setSelectedCategory(category.name)}
                activeOpacity={touchableOpacity}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText, 
                  isSelected && styles.categoryTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scrollable Content - ONLY astrologer list */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={touchableOpacity}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Astrologer List */}
        <View style={styles.astrologersList}>
          {filteredAstrologers.length === 0 && !isLoading && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No astrologers found</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedCategory === "All" 
                  ? "Please check back later"
                  : `No ${selectedCategory} astrologers available`}
              </Text>
            </View>
          ) : (
            filteredAstrologers.map((astrologer) => (
            <TouchableOpacity 
              key={astrologer.id} 
              style={styles.astrologerCard}
              onPress={() => handleAstrologerClick(astrologer)}
              activeOpacity={touchableOpacity}
            >
              <View style={styles.cardContent}>
                {/* Profile Image */}
                <View style={styles.profileImageContainer}>
                  <Image 
                    source={{ uri: astrologer.image }}
                    style={styles.profileImage}
                  />
                  {/* Online Status */}
                  <View style={[
                    styles.onlineStatus,
                    { backgroundColor: astrologer.isOnline ? '#10b981' : '#6b7280' }
                  ]}>
                    {astrologer.isOnline && <View style={styles.onlineDot} />}
                    <Text style={styles.onlineText}>
                      {astrologer.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
                
                {/* Info Section */}
                <View style={styles.infoSection}>
                  {/* Name & Category */}
                  <View>
                    <Text style={styles.astrologerName} numberOfLines={1}>
                      {astrologer.name}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{astrologer.category}</Text>
                    </View>
                  </View>
                  
                  {/* Rating & Reviews */}
                  <View style={styles.ratingContainer}>
                    <View style={styles.rating}>
                      <Text style={styles.starIcon}>⭐</Text>
                      <Text style={styles.ratingText}>{astrologer.rating}</Text>
                    </View>
                    <Text style={styles.reviewsText}>• {astrologer.reviews} reviews</Text>
                  </View>
                  
                  {/* Experience & Languages */}
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>
                      💼 {astrologer.experience} • {joinAstrologerLanguages(astrologer.languages)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => handleChatClick(astrologer)}
                  activeOpacity={touchableOpacity}
                >
                  <View style={styles.chatButtonGradient}>
                    <Text style={styles.chatButtonText}>Chat • ₹8/min</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.callButton, !FEATURE_FLAGS.VOICE_CHAT_ENABLED && styles.disabledButton]}
                  onPress={() => FEATURE_FLAGS.VOICE_CHAT_ENABLED ? handleCallClick(astrologer) : null}
                  activeOpacity={FEATURE_FLAGS.VOICE_CHAT_ENABLED ? touchableOpacity : 1}
                  disabled={!FEATURE_FLAGS.VOICE_CHAT_ENABLED}
                >
                  <Text style={[styles.callButtonText, !FEATURE_FLAGS.VOICE_CHAT_ENABLED && styles.disabledButtonText]}>
                    {FEATURE_FLAGS.VOICE_CHAT_ENABLED ? 'Call • ₹12/min' : 'Coming Soon'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      
      {/* Active Chat Modal */}
      <ActiveChatModal
        visible={showActiveChatModal}
        currentAstrologerName={sessionState.astrologerName || 'Astrologer'}
        newAstrologerName={pendingAstrologer?.name || 'Astrologer'}
        onEndAndSwitch={handleEndAndSwitch}
        onContinuePrevious={handleContinuePrevious}
        onCancel={handleCancelModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  header: {
    backgroundColor: colors.backgroundCard,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    ...shadows.orange,
  },
  logoIcon: {
    fontSize: 20,
    color: colors.white,
  },
  appName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  walletIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  walletAmount: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  addButton: {
    width: 20,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 12,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
  offerBanner: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: spacing.lg,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  offerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  claimButton: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  claimButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundCard,
    marginRight: spacing.sm,
    minWidth: 80,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  astrologersList: {
    padding: spacing.lg,
  },
  astrologerCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.borderLight,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  onlineDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.white,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  onlineText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  astrologerName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  reviewsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  detailsContainer: {
    marginTop: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  chatButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  chatButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  callButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: colors.textTertiary,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.error,
    marginRight: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default HomeScreen;
