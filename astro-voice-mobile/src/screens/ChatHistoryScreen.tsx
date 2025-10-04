import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockHistory = [
  { id: '1', astrologer: 'पंडित राज शर्मा', date: '2024-01-15', duration: '15 मिनट', topic: 'करियर समाधान' },
  { id: '2', astrologer: 'आचार्य सुनीता जी', date: '2024-01-10', duration: '20 मिनट', topic: 'रिश्ते की समस्या' },
  { id: '3', astrologer: 'गुरु विकास अग्रवाल', date: '2024-01-05', duration: '25 मिनट', topic: 'स्वास्थ्य संबंधी सलाह' },
];

export default function ChatHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>बातचीत का इतिहास</Text>
      <ScrollView style={styles.scrollView}>
        {mockHistory.map((chat) => (
          <TouchableOpacity key={chat.id} style={styles.chatItem}>
            <View style={styles.chatIcon}>
              <Ionicons name="chatbubbles" size={24} color="#FF6B35" />
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.astrologerName}>{chat.astrologer}</Text>
              <Text style={styles.topic}>{chat.topic}</Text>
              <View style={styles.metadata}>
                <Text style={styles.date}>{chat.date}</Text>
                <Text style={styles.duration}>{chat.duration}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  scrollView: { flex: 1 },
  chatItem: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  chatIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  chatInfo: { flex: 1 },
  astrologerName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  topic: { fontSize: 14, color: '#666', marginBottom: 5 },
  metadata: { flexDirection: 'row', gap: 15 },
  date: { fontSize: 12, color: '#999' },
  duration: { fontSize: 12, color: '#FF6B35', fontWeight: 'bold' },
});