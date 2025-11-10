// screens/MechanicHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MechanicHomeScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(user);

      const response = await fetch('http://localhost:5000/api/services/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderRequest = ({ item }) => {
    // Check if user already sent offer
    const hasOffer = item.offers?.some(o => o.mechanicId === item._id);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('SendOffer', { request: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={[styles.statusBadge, item.status === 'pending' && styles.statusPending]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.location}>📍 {item.location}</Text>
          <Text style={styles.customer}>👤 {item.customerId?.name || 'Customer'}</Text>
        </View>

        <View style={styles.offerInfo}>
          <Text style={styles.offersCount}>
            {item.offers?.length || 0} offer(s) received
          </Text>
          <Text style={styles.timeAgo}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.offerBtn, hasOffer && styles.offerBtnSent]}
          disabled={hasOffer}
        >
          <Text style={styles.offerBtnText}>
            {hasOffer ? '✓ Offer Sent' : 'Send Offer →'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Jobs</Text>
      </View>
      <FlatList data={requests} renderItem={renderRequest} keyExtractor={i => i._id} ListEmptyComponent={<Text style={styles.empty}>No jobs available</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#fff', margin: 10, borderRadius: 12, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  category: { fontSize: 16, fontWeight: '600', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPending: { backgroundColor: '#FFE0B2' },
  statusText: { color: '#E65100', fontSize: 11, fontWeight: '600' },
  description: { fontSize: 14, color: '#666', marginBottom: 10, lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  location: { fontSize: 13, color: '#999', flex: 1 },
  customer: { fontSize: 13, color: '#666', fontWeight: '500' },
  offerInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  offersCount: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
  timeAgo: { fontSize: 12, color: '#999' },
  offerBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 8 },
  offerBtnSent: { backgroundColor: '#4CAF50' },
  offerBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14, color: '#999' }
});