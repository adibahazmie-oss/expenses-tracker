import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Colors from '../style/Colors';

const API_URL = 'http://192.168.56.1:3000/api/expenses';

export default function AddExpenseScreen({ route, navigation }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [mood, setMood] = useState('😐');

  // Dakap user id dari navigation
  const userId = route.params?.user?.id;

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Others'];
  const moods = ['😀', '😐', '💸', '😭', '😡'];

  const handleSaveExpense = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please fill in title and amount!');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User session not found. Please re-login.');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, 
          title: title, // Dah ditukar dari notes -> title supaya keluar kat history
          amount: parseFloat(amount),
          category: category,
          date: new Date().toISOString(),
          mood: mood
        }),
      });

      const json = await response.json();

      if (response.ok || json.success) {
        Alert.alert('Success', 'Transaction recorded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setAmount('');
              setCategory('Food');
              setMood('😐');
              // Patah balik ke Home 
              navigation.navigate('Home');
            }
          }
        ]);
      } else {
        Alert.alert('Failed', json.message || 'Failed to save transaction.');
      }
    } catch (error) {
      console.log("Error saving expense:", error);
      Alert.alert('Error', 'Cannot connect to server.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Transaction Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Starbucks Coffee, Dinner, Emas"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Amount (RM)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.activeChip]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>How's your spending mood?</Text>
        <View style={styles.moodContainer}>
          {moods.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.moodButton, mood === m && styles.activeMood]}
              onPress={() => setMood(m)}
            >
              <Text style={styles.moodText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveExpense}>
          <Text style={styles.saveButtonText}>💾 Save to MySQL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F5F5F5', padding: 15, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 3, marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { backgroundColor: '#F0F0F0', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  activeChip: { backgroundColor: Colors.primary || '#e6ee00' },
  chipText: { color: '#555', fontSize: 13 },
  activeChipText: { color: '#000', fontWeight: 'bold' },
  moodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  moodButton: { padding: 10, borderRadius: 10, backgroundColor: '#F0F0F0', minWidth: 50, alignItems: 'center' },
  activeMood: { backgroundColor: '#FFE082', borderColor: '#FFB300', borderWidth: 1 },
  moodText: { fontSize: 22 },
  saveButton: { backgroundColor: Colors.primary || '#e6ee00', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15, elevation: 2 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});