import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

// =============================================================================
// COMPONENT
// =============================================================================

interface ActiveChatModalProps {
  visible: boolean;
  currentAstrologerName: string;
  newAstrologerName: string;
  onEndAndSwitch: () => Promise<void>;
  onContinuePrevious: () => void;
  onCancel: () => void;
}

export function ActiveChatModal({
  visible,
  currentAstrologerName,
  newAstrologerName,
  onEndAndSwitch,
  onContinuePrevious,
  onCancel,
}: ActiveChatModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleEndAndSwitch = async () => {
    setIsLoading(true);
    try {
      await onEndAndSwitch();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.icon}>💬</Text>
            <Text style={styles.title}>Active Chat in Progress</Text>
          </View>
          
          <Text style={styles.message}>
            You have an ongoing chat with <Text style={styles.highlight}>{currentAstrologerName}</Text>.
            {'\n\n'}
            Would you like to end it and start a new chat with <Text style={styles.highlight}>{newAstrologerName}</Text>?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEndAndSwitch}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>End & Switch</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onContinuePrevious}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Continue Previous Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E2E2E',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  highlight: {
    color: '#F7931E',
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#F7931E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
  },
});

export default ActiveChatModal;

