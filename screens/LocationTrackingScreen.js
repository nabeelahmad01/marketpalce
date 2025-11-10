// screens/LocationTrackingScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LocationTrackingScreen() {
  const [tracking, setTracking] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ Map View</Text>
        <Text style={styles.mapSubtext}>Mechanic Location: 5 km away</Text>
        <Text style={styles.eta}>ETA: 15 minutes</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>Mechanic Details</Text>
        <Text style={styles.mechanic}>🔧 Ali Khan</Text>
        <Text style={styles.phone}>Phone: +92 300 1234567</Text>
        <Text style={styles.rating}>Rating: ⭐ 4.8</Text>

        <TouchableOpacity
          style={[styles.trackBtn, tracking && styles.trackingActive]}
          onPress={() => setTracking(!tracking)}
        >
          <Text style={styles.trackBtnText}>
            {tracking ? '🔴 Tracking Active' : '▶️ Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mapPlaceholder: { flex: 1, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  mapText: { fontSize: 40, marginBottom: 10 },
  mapSubtext: { fontSize: 14, color: '#666' },
  eta: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginTop: 10 },
  details: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  mechanic: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  phone: { fontSize: 14, color: '#666', marginBottom: 5 },
  rating: { fontSize: 14, marginBottom: 15 },
  trackBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginTop: 15 },
  trackingActive: { backgroundColor: '#FF4444' },
  trackBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }
});