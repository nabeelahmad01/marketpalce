// screens/CustomerHomeScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../App';
import Header from '../components/Header';
import LiveLocationTracker from '../components/LiveLocationTracker';
// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  accent: '#F59E0B',
  warning: '#F59E0B',
  info: '#A78BFA',
  success: '#10B981',
  white: '#FFFFFF',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  background: '#F8FAFC',
  error: '#EF4444',
};

const SIZES = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body: 16,
  bodySmall: 14,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  iconXS: 12,
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,
  iconXXL: 48,
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

const CATEGORIES = [
  { id: 'bike', name: 'Bike Mechanic', icon: 'bicycle', color: COLORS.primary, description: 'Motorcycle & bike repairs' },
  { id: 'car', name: 'Car Mechanic', icon: 'car-sport', color: COLORS.secondary, description: 'Car service & repairs' },
  { id: 'plumber', name: 'Plumber', icon: 'water', color: COLORS.accent, description: 'Water & pipe services' },
  { id: 'electrician', name: 'Electrician', icon: 'flash', color: COLORS.warning, description: 'Electrical work & wiring' },
  { id: 'ac', name: 'AC & Fridge', icon: 'snow', color: COLORS.info, description: 'Cooling system repairs' },
  { id: 'mart', name: 'General Mart', icon: 'storefront', color: COLORS.success, description: 'General store services' },
  { id: 'carpenter', name: 'Carpenter', icon: 'hammer', color: COLORS.primary, description: 'Wood work & furniture' },
  { id: 'painter', name: 'Painter', icon: 'brush', color: COLORS.secondary, description: 'Painting & decoration' },
];

export default function CustomerHomeScreen({ navigation }) {
  const { handleLogout: authLogout } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);

  useEffect(() => {
    loadUserData();
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

  const handleProfilePress = () => {
    Alert.alert(
      'Profile Options',
      'Choose an option',
      [
        { text: 'View Profile', onPress: () => navigation.navigate('Profile') },
        { text: 'My Bookings', onPress: () => navigation.navigate('MyBookings') },
        { text: 'Settings', onPress: () => navigation.navigate('Settings') },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    if (authLogout) {
      authLogout();
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => navigation.navigate('ServiceCategory', { category: item })}
    >
      <LinearGradient
        colors={[item.color, `${item.color}80`]}
        style={styles.categoryGradient}
      >
        <View style={styles.categoryIcon}>
          <Ionicons name={item.icon} size={SIZES.iconXL} color={COLORS.white} />
        </View>
      </LinearGradient>
      
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
      </View>
      
      <View style={styles.categoryArrow}>
        <Ionicons name="chevron-forward" size={SIZES.iconMD} color={COLORS.gray400} />
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard}>
          <Ionicons name="time" size={SIZES.iconLG} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Recent Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <Ionicons name="star" size={SIZES.iconLG} color={COLORS.warning} />
          <Text style={styles.quickActionText}>Top Rated</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <Ionicons name="location" size={SIZES.iconLG} color={COLORS.success} />
          <Text style={styles.quickActionText}>Nearby</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <Ionicons name="flash" size={SIZES.iconLG} color={COLORS.error} />
          <Text style={styles.quickActionText}>Emergency</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header
        title={`Hello, ${currentUser?.name || 'User'}!`}
        subtitle="What service do you need today?"
        showProfile
        onProfilePress={handleProfilePress}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Tracking */}
        <View style={styles.locationSection}>
          <LiveLocationTracker
            isTracking={isLocationTracking}
            onTrackingChange={setIsLocationTracking}
          />
        </View>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Service Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>All Services</Text>
          <FlatList 
            data={CATEGORIES} 
            renderItem={renderCategory} 
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
          />
        </View>
      </ScrollView>
    </View>
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
  
  locationSection: {
    paddingHorizontal: SIZES.lg,
    paddingTop: 16,
  },
  
  quickActions: {
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
  },
  
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  quickActionCard: {
    width: '48%',
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: SIZES.sm,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  quickActionText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  
  categoriesSection: {
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
  },
  
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  categoryGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  categoryIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  
  categoryName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  categoryDescription: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  
  categoryArrow: {
    padding: SIZES.xs,
  },
  
  categorySeparator: {
    height: SIZES.sm,
  },
});