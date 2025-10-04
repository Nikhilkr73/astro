import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, Astrologer } from '../types';
import AstrologerCard from '../components/AstrologerCard';
import AstrologerDetailsModal from '../components/AstrologerDetailsModal';
import { astrologersData, getAvailableAstrologers, getAstrologersBySpecialization } from '../data/astrologers';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const FILTER_OPTIONS = [
  { id: 'all', label: 'सभी', value: '' },
  { id: 'available', label: 'उपलब्ध', value: 'available' },
  { id: 'vedic', label: 'वैदिक', value: 'वैदिक' },
  { id: 'numerology', label: 'अंक', value: 'नुमेरोलॉजी' },
  { id: 'palmistry', label: 'हस्तरेखा', value: 'हस्तरेखा' },
  { id: 'tantra', label: 'तंत्र', value: 'तंत्र' },
];

export default function AstrologerSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and search astrologers
  const filteredAstrologers = useMemo(() => {
    let results = astrologersData;

    // Apply filter
    if (selectedFilter === 'available') {
      results = getAvailableAstrologers();
    } else if (selectedFilter !== 'all') {
      results = getAstrologersBySpecialization(selectedFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(astrologer =>
        astrologer.nameHindi.toLowerCase().includes(query) ||
        astrologer.name.toLowerCase().includes(query) ||
        astrologer.specialization.some(spec => spec.toLowerCase().includes(query))
      );
    }

    // Sort by availability first, then by rating
    return results.sort((a, b) => {
      if (a.availability !== b.availability) {
        return a.availability ? -1 : 1; // Available first
      }
      return b.rating - a.rating; // Higher rating first
    });
  }, [searchQuery, selectedFilter]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh - in real app, this would fetch latest data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <Text style={styles.headerTitle}>अपना ज्योतिषी चुनें</Text>
        <Text style={styles.headerSubtitle}>
          {filteredAstrologers.length} ज्योतिषी उपलब्ध
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="ज्योतिषी खोजें..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.activeFilterChip,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {astrologersData.filter(a => a.availability).length}
          </Text>
          <Text style={styles.statLabel}>उपलब्ध</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {astrologersData.filter(a => a.rating >= 4.5).length}
          </Text>
          <Text style={styles.statLabel}>टॉप रेटेड</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round(astrologersData.reduce((sum, a) => sum + a.experience, 0) / astrologersData.length)}
          </Text>
          <Text style={styles.statLabel}>औसत अनुभव</Text>
        </View>
      </View>

      {/* Astrologers List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAstrologers.length > 0 ? (
          filteredAstrologers.map((astrologer) => (
            <AstrologerCard
              key={astrologer.id}
              astrologer={astrologer}
              onSelect={handleAstrologerSelect}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>कोई ज्योतिषी नहीं मिला</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'अपनी खोज बदलकर पुनः प्रयास करें' : 'फिल्टर बदलकर देखें'}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});