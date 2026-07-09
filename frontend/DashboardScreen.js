import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Tambah ini untuk auto-refresh!
import Colors from '../style/Colors'; 

const API_URL = 'http://192.168.56.1:3000/api/dashboard'; 

export default function DashboardScreen({ route }) {
  const isFocused = useIsFocused(); 
  const [loading, setLoading] = useState(true); 
  
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    financialHealth: 'Good'
  });

  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [inputIncome, setInputIncome] = useState("0");

  const userId = route.params?.user?.id;
  const userName = route.params?.user?.name || 'User'; 

  const fetchDashboardData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}?user_id=${userId}`);
      const json = await response.json();
      
      const fetchedIncome = parseFloat(json.totalIncome) || 0;
      const fetchedExpense = parseFloat(json.totalExpense) || 0;

      setData({
        totalIncome: fetchedIncome,
        totalExpense: fetchedExpense,
        financialHealth: json.financialHealth || 'Good'
      });
      
      setInputIncome(fetchedIncome.toString());
    } catch (error) {
      console.log("Data fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  //bhgian refresh
  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [userId, isFocused]);

  const currentIncome = parseFloat(inputIncome) || 0;
  const currentExpense = parseFloat(data.totalExpense) || 0;
  const calculatedBalance = currentIncome - currentExpense;

  const isHealthy = currentIncome > 0 ? calculatedBalance > (currentIncome * 0.2) : true;

  const handleSaveIncome = async () => {
    setIsEditingIncome(false);
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/update-income`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          income: currentIncome
        }),
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.log("error API update-income:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary || '#e6ee00'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome, {userName} 👋</Text>
        <Text style={styles.subText}>This is a summary of your financial status today.</Text>
      </View>

      <View style={styles.meterContainer}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Total Balance:</Text>
          <Text style={styles.balanceValue}>RM {calculatedBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.box, { backgroundColor: '#E8F5E9' }]} 
            onPress={() => setIsEditingIncome(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.boxLabel}>Income (Click to edit)</Text>
            {isEditingIncome ? (
              <TextInput
                style={styles.inputStyle}
                keyboardType="numeric"
                value={inputIncome}
                onChangeText={(text) => setInputIncome(text)}
                onBlur={handleSaveIncome}
                onSubmitEditing={handleSaveIncome}
                autoFocus
              />
            ) : (
              <Text style={[styles.boxValue, { color: '#2E7D32' }]}>+ RM {currentIncome.toFixed(2)}</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.box, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.boxLabel}>Expenses</Text>
            <Text style={[styles.boxValue, { color: '#C62828' }]}>- RM {currentExpense.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: (isHealthy && calculatedBalance >= 0) ? '#E3F2FD' : '#FFEBEE' }]}>
          <Text style={[styles.infoTitle, { color: (isHealthy && calculatedBalance >= 0) ? '#0D47A1' : '#C62828' }]}>
            📊 Financial Health Meter
          </Text>
          <Text style={[styles.infoContent, { color: (isHealthy && calculatedBalance >= 0) ? '#1565C0' : '#B71C1C' }]}>
            Expense Status: {(isHealthy && calculatedBalance >= 0) ? 'Positive & Stable' : 'Critical / Needs Attention'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F5F5F5', padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 2 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: Colors.text || '#333' },
  subText: { fontSize: 14, color: '#666', marginTop: 5 },
  meterContainer: { marginTop: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  balanceRow: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceValue: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  box: { flex: 0.48, padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  boxLabel: { fontSize: 11, color: '#555' },
  boxValue: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  infoBox: { padding: 15, borderRadius: 10 },
  infoTitle: { fontWeight: 'bold' },
  infoContent: { marginTop: 4 },
  inputStyle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', borderBottomWidth: 1, borderBottomColor: '#2E7D32', paddingHorizontal: 5, marginTop: 5, textAlign: 'center', width: '100%' }
});