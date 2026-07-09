import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Colors from '../style/Colors';
import ExpenseCard from '../component/ExpenseCard';

const API_URL = 'http://192.168.56.1:3000/api/expenses_list'; 

export default function ExpenseHistoryScreen({ route, navigation }) {
  const isFocused = useIsFocused(); // Jejak skrin tengah aktif atau tidak
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = route.params?.user?.id;

  const fetchHistory = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}?user_id=${userId}`);
      const json = await response.json();
      if (json.expenses) {
        setHistoryData(json.expenses);
      }
    } catch (error) {
      console.log("Database connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchHistory();
    }
  }, [userId, isFocused]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary || '#e6ee00'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {historyData.length === 0 ? (
        <Text style={styles.emptyText}>No transaction records found.</Text>
      ) : (
        <FlatList 
          data={historyData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ExpenseCard 
              title={`${item.mood || '😐'} ${item.title}`} // Menggunakan item.title dengan betul
              amount={item.amount} 
              category={item.category} 
              date={item.date}
              onPress={() => navigation.navigate('ExpenseDetails', { item })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F5F5F5', padding: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});