// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const CATEGORIES = [
  'Bike Mechanic', 
  'Car Mechanic', 
  'Plumber', 
  'Electrician', 
  'AC & Fridge',
  'General Mart',
  'Carpenter',
  'Painter'
];

export default function RegisterScreen({ navigation }) {
  const [userType, setUserType] = useState('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cnic, setCnic] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    if (userType === 'mechanic' && !cnic) {
      Alert.alert('Error', 'CNIC required for mechanics');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, password, type: userType, cnic,
          categories: userType === 'mechanic' ? selectedCategories : []
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
        Alert.alert('Success', 'Account created');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeBtn, userType === 'customer' && styles.typeActive]} onPress={() => setUserType('customer')}>
            <Text style={[styles.typeText, userType === 'customer' && { color: '#fff' }]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, userType === 'mechanic' && styles.typeActive]} onPress={() => setUserType('mechanic')}>
            <Text style={[styles.typeText, userType === 'mechanic' && { color: '#fff' }]}>Mechanic</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {userType === 'mechanic' && (
          <>
            <TextInput style={styles.input} placeholder="CNIC (13 digits)" value={cnic} onChangeText={setCnic} keyboardType="numeric" maxLength={13} />
            <Text style={styles.label}>Select Categories:</Text>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBox, selectedCategories.includes(cat) && styles.categorySelected]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={styles.categoryText}>{selectedCategories.includes(cat) ? '✓ ' : ''}{cat}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  form: { padding: 20 },
  typeSelector: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  typeActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  typeText: { textAlign: 'center', fontWeight: '600', color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  categoryBox: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  categorySelected: { backgroundColor: '#e3f2fd', borderColor: '#007AFF' },
  categoryText: { fontSize: 14, color: '#333' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});