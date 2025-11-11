import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { searchCities } from '../constants/pakistanCities';
import Button from './Button';
import Input from './Input';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#2563EB',
  white: '#FFFFFF',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  background: '#F8FAFC',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
};

const SIZES = {
  body: 16,
  bodySmall: 14,
  h5: 18,
  xs: 4,
  sm: 8,
  lg: 24,
  xl: 32,
  xxl: 48,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,
  inputHeight: 48,
};

const LocationPicker = ({
  value,
  onLocationSelect,
  placeholder = "Select location",
  showCurrentLocation = true,
  style,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchCities(searchQuery);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required to get current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        
        const locationData = {
          address: locationString,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          type: 'current'
        };

        setCurrentLocation(locationData);
        onLocationSelect(locationData);
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const selectLocation = (location) => {
    const locationData = {
      address: location.fullName,
      name: location.name,
      city: location.city,
      province: location.province,
      type: location.type
    };
    
    onLocationSelect(locationData);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectLocation(item)}
    >
      <Ionicons 
        name={item.type === 'city' ? 'location' : 'business'} 
        size={SIZES.iconMD} 
        color={COLORS.primary} 
        style={styles.suggestionIcon}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionDetails}>
          {item.type === 'city' ? item.province : `${item.city}, ${item.province}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="location" size={SIZES.iconMD} color={COLORS.primary} />
        <Text style={[
          styles.locationText,
          !value && styles.placeholderText
        ]}>
          {value?.address || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={SIZES.iconMD} color={COLORS.gray400} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={SIZES.iconLG} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Input
              placeholder="Search cities, areas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={SIZES.iconMD} color={COLORS.gray400} />}
              style={styles.searchInput}
            />

            {showCurrentLocation && (
              <Button
                title="Use Current Location"
                onPress={getCurrentLocation}
                loading={loadingLocation}
                variant="outline"
                icon={<Ionicons name="location" size={SIZES.iconMD} color={COLORS.primary} />}
                style={styles.currentLocationButton}
              />
            )}

            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={SIZES.iconXL} color={COLORS.gray300} />
                    <Text style={styles.emptyText}>No locations found</Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="location" size={SIZES.iconXL} color={COLORS.gray300} />
                    <Text style={styles.emptyText}>Start typing to search locations</Text>
                  </View>
                )
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: SIZES.inputHeight,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  locationText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    marginLeft: SIZES.sm,
  },
  
  placeholderText: {
    color: COLORS.gray400,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  
  modalTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  closeButton: {
    padding: SIZES.xs,
  },
  
  modalContent: {
    flex: 1,
    padding: SIZES.lg,
  },
  
  searchInput: {
    marginBottom: 16,
  },
  
  currentLocationButton: {
    marginBottom: SIZES.lg,
  },
  
  suggestionsList: {
    flex: 1,
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  suggestionIcon: {
    marginRight: 16,
  },
  
  suggestionContent: {
    flex: 1,
  },
  
  suggestionName: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  suggestionDetails: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl,
  },
  
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LocationPicker;
