import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface ChatActionModalProps {
  visible: boolean;
  astrologerName: string;
  onContinue: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}

const ChatActionModal: React.FC<ChatActionModalProps> = ({
  visible,
  astrologerName,
  onContinue,
  onStartNew,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Chat with {astrologerName}</Text>
              <Text style={styles.subtitle}>Choose how you'd like to proceed</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Continue Chat Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue Chat</Text>
              </TouchableOpacity>

              {/* Start New Chat Button */}
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={onStartNew}
                activeOpacity={0.8}
              >
                <Text style={styles.newChatButtonText}>Start New Chat</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.6,
    maxWidth: 300,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FFE4B5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#F7931E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  newChatButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#F7931E',
  },
  newChatButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#F7931E',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ChatActionModal;
