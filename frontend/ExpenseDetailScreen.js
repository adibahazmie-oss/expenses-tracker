import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Colors from '../style/Colors'; // Path dilaraskan
import Button from '../component/Button'; // Path dilaraskan

export default function ExpenseDetailScreen({ route, navigation }) {
  const { item } = route.params;

  const handleDelete = async () => {
    Alert.alert('Confirmation', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`http://192.168.56.1:3000/api/expenses/${item.id}`, {
              method: 'DELETE'
            });
            const res = await response.json();
            if (res.success) {
              Alert.alert('Success', 'Transaction has been deleted.');
              navigation.goBack();
            }
          } catch (e) {
              console.log("Error:", e);
              Alert.alert('Error', 'Gagal sambung ke server. Sila cuba lagi.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailsCard}>
        <Text style={styles.label}>Item Name</Text>
        <Text style={styles.value}>{item.title || item.notes}</Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={[styles.value, { color: Colors.danger || '#C62828', fontSize: 24 }]}>RM {parseFloat(item.amount).toFixed(2)}</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{item.category}</Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{item.date}</Text>

        <Text style={styles.label}>Transaction Mood</Text>
        <Text style={[styles.value, { fontSize: 22 }]}>{item.mood || '😊'}</Text>
      </View>

      <Button title="Edit Transaction" onPress={() => navigation.navigate('EditExpense', { item })} />
      <View style={{ marginTop: 10 }}>
        <Button title="Delete" type="danger" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  detailsCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 20 },
  label: { fontSize: 12, color: Colors.textLight || '#666', marginBottom: 4, marginTop: 12, textTransform: 'uppercase' },
  value: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
});