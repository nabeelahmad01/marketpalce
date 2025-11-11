// screens/RegisterScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import LocationPicker from '../components/LocationPicker';
import { API_BASE_URL } from '../constants/api';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#10B981',
  success: '#10B981',
  error: '#EF4444',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
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
};

const CATEGORIES = [
  { id: 'bike', name: 'Bike Mechanic', icon: 'bicycle' },
  { id: 'car', name: 'Car Mechanic', icon: 'car-sport' },
  { id: 'plumber', name: 'Plumber', icon: 'water' },
  { id: 'electrician', name: 'Electrician', icon: 'flash' },
  { id: 'ac', name: 'AC & Fridge', icon: 'snow' },
  { id: 'mart', name: 'General Mart', icon: 'storefront' },
  { id: 'carpenter', name: 'Carpenter', icon: 'hammer' },
  { id: 'painter', name: 'Painter', icon: 'brush' }
];

export default function RegisterScreen({ navigation }) {
  const [userType, setUserType] = useState('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cnic, setCnic] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (phone.length < 11) newErrors.phone = 'Phone number must be 11 digits';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (userType === 'mechanic') {
      if (!cnic.trim()) newErrors.cnic = 'CNIC is required for mechanics';
      if (cnic.length !== 13) newErrors.cnic = 'CNIC must be 13 digits';
      if (selectedCategories.length === 0) newErrors.categories = 'Select at least one category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const categoryNames = selectedCategories.map(id => 
        CATEGORIES.find(cat => cat.id === id)?.name
      ).filter(Boolean);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password,
          type: userType,
          cnic: userType === 'mechanic' ? cnic.trim() : null,
          categories: userType === 'mechanic' ? categoryNames : [],
          location: location?.address || null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Registration Failed', data.message || 'Please try again');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Connection Error', 'Please check your internet connection and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={SIZES.iconLG} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our mechanic marketplace</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* User Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeBtn, userType === 'customer' && styles.typeActive]} 
              onPress={() => setUserType('customer')}
            >
              <Ionicons 
                name="person" 
                size={SIZES.iconMD} 
                color={userType === 'customer' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[styles.typeText, userType === 'customer' && styles.typeTextActive]}>
                Customer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.typeBtn, userType === 'mechanic' && styles.typeActive]} 
              onPress={() => setUserType('mechanic')}
            >
              <Ionicons 
                name="construct" 
                size={SIZES.iconMD} 
                color={userType === 'mechanic' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[styles.typeText, userType === 'mechanic' && styles.typeTextActive]}>
                Mechanic
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            leftIcon={<Ionicons name="person-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          <Input
            label="Phone Number"
            placeholder="03xxxxxxxxx"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={11}
            leftIcon={<Ionicons name="call-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          <Input
            label="Password"
            placeholder="Enter password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          <LocationPicker
            value={location}
            onLocationSelect={setLocation}
            placeholder="Select your location"
          />

          {/* Mechanic Specific Fields */}
          {userType === 'mechanic' && (
            <>
              <Input
                label="CNIC Number"
                placeholder="Enter 13-digit CNIC"
                value={cnic}
                onChangeText={setCnic}
                error={errors.cnic}
                keyboardType="numeric"
                maxLength={13}
                leftIcon={<Ionicons name="card-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
              />

              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Select Your Services</Text>
                {errors.categories && <Text style={styles.errorText}>{errors.categories}</Text>}
                
                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryCard,
                        selectedCategories.includes(category.id) && styles.categoryCardSelected
                      ]}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <View style={[
                        styles.categoryIcon,
                        selectedCategories.includes(category.id) && styles.categoryIconSelected
                      ]}>
                        <Ionicons 
                          name={category.icon} 
                          size={SIZES.iconLG} 
                          color={selectedCategories.includes(category.id) ? COLORS.white : COLORS.primary} 
                        />
                      </View>
                      <Text style={[
                        styles.categoryName,
                        selectedCategories.includes(category.id) && styles.categoryNameSelected
                      ]}>
                        {category.name}
                      </Text>
                      {selectedCategories.includes(category.id) && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={SIZES.iconSM} color={COLORS.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            gradient
            style={styles.registerButton}
          />

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
  },
  
  headerContent: {
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
  },
  
  backButton: {
    position: 'absolute',
    left: SIZES.lg,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  
  subtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  
  form: {
    padding: SIZES.lg,
  },
  
  typeSelector: {
    flexDirection: 'row',
    marginBottom: SIZES.lg,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: SIZES.xs,
  },
  
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: SIZES.sm,
    borderRadius: 4,
    marginHorizontal: SIZES.xs,
  },
  
  typeActive: {
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  typeText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
  
  typeTextActive: {
    color: COLORS.white,
  },
  
  categoriesSection: {
    marginBottom: SIZES.lg,
  },
  
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  
  errorText: {
    fontSize: SIZES.caption,
    color: COLORS.error,
    marginBottom: SIZES.sm,
  },
  
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  categoryCard: {
    width: '48%',
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  categoryCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  
  categoryIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  categoryName: {
    fontSize: SIZES.bodySmall,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  categoryNameSelected: {
    color: COLORS.white,
  },
  
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  registerButton: {
    marginTop: SIZES.lg,
    marginBottom: 16,
  },
  
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  loginLinkText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});