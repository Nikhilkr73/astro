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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.8,
    maxWidth: 340,
    minWidth: 300,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#FFE4B5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F7931E',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 16,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  newChatButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: '#F7931E',
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newChatButtonText: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: '#F7931E',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default ChatActionModal;
