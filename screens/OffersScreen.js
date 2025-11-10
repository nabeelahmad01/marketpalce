// screens/OffersScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export default function OffersScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    loadOffers();
    const interval = setInterval(loadOffers, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOffers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/offers/received/${requestId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    Alert.alert(
      'Hire Mechanic',
      'Are you sure you want to hire this mechanic? 1 diamond will be deducted from their account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hire',
          onPress: async () => {
            setAccepting(offerId);
            try {
              const user = await AsyncStorage.getItem('currentUser');
              const token = await AsyncStorage.getItem('token');
              const userData = JSON.parse(user);

              const response = await fetch(`${API_BASE_URL}/offers/accept`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'user-id': userData.id
                },
                body: JSON.stringify({ requestId, offerId })
              });

              if (response.ok) {
                Alert.alert('Success', 'Mechanic hired! They will contact you soon.');
                navigation.goBack();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to accept offer');
            } finally {
              setAccepting(null);
            }
          }
        }
      ]
    );
  };

  const renderOffer = ({ item }) => {
    const isAccepted = item.status === 'accepted';
    const isPending = item.status === 'pending';

    return (
      <View style={[styles.offerCard, isAccepted && styles.acceptedCard]}>
        <View style={styles.mechanicHeader}>
          {item.mechanicPhoto ? (
            <Image source={{ uri: item.mechanicPhoto }} style={styles.mechanicPhoto} />
          ) : (
            <View style={styles.mechanicPhotoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>👤</Text>
            </View>
          )}
          
          <View style={styles.mechanicInfo}>
            <Text style={styles.mechanicName}>{item.mechanicName}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.rating}>{item.mechanicRating}</Text>
            </View>
          </View>

          {isAccepted && (
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedText}>✓ Hired</Text>
            </View>
          )}
        </View>

        <View style={styles.offerDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Price:</Text>
            <Text style={styles.detailValue}>Rs. {item.estimatedPrice}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏰ Time:</Text>
            <Text style={styles.detailValue}>{item.estimatedTime}</Text>
          </View>
        </View>

        {item.message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.acceptBtn, accepting === item._id && styles.acceptBtnDisabled]}
              onPress={() => handleAcceptOffer(item._id)}
              disabled={accepting === item._id}
            >
              {accepting === item._id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptBtnText}>Hire This Mechanic</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Chat', { recipientId: item.mechanicId })}
            >
              <Text style={styles.chatBtnText}>💬 Chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mechanic Offers</Text>
        <Text style={styles.headerSubtitle}>{offers.length} offer(s) received</Text>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>No Offers Yet</Text>
            <Text style={styles.emptyText}>
              Mechanics will send their offers soon. Check back in a few minutes.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 10, fontSize: 14, color: '#666' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#E3F2FD', marginTop: 5 },
  list: { padding: 15 },
  offerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  acceptedCard: { borderWidth: 2, borderColor: '#4CAF50' },
  mechanicHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  mechanicPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  mechanicPhotoPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  photoPlaceholderText: { fontSize: 30 },
  mechanicInfo: { flex: 1 },
  mechanicName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingIcon: { fontSize: 14, marginRight: 4 },
  rating: { fontSize: 14, fontWeight: '600', color: '#666' },
  acceptedBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  acceptedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  offerDetails: { marginBottom: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  messageBox: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 15 },
  messageLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 4 },
  messageText: { fontSize: 13, color: '#333' },
  actions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 2, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
  acceptBtnDisabled: { backgroundColor: '#ccc' },
  acceptBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  chatBtn: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }
});
