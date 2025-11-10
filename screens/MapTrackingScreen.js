// screens/MapTrackingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const CATEGORY_ICONS = {
  'Bike Mechanic': '🏍️',
  'Car Mechanic': '🚗',
  'Plumber': '🔧',
  'Electrician': '⚡',
  'AC & Fridge': '❄️',
  'General Mart': '🛒',
  'Carpenter': '🪚',
  'Painter': '🎨',
};

export default function MapTrackingScreen({ route, navigation }) {
  const { mechanicId, mechanicName, category } = route.params;
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    getMyLocation();
    loadMechanicLocation();
    
    const interval = setInterval(loadMechanicLocation, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setMyLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loadMechanicLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/location/mechanic/${mechanicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.location) {
        setMechanicLocation({
          latitude: data.location.lat,
          longitude: data.location.lng,
        });
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openDirections = () => {
    if (!mechanicLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mechanicLocation.latitude},${mechanicLocation.longitude}`;
    Linking.openURL(url);
  };

  const calculateDistance = () => {
    if (!myLocation || !mechanicLocation) return null;

    const lat1 = myLocation.latitude;
    const lon1 = myLocation.longitude;
    const lat2 = mechanicLocation.latitude;
    const lon2 = mechanicLocation.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const fitToMarkers = () => {
    if (mapRef.current && myLocation && mechanicLocation) {
      mapRef.current.fitToCoordinates([myLocation, mechanicLocation], {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (myLocation && mechanicLocation) {
      fitToMarkers();
    }
  }, [myLocation, mechanicLocation]);

  return (
    <View style={styles.container}>
      {myLocation && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {mechanicLocation && (
            <Marker
              coordinate={mechanicLocation}
              title={mechanicName}
              description={category}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.marker, isOnline ? styles.markerOnline : styles.markerOffline]}>
                  <Text style={styles.markerIcon}>{CATEGORY_ICONS[category] || '👨‍🔧'}</Text>
                </View>
                <View style={styles.markerTriangle} />
              </View>
            </Marker>
          )}
        </MapView>
      )}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{mechanicName}</Text>
          <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{calculateDistance() || 'Calculating...'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{category}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.directionsBtn, !mechanicLocation && styles.directionsBtnDisabled]}
          onPress={openDirections}
          disabled={!mechanicLocation}
        >
          <Text style={styles.directionsBtnText}>🗺️ Get Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.callBtn}
          onPress={() => navigation.navigate('Chat', { recipientId: mechanicId })}
        >
          <Text style={styles.callBtnText}>💬 Chat with Mechanic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: { 
    position: 'absolute', 
    top: 40, 
    left: 15, 
    right: 15, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#999', marginRight: 5 },
  statusDotOnline: { backgroundColor: '#4CAF50' },
  statusText: { fontSize: 12, color: '#666' },
  markerContainer: { alignItems: 'center' },
  marker: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  markerOnline: { backgroundColor: '#4CAF50' },
  markerOffline: { backgroundColor: '#999' },
  markerIcon: { fontSize: 24 },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -3
  },
  bottomCard: { 
    position: 'absolute', 
    bottom: 20, 
    left: 15, 
    right: 15, 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  infoRow: { flexDirection: 'row', marginBottom: 15 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  directionsBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginBottom: 10 },
  directionsBtnDisabled: { backgroundColor: '#ccc' },
  directionsBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  callBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10 },
  callBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' }
});
