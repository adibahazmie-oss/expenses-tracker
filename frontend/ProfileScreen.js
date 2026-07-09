import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../style/Colors';
import Button from '../component/Button';

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
        <Text style={styles.name}>Amirul</Text>
        <Text style={styles.email}>amirul@email.com</Text>
      </View>

      <Button title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  avatarContainer: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginTop: 15 },
  email: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
});