import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const SimpleScrollTest = () => {
  console.log('🧪 SimpleScrollTest rendering...');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Scroll Test</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.text}>Item 1</Text>
        <Text style={styles.text}>Item 2</Text>
        <Text style={styles.text}>Item 3</Text>
        <Text style={styles.text}>Item 4</Text>
        <Text style={styles.text}>Item 5</Text>
        <Text style={styles.text}>Item 6</Text>
        <Text style={styles.text}>Item 7</Text>
        <Text style={styles.text}>Item 8</Text>
        <Text style={styles.text}>Item 9</Text>
        <Text style={styles.text}>Item 10</Text>
        <Text style={styles.text}>Item 11</Text>
        <Text style={styles.text}>Item 12</Text>
        <Text style={styles.text}>Item 13</Text>
        <Text style={styles.text}>Item 14</Text>
        <Text style={styles.text}>Item 15</Text>
        <Text style={styles.text}>Item 16</Text>
        <Text style={styles.text}>Item 17</Text>
        <Text style={styles.text}>Item 18</Text>
        <Text style={styles.text}>Item 19</Text>
        <Text style={styles.text}>Item 20</Text>
        <Text style={styles.text}>Item 21</Text>
        <Text style={styles.text}>Item 22</Text>
        <Text style={styles.text}>Item 23</Text>
        <Text style={styles.text}>Item 24</Text>
        <Text style={styles.text}>Item 25</Text>
        <Text style={styles.text}>Item 26</Text>
        <Text style={styles.text}>Item 27</Text>
        <Text style={styles.text}>Item 28</Text>
        <Text style={styles.text}>Item 29</Text>
        <Text style={styles.text}>Item 30</Text>
      </ScrollView>
      
      <Text style={styles.footer}>Footer - Should stay at bottom</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  scrollContent: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  footer: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export default SimpleScrollTest;
