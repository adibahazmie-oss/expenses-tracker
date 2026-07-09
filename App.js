import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import AppNavigation from './navigation/navigation'; 

export default function App() {
  return (
    <View style={styles.container}>
     
      <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
      
      {/* navigation */}
      <AppNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});