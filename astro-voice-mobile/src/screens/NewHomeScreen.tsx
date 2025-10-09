/**
 * Home Screen
 * 
 * Main dashboard showing astrologers with filtering and search.
 * Features: Category filters, wallet balance, offer banner, astrologer list
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../components/ui';
import { AstrologerCard } from '../components/AstrologerCard';
import { astrologersData, categories, Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface NewHomeScreenProps {
  onAstrologerClick: (astrologer: Astrologer) => void;
  onNavigate: (screen: string) => void;
  walletBalance?: number;
}

export function NewHomeScreen({ onAstrologerClick, onNavigate, walletBalance = 500 }: NewHomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAstrologers = selectedCategory === 'All'
    ? astrologersData
    : astrologersData.filter(a => a.category === selectedCategory);

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Branding */}
        <View style={styles.brandingContainer}>
          <View style={[styles.logoIcon, shadows.primary]}>
            <Icon name="star" size={20} color={colors.primaryForeground} />
          </View>
          <Text style={styles.brandTitle}>Kundli</Text>
        </View>
        
        {/* Wallet Button */}
        <TouchableOpacity
          style={styles.walletButton}
          onPress={() => onNavigate('wallet')}
          activeOpacity={0.8}
        >
          <Icon name="credit-card" size={16} color={colors.primary} />
          <Text style={styles.walletAmount}>₹{walletBalance}</Text>
          <View style={styles.addButton}>
            <Icon name="plus" size={12} color={colors.primaryForeground} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Offer Banner */}
      <View style={styles.offerBanner}>
        <View style={styles.offerContent}>
          <Text style={styles.offerTitle}>🎉 Special Offer!</Text>
          <Text style={styles.offerText}>Get 50% OFF on your first consultation</Text>
        </View>
        <Button
          size="sm"
          variant="outline"
          onPress={() => {}}
          style={styles.claimButton}
          textStyle={styles.claimButtonText}
        >
          Claim Now
        </Button>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.name)}
                activeOpacity={0.8}
              >
                <Icon
                  name={category.icon}
                  size={16}
                  color={isSelected ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredAstrologers}
        renderItem={({ item }) => (
          <AstrologerCard
            astrologer={item}
            onPress={() => onAstrologerClick(item)}
            onChatPress={() => onAstrologerClick(item)}
            onCallPress={() => {}}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  brandTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginLeft: spacing.sm,
  },
  
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: spacing.base,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  
  walletAmount: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  
  addButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.base,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  
  offerContent: {
    flex: 1,
  },
  
  offerTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: 2,
  },
  
  offerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
  },
  
  claimButton: {
    height: 36,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  
  claimButtonText: {
    color: colors.primary,
  },
  
  categoriesContainer: {
    marginBottom: spacing.md,
  },
  
  categoriesList: {
    paddingHorizontal: spacing.base,
  },
  
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: colors.card,
    marginRight: spacing.sm,
  },
  
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md,
  },
  
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginLeft: spacing.sm,
  },
  
  categoryTextActive: {
    color: colors.primaryForeground,
  },
  
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['2xl'],
  },
});

