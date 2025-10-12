import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
} from 'react-native';

const SimpleChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'astrologer', timestamp: '12:00 PM' },
    { id: '2', text: 'Hi there!', sender: 'user', timestamp: '12:01 PM' },
    { id: '3', text: 'What would you like to know about your future?', sender: 'astrologer', timestamp: '12:01 PM' },
    { id: '4', text: 'Tell me about my career', sender: 'user', timestamp: '12:02 PM' },
    { id: '5', text: 'Based on your birth chart, your career will flourish in the next 6 months.', sender: 'astrologer', timestamp: '12:02 PM' },
    { id: '6', text: 'That sounds great!', sender: 'user', timestamp: '12:03 PM' },
    { id: '7', text: 'You will face some challenges but they will lead to success.', sender: 'astrologer', timestamp: '12:03 PM' },
    { id: '8', text: 'Can you tell me more?', sender: 'user', timestamp: '12:04 PM' },
    { id: '9', text: 'Certainly! Your Jupiter placement indicates good fortune in business.', sender: 'astrologer', timestamp: '12:04 PM' },
    { id: '10', text: 'What about relationships?', sender: 'user', timestamp: '12:05 PM' },
    { id: '11', text: 'Your Venus is well-placed, indicating a harmonious relationship ahead.', sender: 'astrologer', timestamp: '12:05 PM' },
    { id: '12', text: 'Thank you so much!', sender: 'user', timestamp: '12:06 PM' },
    { id: '13', text: 'You are welcome! Is there anything else?', sender: 'astrologer', timestamp: '12:06 PM' },
    { id: '14', text: 'Not for now, thanks!', sender: 'user', timestamp: '12:07 PM' },
    { id: '15', text: 'Have a wonderful day!', sender: 'astrologer', timestamp: '12:07 PM' },
  ]);

  const [inputText, setInputText] = useState('');

  const addMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Add auto response
      setTimeout(() => {
        const autoResponse = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message! How can I help you further?',
          sender: 'astrologer',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, autoResponse]);
      }, 1000);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          Simple Chat Test
        </div>

        {/* Messages - Scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.sender === 'user' ? '#007AFF' : '#E5E5EA',
                color: message.sender === 'user' ? 'white' : 'black'
              }}>
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                  {message.text}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.7,
                  textAlign: 'right'
                }}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: '16px',
          backgroundColor: '#fff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '16px',
              outline: 'none'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addMessage();
              }
            }}
          />
          <button
            onClick={addMessage}
            style={{
              padding: '12px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  // Fallback for mobile
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Simple Chat Test</Text>
      </View>
      <View style={styles.messagesContainer}>
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.sender === 'user' ? styles.userMessage : styles.astrologerMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userMessageText : styles.astrologerMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.timestamp}>{message.timestamp}</Text>
          </View>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={addMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  astrologerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userMessageText: {
    color: 'white',
  },
  astrologerMessageText: {
    color: 'black',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SimpleChatScreen;
