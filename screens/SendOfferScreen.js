// screens/SendOfferScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export default function SendOfferScreen({ route, navigation }) {
  const { request } = route.params;
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOffer = async () => {
    if (!estimatedPrice || !estimatedTime) {
      Alert.alert('Error', 'Please fill in price and time estimate');
      return;
    }

    const price = parseInt(estimatedPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(user);

      const response = await fetch(`${API_BASE_URL}/offers/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        },
        body: JSON.stringify({
          requestId: request._id,
          estimatedPrice: price,
          estimatedTime,
          message
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Offer sent! Customer will review it.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Your Offer</Text>
      </View>

      <View style={styles.requestCard}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{request.category}</Text>
        </View>
        <Text style={styles.description}>{request.description}</Text>
        <Text style={styles.location}>📍 {request.location}</Text>
        <Text style={styles.customer}>👤 {request.customerId?.name}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Your Offer Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>💰 Your Price (Rs.)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            value={estimatedPrice}
            onChangeText={setEstimatedPrice}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Enter your service charge</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>⏰ Estimated Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30 minutes"
            value={estimatedTime}
            onChangeText={setEstimatedTime}
          />
          <Text style={styles.hint}>How long will it take?</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>💬 Message (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional details..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.hint}>Tell them why you're the best choice</Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>💎</Text>
          <Text style={styles.warningText}>
            1 diamond will be deducted if customer hires you
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
          onPress={handleSendOffer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.sendButtonText}>Send Offer</Text>
              <Text style={styles.sendButtonIcon}>📤</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  requestCard: { backgroundColor: '#fff', margin: 15, padding: 15, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  categoryBadge: { backgroundColor: '#E3F2FD', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 10 },
  categoryText: { color: '#007AFF', fontSize: 12, fontWeight: '600' },
  description: { fontSize: 15, color: '#333', marginBottom: 10, lineHeight: 22 },
  location: { fontSize: 13, color: '#666', marginBottom: 5 },
  customer: { fontSize: 13, color: '#666' },
  form: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20, color: '#333' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: '#999', marginTop: 5 },
  warningCard: { backgroundColor: '#FFF3E0', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  warningIcon: { fontSize: 24, marginRight: 10 },
  warningText: { flex: 1, fontSize: 13, color: '#E65100', fontWeight: '500' },
  sendButton: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  sendButtonDisabled: { backgroundColor: '#ccc' },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sendButtonIcon: { fontSize: 20 }
});
