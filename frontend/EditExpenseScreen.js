import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Colors from '../style/Colors'; // Path 
import Button from '../component/Button'; // Path 

export default function EditExpenseScreen({ route, navigation }) {
  const { item } = route.params;
  const [title, setTitle] = useState(item.title || item.notes);
  const [amount, setAmount] = useState(item.amount.toString());
  const [category, setCategory] = useState(item.category);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://192.168.56.1:3000/api/expenses/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), category, title: title })
      });
      const res = await response.json();
      if (res.success) {
        Alert.alert('Success', 'Data has been updated in the database!');
        navigation.popToTop();
      }
    } catch (e) {
  console.log("Error:", e);
  Alert.alert('Error', 'Error updating expense.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit Name</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Edit Amount (RM)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Edit Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />

      <View style={{ marginTop: 30 }}>
        <Button title="Save Changes" onPress={handleUpdate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderColor: Colors.border, borderWidth: 1, fontSize: 16 },
});