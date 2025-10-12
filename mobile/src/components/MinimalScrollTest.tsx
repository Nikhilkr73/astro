import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

const MinimalScrollTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimal Scroll Test</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.item}>Item 1</Text>
          <Text style={styles.item}>Item 2</Text>
          <Text style={styles.item}>Item 3</Text>
          <Text style={styles.item}>Item 4</Text>
          <Text style={styles.item}>Item 5</Text>
          <Text style={styles.item}>Item 6</Text>
          <Text style={styles.item}>Item 7</Text>
          <Text style={styles.item}>Item 8</Text>
          <Text style={styles.item}>Item 9</Text>
          <Text style={styles.item}>Item 10</Text>
          <Text style={styles.item}>Item 11</Text>
          <Text style={styles.item}>Item 12</Text>
          <Text style={styles.item}>Item 13</Text>
          <Text style={styles.item}>Item 14</Text>
          <Text style={styles.item}>Item 15</Text>
          <Text style={styles.item}>Item 16</Text>
          <Text style={styles.item}>Item 17</Text>
          <Text style={styles.item}>Item 18</Text>
          <Text style={styles.item}>Item 19</Text>
          <Text style={styles.item}>Item 20</Text>
          <Text style={styles.item}>Item 21</Text>
          <Text style={styles.item}>Item 22</Text>
          <Text style={styles.item}>Item 23</Text>
          <Text style={styles.item}>Item 24</Text>
          <Text style={styles.item}>Item 25</Text>
          <Text style={styles.item}>Item 26</Text>
          <Text style={styles.item}>Item 27</Text>
          <Text style={styles.item}>Item 28</Text>
          <Text style={styles.item}>Item 29</Text>
          <Text style={styles.item}>Item 30</Text>
        </View>
      </ScrollView>
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
  },
  content: {
    padding: 20,
  },
  item: {
    fontSize: 16,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});

export default MinimalScrollTest;
