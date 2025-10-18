import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows, gradients, touchableOpacity} from '../constants/theme';
import LinearGradient from 'expo-linear-gradient';

const ProfileScreen = () => {
  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    joinedDate: "January 2024",
    totalSessions: 12,
    favoriteAstrologers: 3
  };

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: '👤',
      action: () => Alert.alert('Edit Profile', 'Profile editing feature coming soon!')
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
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => {
          // In a real app, this would clear user session and navigate to login
          Alert.alert('Logged Out', 'You have been logged out successfully');
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

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

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Kundli App v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 Kundli. All rights reserved.</Text>
        </View>
      </ScrollView>
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
});

export default ProfileScreen;
