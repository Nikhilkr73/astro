/**
 * Profile Screen
 * 
 * User profile display with settings and logout.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Avatar, Button, Card } from '../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'edit', title: 'Edit Profile', icon: 'edit-2', screen: 'edit-profile' },
  { id: 'wallet', title: 'Wallet & Transactions', icon: 'credit-card', screen: 'wallet' },
  { id: 'chat-history', title: 'Chat History', icon: 'message-square', screen: 'chat' },
  { id: 'notifications', title: 'Notifications', icon: 'bell', screen: 'notifications' },
  { id: 'language', title: 'Language', icon: 'globe', screen: 'language' },
  { id: 'privacy', title: 'Privacy Policy', icon: 'shield', screen: 'privacy' },
  { id: 'terms', title: 'Terms & Conditions', icon: 'file-text', screen: 'terms' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle', screen: 'help' },
];

export function ProfileScreen({ onNavigate, onLogout }: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Avatar
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
            size="xl"
            border
            style={styles.avatar}
          />
          <Text style={styles.name}>Nikhil Kumar</Text>
          <Text style={styles.phone}>+91 98765 43210</Text>
          <Text style={styles.email}>nikhil@example.com</Text>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onNavigate('edit-profile')}
          >
            <Icon name="edit-2" size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => onNavigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        {/* Logout Button */}
        <Button
          variant="outline"
          onPress={onLogout}
          style={styles.logoutButton}
        >
          <Icon name="log-out" size={20} color={colors.destructive} />
          <Text style={styles.logoutText}>Logout</Text>
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base
  },
  
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  profileCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.xl
  },
  
  avatar: {
    marginBottom: spacing.base
  },
  
  name: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: spacing.xs
  },
  
  phone: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginBottom: spacing.xs
  },
  
  email: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginBottom: spacing.base
  },
  
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  
  editButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary
  },
  
  menuSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  menuItemText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.foreground
  },
  
  version: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  
  logoutButton: {
    marginHorizontal: spacing.xl,
    borderColor: colors.destructive
  },
  
  logoutText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.destructive
  }
});
