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

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [walletBalance, setWalletBalance] = useState(500);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    navigation.navigate('ChatSession', { astrologer });
  };

  const handleCallClick = (astrologer: Astrologer) => {
    navigation.navigate('VoiceCall', { astrologer });
  };

  const handleWalletClick = () => {
    navigation.navigate('Wallet');
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Header */}
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
              activeOpacity={0.8}
            >
              <Text style={styles.walletIcon}>💳</Text>
              <Text style={styles.walletAmount}>₹{walletBalance}</Text>
              <View style={styles.addButton}>
                <Text style={styles.addIcon}>+</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Offer Banner */}
          <View style={styles.offerBanner}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>🎉 Special Offer!</Text>
              <Text style={styles.offerText}>Get 50% OFF on your first consultation</Text>
            </View>
            <TouchableOpacity style={styles.claimButton}>
              <Text style={styles.claimButtonText}>Claim Now</Text>
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
                  activeOpacity={0.8}
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

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
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
              activeOpacity={0.9}
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
                      💼 {astrologer.experience} • {astrologer.languages.join(", ")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => handleChatClick(astrologer)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chatButtonText}>💬 Chat • ₹8/min</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.callButton} 
                  onPress={() => handleCallClick(astrologer)}
                >
                  <Text style={styles.callButtonText}>📞 Call • ₹12/min</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  walletIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginRight: 8,
  },
  addButton: {
    width: 20,
    height: 20,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  offerBanner: {
    marginHorizontal: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 16,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  offerText: {
    fontSize: 12,
    color: '#92400e',
  },
  claimButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginRight: 8,
    minWidth: 80,
  },
  categoryButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  astrologersList: {
    padding: 16,
  },
  astrologerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    marginRight: 4,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  astrologerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  callButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default HomeScreen;
