// components/GoogleMapView.js
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#2563EB',
  secondary: '#10B981',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

const SIZES = {
  body: 16,
  bodySmall: 14,
  caption: 12,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  iconMD: 20,
  iconLG: 24,
};

const SHADOWS = {
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
};

const { width, height } = Dimensions.get('window');

// Custom marker icons for different user types
const MARKER_ICONS = {
  customer: {
    icon: 'person',
    color: COLORS.primary,
    size: 30,
  },
  mechanic: {
    bike: { icon: 'bicycle', color: COLORS.secondary, emoji: '🏍️' },
    car: { icon: 'car-sport', color: COLORS.accent, emoji: '🚗' },
    plumber: { icon: 'water', color: COLORS.info, emoji: '🔧' },
    electrician: { icon: 'flash', color: COLORS.warning, emoji: '⚡' },
    ac: { icon: 'snow', color: COLORS.info, emoji: '❄️' },
    mart: { icon: 'storefront', color: COLORS.success, emoji: '🛒' },
    carpenter: { icon: 'hammer', color: COLORS.primary, emoji: '🪚' },
    painter: { icon: 'brush', color: COLORS.secondary, emoji: '🎨' },
  }
};

import { GOOGLE_MAPS_CONFIG } from '../constants/config';

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_CONFIG.API_KEY;

const GoogleMapView = ({
  mechanics = [],
  customerLocation = null,
  selectedMechanic = null,
  onMechanicSelect,
  showDirections = false,
  trackingMode = false,
  style,
}) => {
  const [region, setRegion] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentLocation();
    if (trackingMode) {
      startPulseAnimation();
    }
  }, [trackingMode]);

  useEffect(() => {
    if (customerLocation) {
      setRegion({
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [customerLocation]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed for map functionality');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(newLocation);
      
      if (!customerLocation) {
        setRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const estimateTime = (km) => {
    // Estimate based on average city speed (25 km/h)
    const hours = km / 25;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const fitToMarkers = () => {
    if (!mapRef.current) return;

    const coordinates = [];
    
    if (customerLocation) {
      coordinates.push(customerLocation);
    }
    
    if (selectedMechanic && selectedMechanic.location) {
      coordinates.push({
        latitude: selectedMechanic.location.latitude,
        longitude: selectedMechanic.location.longitude,
      });
    } else {
      mechanics.forEach(mechanic => {
        if (mechanic.location) {
          coordinates.push({
            latitude: mechanic.location.latitude,
            longitude: mechanic.location.longitude,
          });
        }
      });
    }

    if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  };

  const renderCustomerMarker = () => {
    if (!customerLocation) return null;

    return (
      <Marker
        coordinate={customerLocation}
        title="Your Location"
        description="Customer"
      >
        <View style={styles.customerMarker}>
          {trackingMode && (
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0],
                  }),
                },
              ]}
            />
          )}
          <View style={styles.customerMarkerInner}>
            <Ionicons name="person" size={20} color={COLORS.white} />
          </View>
        </View>
      </Marker>
    );
  };

  const renderMechanicMarker = (mechanic) => {
    if (!mechanic.location) return null;

    const category = mechanic.categories?.[0]?.toLowerCase() || 'bike';
    const markerConfig = MARKER_ICONS.mechanic[category] || MARKER_ICONS.mechanic.bike;
    const isSelected = selectedMechanic && selectedMechanic.id === mechanic.id;

    const mechanicDistance = customerLocation ? 
      calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        mechanic.location.latitude,
        mechanic.location.longitude
      ) : null;

    return (
      <Marker
        key={mechanic.id}
        coordinate={{
          latitude: mechanic.location.latitude,
          longitude: mechanic.location.longitude,
        }}
        title={mechanic.name}
        description={`${mechanic.categories?.[0] || 'Mechanic'} • ${mechanicDistance ? formatDistance(mechanicDistance) : ''}`}
        onPress={() => onMechanicSelect && onMechanicSelect(mechanic)}
      >
        <View style={[
          styles.mechanicMarker,
          isSelected && styles.selectedMechanicMarker,
          { borderColor: markerConfig.color }
        ]}>
          <View style={[styles.mechanicMarkerInner, { backgroundColor: markerConfig.color }]}>
            <Text style={styles.mechanicEmoji}>{markerConfig.emoji}</Text>
          </View>
          {mechanic.isOnline && <View style={styles.onlineIndicator} />}
          {mechanicDistance && (
            <View style={styles.distanceLabel}>
              <Text style={styles.distanceLabelText}>{formatDistance(mechanicDistance)}</Text>
            </View>
          )}
        </View>
      </Marker>
    );
  };

  const renderDirections = () => {
    if (!showDirections || !customerLocation || !selectedMechanic?.location) {
      return null;
    }

    return (
      <MapViewDirections
        origin={customerLocation}
        destination={{
          latitude: selectedMechanic.location.latitude,
          longitude: selectedMechanic.location.longitude,
        }}
        apikey={GOOGLE_MAPS_API_KEY}
        strokeWidth={4}
        strokeColor={COLORS.primary}
        optimizeWaypoints={true}
        onReady={(result) => {
          setDistance(result.distance);
          setDuration(result.duration);
          mapRef.current?.fitToCoordinates(result.coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          });
        }}
        onError={(errorMessage) => {
          console.error('Directions error:', errorMessage);
        }}
      />
    );
  };

  if (!region) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Ionicons name="location" size={SIZES.iconXXL} color={COLORS.gray300} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={false}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        customMapStyle={GOOGLE_MAPS_CONFIG.MAP_STYLE}
      >
        {renderCustomerMarker()}
        {mechanics.map(renderMechanicMarker)}
        {renderDirections()}
        
        {customerLocation && (
          <Circle
            center={customerLocation}
            radius={1000}
            strokeColor={`${COLORS.primary}30`}
            fillColor={`${COLORS.primary}10`}
            strokeWidth={1}
          />
        )}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={SIZES.iconMD} color={COLORS.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={fitToMarkers}
        >
          <Ionicons name="resize" size={SIZES.iconMD} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Distance and Time Info */}
      {showDirections && selectedMechanic && (distance || duration) && (
        <View style={styles.routeInfo}>
          <View style={styles.routeInfoItem}>
            <Ionicons name="location" size={SIZES.iconMD} color={COLORS.primary} />
            <Text style={styles.routeInfoText}>
              {distance ? `${distance.toFixed(1)} km` : formatDistance(calculateDistance(
                customerLocation.latitude,
                customerLocation.longitude,
                selectedMechanic.location.latitude,
                selectedMechanic.location.longitude
              ))}
            </Text>
          </View>
          <View style={styles.routeInfoItem}>
            <Ionicons name="time" size={SIZES.iconMD} color={COLORS.success} />
            <Text style={styles.routeInfoText}>
              {duration ? `${Math.round(duration)} min` : estimateTime(calculateDistance(
                customerLocation.latitude,
                customerLocation.longitude,
                selectedMechanic.location.latitude,
                selectedMechanic.location.longitude
              ))}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },
  
  map: {
    flex: 1,
  },
  
  customerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
  
  customerMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  
  mechanicMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  selectedMechanicMarker: {
    transform: [{ scale: 1.2 }],
  },
  
  mechanicMarkerInner: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  
  mechanicEmoji: {
    fontSize: 20,
  },
  
  onlineIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  
  distanceLabel: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  distanceLabelText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  mapControls: {
    position: 'absolute',
    top: SIZES.lg,
    right: 16,
    flexDirection: 'column',
  },
  
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
    ...SHADOWS.medium,
  },
  
  routeInfo: {
    position: 'absolute',
    bottom: SIZES.lg,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...SHADOWS.medium,
  },
  
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  routeInfoText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SIZES.xs,
  },
});

export default GoogleMapView;
