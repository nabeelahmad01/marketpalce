// screens/ServiceCategoryScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import GoogleMapView from '../components/GoogleMapView';
import Header from '../components/Header';
import Input from '../components/Input';
import LocationPicker from '../components/LocationPicker';
import { API_BASE_URL } from '../constants/api';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  background: '#F8FAFC',
  border: '#E5E7EB',
};

const SIZES = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,
};

const SHADOWS = {
  small: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
};

export default function ServiceCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [nearbyMechanics, setNearbyMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [requestPrice, setRequestPrice] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to find nearby mechanics');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        
        setLocation({
          address: locationString,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          type: 'current'
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!description.trim()) newErrors.description = 'Please describe your issue';
    if (!location) newErrors.location = 'Location is required';
    if (!requestPrice.trim()) newErrors.price = 'Please enter your budget';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const findNearbyMechanics = async () => {
    if (!location || !location.latitude) {
      Alert.alert('Error', 'Location is required to find mechanics');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/mechanics/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          category: category.name,
          radius: 10 // 10km radius
        })
      });

      const data = await response.json();
      if (response.ok) {
        setNearbyMechanics(data.mechanics || []);
        setShowMap(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to find mechanics');
      }
    } catch (error) {
      console.error('Error finding mechanics:', error);
      Alert.alert('Error', 'Failed to find nearby mechanics');
    } finally {
      setLoading(false);
    }
  };

  const sendRequestToMechanic = async (mechanic) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/services/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mechanicId: mechanic.id,
          category: category.name,
          description: description.trim(),
          location: {
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
          },
          requestedPrice: parseFloat(requestPrice),
          urgency: urgencyLevel,
          customerLocation: location
        })
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert(
          'Request Sent!', 
          `Your request has been sent to ${mechanic.name}. They will respond shortly.`,
          [
            {
              text: 'Track Request',
              onPress: () => navigation.navigate('RequestTracking', { 
                requestId: data.request._id,
                mechanicId: mechanic.id
              })
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const sendRequestToAllMechanics = async () => {
    if (!validateForm()) return;
    if (nearbyMechanics.length === 0) {
      Alert.alert('No Mechanics Found', 'No mechanics found in your area for this category');
      return;
    }

    Alert.alert(
      'Send to All Mechanics?',
      `Send your request to all ${nearbyMechanics.length} nearby mechanics? The first to accept will get the job.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send to All',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/services/broadcast`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  mechanicIds: nearbyMechanics.map(m => m.id),
                  category: category.name,
                  description: description.trim(),
                  location: {
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude
                  },
                  requestedPrice: parseFloat(requestPrice),
                  urgency: urgencyLevel
                })
              });

              const data = await response.json();
              if (response.ok) {
                navigation.navigate('RequestOffers', { 
                  requestId: data.request._id,
                  category: category.name
                });
              } else {
                Alert.alert('Error', data.message || 'Failed to send requests');
              }
            } catch (error) {
              console.error('Error broadcasting request:', error);
              Alert.alert('Error', 'Failed to send requests');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const urgencyOptions = [
    { id: 'normal', label: 'Normal', icon: 'time', color: COLORS.primary },
    { id: 'urgent', label: 'Urgent', icon: 'flash', color: COLORS.warning },
    { id: 'emergency', label: 'Emergency', icon: 'warning', color: COLORS.error },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header
        title={category.name}
        subtitle="Describe your service request"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Service Category Info */}
          <View style={styles.categoryInfo}>
            <LinearGradient
              colors={[category.color || COLORS.primary, `${category.color || COLORS.primary}80`]}
              style={styles.categoryIcon}
            >
              <Ionicons name={category.icon} size={SIZES.iconXL} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          </View>

          {/* Problem Description */}
          <Input
            label="Describe Your Problem"
            placeholder="Tell mechanics what you need help with..."
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            leftIcon={<Ionicons name="document-text-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          {/* Location Picker */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Service Location</Text>
            <LocationPicker
              value={location}
              onLocationSelect={setLocation}
              placeholder="Select service location"
              error={errors.location}
            />
          </View>

          {/* Budget */}
          <Input
            label="Your Budget (PKR)"
            placeholder="Enter your expected price"
            value={requestPrice}
            onChangeText={setRequestPrice}
            error={errors.price}
            keyboardType="numeric"
            leftIcon={<Ionicons name="cash-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          {/* Urgency Level */}
          <View style={styles.urgencySection}>
            <Text style={styles.sectionTitle}>Urgency Level</Text>
            <View style={styles.urgencyOptions}>
              {urgencyOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.urgencyOption,
                    urgencyLevel === option.id && styles.urgencyOptionSelected,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setUrgencyLevel(option.id)}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={SIZES.iconMD} 
                    color={urgencyLevel === option.id ? COLORS.white : option.color} 
                  />
                  <Text style={[
                    styles.urgencyOptionText,
                    urgencyLevel === option.id && styles.urgencyOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Find Nearby Mechanics"
              onPress={findNearbyMechanics}
              loading={loading}
              gradient
              icon={<Ionicons name="search" size={SIZES.iconMD} color={COLORS.white} />}
              style={styles.findButton}
            />
            
            {nearbyMechanics.length > 0 && (
              <Button
                title={`Send to All (${nearbyMechanics.length}) Mechanics`}
                onPress={sendRequestToAllMechanics}
                loading={loading}
                variant="outline"
                icon={<Ionicons name="send" size={SIZES.iconMD} color={COLORS.primary} />}
                style={styles.broadcastButton}
              />
            )}
          </View>

          {/* Nearby Mechanics Count */}
          {nearbyMechanics.length > 0 && (
            <View style={styles.mechanicsInfo}>
              <Ionicons name="people" size={SIZES.iconMD} color={COLORS.success} />
              <Text style={styles.mechanicsInfoText}>
                {nearbyMechanics.length} mechanics found in your area
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              onPress={() => setShowMap(false)}
              style={styles.mapCloseButton}
            >
              <Ionicons name="close" size={SIZES.iconLG} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Select Mechanic</Text>
            <Text style={styles.mapSubtitle}>{nearbyMechanics.length} mechanics nearby</Text>
          </View>

          <GoogleMapView
            mechanics={nearbyMechanics}
            customerLocation={location}
            selectedMechanic={selectedMechanic}
            onMechanicSelect={setSelectedMechanic}
            showDirections={!!selectedMechanic}
            style={styles.map}
          />

          {selectedMechanic && (
            <View style={styles.mechanicCard}>
              <View style={styles.mechanicInfo}>
                <View style={styles.mechanicAvatar}>
                  <Text style={styles.mechanicInitial}>
                    {selectedMechanic.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.mechanicDetails}>
                  <Text style={styles.mechanicName}>{selectedMechanic.name}</Text>
                  <Text style={styles.mechanicCategory}>{selectedMechanic.categories?.[0]}</Text>
                  <View style={styles.mechanicRating}>
                    <Ionicons name="star" size={SIZES.iconSM} color={COLORS.warning} />
                    <Text style={styles.ratingText}>{selectedMechanic.rating || '4.5'}</Text>
                    <Text style={styles.reviewsText}>({selectedMechanic.reviews || '25'} reviews)</Text>
                  </View>
                </View>
              </View>
              
              <Button
                title="Send Request"
                onPress={() => sendRequestToMechanic(selectedMechanic)}
                loading={loading}
                gradient
                style={styles.sendRequestButton}
              />
            </View>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  
  form: {
    padding: SIZES.lg,
  },
  
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: SIZES.lg,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  categoryDetails: {
    flex: 1,
  },
  
  categoryName: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  categoryDescription: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  
  descriptionInput: {
    marginBottom: SIZES.lg,
  },
  
  locationSection: {
    marginBottom: SIZES.lg,
  },
  
  sectionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  
  urgencySection: {
    marginBottom: SIZES.lg,
  },
  
  urgencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  urgencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.xs,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: SIZES.xs,
    backgroundColor: "#FFFFFF",
  },
  
  urgencyOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  
  urgencyOptionText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: SIZES.xs,
  },
  
  urgencyOptionTextSelected: {
    color: COLORS.white,
  },
  
  actionButtons: {
    marginTop: SIZES.lg,
  },
  
  findButton: {
    marginBottom: 16,
  },
  
  broadcastButton: {
    marginBottom: 16,
  },
  
  mechanicsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
  },
  
  mechanicsInfoText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.success,
    fontWeight: '500',
    marginLeft: SIZES.xs,
  },
  
  mapContainer: {
    flex: 1,
  },
  
  mapHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: SIZES.xxl,
    paddingBottom: 16,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
  },
  
  mapCloseButton: {
    position: 'absolute',
    top: SIZES.xxl,
    right: SIZES.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  mapTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  
  mapSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  map: {
    flex: 1,
  },
  
  mechanicCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 8,
    padding: 16,
    ...SHADOWS.medium,
  },
  
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  mechanicAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  mechanicInitial: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  mechanicDetails: {
    flex: 1,
  },
  
  mechanicName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  mechanicCategory: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  
  mechanicRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SIZES.xs,
  },
  
  reviewsText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
  
  sendRequestButton: {
    marginTop: SIZES.sm,
  },
});
