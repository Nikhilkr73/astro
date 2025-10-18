import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  BackHandler,
} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows, gradients, touchableOpacity} from '../constants/theme';
import LinearGradient from 'expo-linear-gradient';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import { DeviceEventEmitter } from 'react-native';

const ProfileScreen = ({navigation}: any) => {
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    email: "",
    phone: "",
    joinedDate: "",
    totalSessions: 0,
    favoriteAstrologers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Debug navigation prop
  console.log('🔍 ProfileScreen navigation prop:', navigation);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      console.log('🔍 Starting profile load...');
      
      const storedUserId = await storage.getUserId();
      console.log('📱 Retrieved user ID from storage:', storedUserId);
      
      if (storedUserId) {
        setUserId(storedUserId);
        console.log('🌐 Calling API to get user profile...');
        
        const userData = await apiService.getUserProfile(storedUserId);
        console.log('📋 Raw API response:', userData);
        
        // Format user data for display
        const formattedProfile = {
          name: userData.full_name || userData.display_name || "User",
          email: userData.email || "",
          phone: userData.phone_number || "",
          joinedDate: userData.created_at 
            ? new Date(userData.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })
            : "Unknown",
          totalSessions: userData.total_sessions || 0,
          favoriteAstrologers: userData.favorite_astrologers || 0
        };
        
        console.log('✅ Formatted profile data:', formattedProfile);
        setUserProfile(formattedProfile);
      } else {
        console.log('❌ No user ID found in storage');
        setHasError(true);
        Alert.alert('Error', 'User not found. Please login again.');
      }
    } catch (error: any) {
      console.error('❌ Error loading user profile:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      
      // Check if it's a 404 error (user not found in database)
      if (error?.response?.status === 404) {
        console.log('🔄 User not found in database, clearing local storage...');
        await storage.clearUserData();
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please login again.',
          [
            { text: "OK", onPress: () => {
              // Navigate back to login screen
              navigation?.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }}
          ]
        );
        return;
      }
      
      setHasError(true);
      
      // Set error state instead of infinite loading
      setUserProfile({
        name: "Error Loading Profile",
        email: "Unable to load",
        phone: "Unable to load",
        joinedDate: "Unknown",
        totalSessions: 0,
        favoriteAstrologers: 0
      });
      
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: '👤',
      action: () => {
        if (userId) {
          // Navigate to OnboardingFormScreen in edit mode
          navigation?.navigate('Onboarding', {
            userId: userId,
            isEditMode: true,
            onComplete: () => {
              // Reload profile after editing
              loadUserProfile();
            }
          });
        } else {
          Alert.alert('Error', 'User ID not found');
        }
      }
    },
    {
      id: '2',
      title: 'My Consultations',
      icon: '📋',
      action: () => Alert.alert('Consultations', 'View all your past consultations')
    },
    {
      id: '3',
      title: 'Favorite Astrologers',
      icon: '⭐',
      action: () => Alert.alert('Favorites', 'Manage your favorite astrologers')
    },
    {
      id: '4',
      title: 'Notification Settings',
      icon: '🔔',
      action: () => Alert.alert('Notifications', 'Configure notification preferences')
    },
    {
      id: '5',
      title: 'Privacy Policy',
      icon: '🔒',
      action: () => Alert.alert('Privacy Policy', 'View privacy policy')
    },
    {
      id: '6',
      title: 'Terms of Service',
      icon: '📄',
      action: () => Alert.alert('Terms', 'View terms of service')
    },
    {
      id: '7',
      title: 'Help & Support',
      icon: '🎧',
      action: () => Alert.alert('Support', 'Contact customer support')
    },
    {
      id: '8',
      title: 'Rate the App',
      icon: '⭐',
      action: () => Alert.alert('Rate App', 'Please rate our app on the store')
    },
    {
      id: '9',
      title: 'Clear Cache (Testing)',
      icon: '🗑️',
      action: () => {
        Alert.alert(
          "Clear Cache",
          "This will clear all stored user data and log you out. Use this for testing different users.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Clear Cache", style: "destructive", onPress: async () => {
              try {
                await storage.clearUserData();
                Alert.alert('Cache Cleared', 'All user data cleared. The app will restart.', [
                  { text: "OK", onPress: () => {
                    // Navigate back to login screen
                    navigation?.getParent()?.reset({
                      index: 0,
                      routes: [{ name: 'Auth' }],
                    });
                  }}
                ]);
              } catch (error) {
                console.error('❌ Clear cache error:', error);
                Alert.alert('Error', 'Failed to clear cache');
              }
            }}
          ]
        );
      }
    }
  ];

  const handleLogout = async () => {
    console.log('🚪 Logout button pressed');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await storage.clearUserData();
      console.log('✅ User data cleared');
      
      // Close modal first
      setShowLogoutModal(false);
      
      // Emit logout event to trigger AppNavigator re-initialization
      setTimeout(() => {
        console.log('✅ Logout completed successfully');
        console.log('📡 Emitting logout event...');
        
        // Emit custom event to notify AppNavigator
        DeviceEventEmitter.emit('user_logout');
        
        // Also try navigation as fallback
        try {
          const parentNav = navigation?.getParent();
          if (parentNav) {
            parentNav.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
            console.log('✅ Navigation reset called');
          }
        } catch (error) {
          console.error('❌ Navigation error:', error);
        }
      }, 300); // Increased delay to ensure modal closes
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => {
    console.log('❌ Logout cancelled');
    setShowLogoutModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load Profile</Text>
          <Text style={styles.errorMessage}>
            Unable to load your profile data. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadUserProfile}
            activeOpacity={touchableOpacity}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
            <Text style={styles.userPhone}>{userProfile.phone}</Text>
            <Text style={styles.joinedText}>Member since {userProfile.joinedDate}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.favoriteAstrologers}</Text>
            <Text style={styles.statLabel}>Favorite Astrologers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating Given</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.action}
              activeOpacity={touchableOpacity}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={touchableOpacity}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Scroll Hint */}
        <View style={styles.scrollHint}>
          <Text style={styles.scrollHintText}>↓ Scroll down for more options</Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Kundli App v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 Kundli. All rights reserved.</Text>
        </View>
      </ScrollView>
      )}

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelLogout}
                activeOpacity={touchableOpacity}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalLogoutButton}
                onPress={confirmLogout}
                activeOpacity={touchableOpacity}
              >
                <Text style={styles.modalLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize['xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: colors.backgroundCard,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    ...shadows.md,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.orangeLg,
  },
  avatarText: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  joinedText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
  },
  statsSection: {
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  menuSection: {
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    fontFamily: typography.fontFamily.bold,
    color: colors.textTertiary,
  },
  logoutSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.error,
  },
  scrollHint: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scrollHintText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  appVersion: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  appCopyright: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    margin: spacing.xl,
    minWidth: 280,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize['xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  modalLogoutButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalLogoutText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
});

export default ProfileScreen;
