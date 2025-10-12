import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';

type TransactionStatusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionStatus'>;
type TransactionStatusScreenRouteProp = RouteProp<RootStackParamList, 'TransactionStatus'>;

const TransactionStatusScreen = () => {
  const navigation = useNavigation<TransactionStatusScreenNavigationProp>();
  const route = useRoute<TransactionStatusScreenRouteProp>();
  const { status } = route.params;

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          title: 'Transaction Successful',
          message: 'Your wallet has been recharged successfully!',
          buttonText: 'Continue',
          buttonColor: '#10b981'
        };
      case 'failed':
        return {
          icon: '❌',
          title: 'Transaction Failed',
          message: 'Sorry, your transaction could not be processed. Please try again.',
          buttonText: 'Retry',
          buttonColor: '#ef4444'
        };
      case 'pending':
        return {
          icon: '⏳',
          title: 'Transaction Pending',
          message: 'Your transaction is being processed. You will be notified once completed.',
          buttonText: 'Ok',
          buttonColor: '#f59e0b'
        };
      default:
        return {
          icon: '❓',
          title: 'Transaction Status',
          message: 'Unknown transaction status.',
          buttonText: 'Continue',
          buttonColor: '#6366f1'
        };
    }
  };

  const config = getStatusConfig();

  const handleContinue = () => {
    if (status === 'failed') {
      // Go back to wallet for retry
      navigation.navigate('Wallet');
    } else {
      // Go back to main screen
      navigation.navigate('Main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{config.icon}</Text>
          <Text style={styles.statusTitle}>{config.title}</Text>
          <Text style={styles.statusMessage}>{config.message}</Text>
          
          {status === 'success' && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>₹500</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID:</Text>
                <Text style={styles.detailValue}>TXN123456789</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: config.buttonColor }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{config.buttonText}</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  statusIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default TransactionStatusScreen;
