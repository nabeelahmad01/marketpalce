// screens/ServiceCategoryScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ServiceCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async () => {
    if (!description || !location) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    try {
      const user = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(user);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/services/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        },
        body: JSON.stringify({ category: category.name, description, location })
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Success', 
          'Request posted! Mechanics will send offers soon.',
          [
            {
              text: 'View Offers',
              onPress: () => navigation.navigate('Offers', { requestId: data.request._id })
            }
          ]
        );
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{category.icon}</Text>
        <Text style={styles.title}>{category.name}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Describe your issue:</Text>
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Tell mechanics what you need..." value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Your Location:</Text>
        <TextInput style={styles.input} placeholder="Address" value={location} onChangeText={setLocation} />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Post Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 30, alignItems: 'center' },
  icon: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});