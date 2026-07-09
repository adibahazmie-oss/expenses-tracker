import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';
import Colors from '../style/Colors';

// PASTIKAN IP SAMA DENGAN SCREEN LAIN
const API_URL = 'http://192.168.56.1:3000/api/report';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CHART_COLORS = ['#e6ee00', '#4FC3F7', '#FF8A65', '#81C784', '#BA68C8', '#F06292'];

export default function ReportScreen({ route }) {
  const isFocused = useIsFocused();
  const userId = route.params?.user?.id;

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?user_id=${userId}&month=${selectedMonth}&year=${selectedYear}`);
      const json = await response.json();
      if (json.success) {
        setReportData(json.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.log('Error fetching report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchReport();
    }
  }, [isFocused, selectedMonth, selectedYear, userId]);

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const totalSpending = reportData.reduce((sum, item) => sum + parseFloat(item.total), 0);

  const chartData = {
    labels: reportData.map((item) => item.category),
    datasets: [
      {
        data: reportData.map((item) => parseFloat(item.total)),
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width - 40;

  return (
    <ScrollView style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.arrowButton}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.monthText}>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary || '#e6ee00'} style={{ marginTop: 40 }} />
      ) : reportData.length === 0 ? (
        <Text style={styles.emptyText}>No expenses recorded for this month.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.totalLabel}>Total Spending</Text>
          <Text style={styles.totalValue}>RM {totalSpending.toFixed(2)}</Text>

          <BarChart
            data={chartData}
            width={screenWidth}
            height={260}
            yAxisLabel="RM"
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: '#FFF',
              backgroundGradientFrom: '#FFF',
              backgroundGradientTo: '#FFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.6,
              propsForBackgroundLines: { stroke: '#EEE' },
            }}
            style={styles.chart}
          />

          
          <View style={styles.breakdown}>
            {reportData.map((item, index) => (
              <View key={item.category} style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.colorDot, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                  <Text style={styles.breakdownCategory}>{item.category}</Text>
                </View>
                <Text style={styles.breakdownAmount}>RM {parseFloat(item.total).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: Colors.background || '#F5F5F5', padding: 20, paddingBottom: 100 },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    elevation: 2,
  },
  arrowButton: { padding: 10 },
  arrowText: { fontSize: 16, fontWeight: 'bold', color: Colors.primary || '#e6ee00' },
  monthText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 2 },
  totalLabel: { fontSize: 13, color: '#666' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 4, marginBottom: 10 },
  chart: { borderRadius: 12, marginVertical: 8 },
  breakdown: { marginTop: 15 },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownLabel: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  breakdownCategory: { fontSize: 14, color: '#333' },
  breakdownAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
});
