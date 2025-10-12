import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const ScrollTest = () => {
  console.log('🔬 ScrollTest component rendering...');
  const scrollViewRef = useRef<ScrollView>(null);
  const [testMessages, setTestMessages] = useState([
    { id: '1', text: 'Message 1' },
    { id: '2', text: 'Message 2' },
    { id: '3', text: 'Message 3' },
    { id: '4', text: 'Message 4' },
    { id: '5', text: 'Message 5' },
    { id: '6', text: 'Message 6' },
    { id: '7', text: 'Message 7' },
    { id: '8', text: 'Message 8' },
    { id: '9', text: 'Message 9' },
    { id: '10', text: 'Message 10' },
    { id: '11', text: 'Message 11' },
    { id: '12', text: 'Message 12' },
    { id: '13', text: 'Message 13' },
    { id: '14', text: 'Message 14' },
    { id: '15', text: 'Message 15' },
    { id: '16', text: 'Message 16' },
    { id: '17', text: 'Message 17' },
    { id: '18', text: 'Message 18' },
    { id: '19', text: 'Message 19' },
    { id: '20', text: 'Message 20' },
  ]);

  const addMessage = () => {
    const newId = (testMessages.length + 1).toString();
    setTestMessages(prev => [...prev, { id: newId, text: `Message ${newId}` }]);
  };

  const testScroll = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
      Alert.alert('Test', 'Scroll to end triggered');
    }
  };

  const testScrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
      Alert.alert('Test', 'Scroll to top triggered');
    }
  };

  const checkScrollViewProps = () => {
    Alert.alert(
      'ScrollView Info',
      `Messages count: ${testMessages.length}\n` +
      `ScrollView ref: ${scrollViewRef.current ? 'EXISTS' : 'NULL'}\n` +
      `Container height: flex: 1\n` +
      `Content padding: 20px bottom`
    );
  };

  console.log('🔬 ScrollTest rendering with', testMessages.length, 'messages');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Scroll Test</Text>
        <TouchableOpacity style={styles.testButton} onPress={checkScrollViewProps}>
          <Text style={styles.buttonText}>Info</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        onContentSizeChange={() => {
          console.log('📏 Content size changed, messages:', testMessages.length);
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }}
        onScroll={(event) => {
          console.log('📜 Scroll event:', event.nativeEvent.contentOffset.y);
        }}
      >
        {testMessages.map((message) => (
          <View key={message.id} style={styles.messageItem}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.actionButton} onPress={addMessage}>
          <Text style={styles.buttonText}>Add Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={testScroll}>
          <Text style={styles.buttonText}>Scroll End</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={testScrollToTop}>
          <Text style={styles.buttonText}>Scroll Top</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  testButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100, // Space for input area
  },
  messageItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default ScrollTest;
