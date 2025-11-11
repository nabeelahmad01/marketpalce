import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  iconMD: 20,
  radiusSmall: 4,
};

const LiveLocationTracker = ({ 
  isTracking = false, 
  onTrackingChange,
  showStatus = true,
  style 
}) => {
  const [tracking, setTracking] = useState(isTracking);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (tracking) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [tracking]);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to use live tracking.',
          [{ text: 'OK' }]
        );
        setTracking(false);
        onTrackingChange?.(false);
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation(location.coords);
      await updateLocationOnServer(location.coords);

      // Start watching location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (location) => {
          setCurrentLocation(location.coords);
          setLastUpdate(new Date());
          updateLocationOnServer(location.coords);
        }
      );

      setLocationSubscription(subscription);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Unable to start location tracking');
      setTracking(false);
      onTrackingChange?.(false);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setLastUpdate(null);
  };

  const updateLocationOnServer = async (coords) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: coords.latitude,
          lng: coords.longitude,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error updating location on server:', error);
    }
  };

  const toggleTracking = () => {
    const newTracking = !tracking;
    setTracking(newTracking);
    onTrackingChange?.(newTracking);
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.trackingButton,
          tracking && styles.trackingButtonActive
        ]}
        onPress={toggleTracking}
      >
        <View style={styles.buttonContent}>
          <View style={[
            styles.statusIndicator,
            tracking && styles.statusIndicatorActive
          ]}>
            <Ionicons 
              name={tracking ? "location" : "location-outline"} 
              size={SIZES.iconMD} 
              color={tracking ? COLORS.white : COLORS.gray400} 
            />
          </View>
          
          <View style={styles.textContent}>
            <Text style={[
              styles.statusText,
              tracking && styles.statusTextActive
            ]}>
              {tracking ? 'Live Tracking ON' : 'Live Tracking OFF'}
            </Text>
            
            {showStatus && (
              <Text style={[
                styles.updateText,
                tracking && styles.updateTextActive
              ]}>
                {tracking ? `Updated ${formatLastUpdate()}` : 'Tap to enable'}
              </Text>
            )}
          </View>
          
          <View style={styles.toggleSwitch}>
            <View style={[
              styles.switchTrack,
              tracking && styles.switchTrackActive
            ]}>
              <View style={[
                styles.switchThumb,
                tracking && styles.switchThumbActive
              ]} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {tracking && currentLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 Lat: {currentLocation.latitude.toFixed(6)}, 
            Lng: {currentLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.accuracyText}>
            Accuracy: ±{Math.round(currentLocation.accuracy)}m
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.sm,
  },
  
  trackingButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  trackingButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  statusIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  textContent: {
    flex: 1,
  },
  
  statusText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  statusTextActive: {
    color: COLORS.white,
  },
  
  updateText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  
  updateTextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  toggleSwitch: {
    marginLeft: SIZES.sm,
  },
  
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray300,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  switchTrackActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  
  locationInfo: {
    marginTop: SIZES.sm,
    padding: SIZES.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: 4,
  },
  
  locationText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  
  accuracyText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
});

export default LiveLocationTracker;
