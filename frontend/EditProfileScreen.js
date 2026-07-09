import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../style/Colors';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome 👋</Text>
        <Text style={styles.subText}>This is a summary of your financial status today.</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Financial Summary</Text>
        <Text style={styles.infoContent}>All systems are running smoothly.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F5F5F5', padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: Colors.text || '#333' },
  subText: { fontSize: 14, color: '#666', marginTop: 5 },
  infoBox: { marginTop: 20, padding: 15, backgroundColor: '#E3F2FD', borderRadius: 10 },
  infoTitle: { fontWeight: 'bold', color: '#0D47A1' },
  infoContent: { color: '#1565C0', marginTop: 4 }
});