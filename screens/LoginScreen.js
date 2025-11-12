// screens/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { API_BASE_URL } from '../constants/api';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  white: '#FFFFFF',
  background: '#F8FAFC',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  gray400: '#9CA3AF',
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
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  iconMD: 20,
  iconXXL: 48,
};

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Skip phone length validation for admin login
    if (phone !== '00000000000' && phone.length < 11) {
      newErrors.phone = 'Phone number must be 11 digits';
    }
    
    if (!password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Check for admin credentials first
      if (phone === '00000000000' && password === 'admin123') {
        const adminUser = {
          id: 'admin_001',
          name: 'Administrator',
          phone: '00000000000',
          type: 'admin',
          email: 'admin@mechanichub.com'
        };
        
        await AsyncStorage.setItem('token', 'admin-token-123');
        await AsyncStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        Alert.alert('Admin Login', 'Welcome Administrator!', [
          { text: 'OK', onPress: () => {
            if (typeof onLoginSuccess === 'function') {
              onLoginSuccess(adminUser);
            }
          }}
        ]);
        return;
      }

      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          phone: phone.trim(), 
          password 
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success !== false) {
        await AsyncStorage.setItem('token', data.token || 'dummy-token');
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user || data));
        Alert.alert('Success', 'Welcome back!', [
          { text: 'OK', onPress: () => {
            if (typeof onLoginSuccess === 'function') {
              onLoginSuccess(data.user || data);
            }
          }}
        ]);
      } else {
        Alert.alert('Login Failed', data.message || 'Please check your credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Connection failed. ';
      if (error.message.includes('Network request failed')) {
        errorMessage += 'Please check:\n• Backend server is running\n• Correct IP address in API config\n• Internet connection';
      } else if (error.message.includes('HTTP')) {
        errorMessage += `Server error: ${error.message}`;
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Connection Error', errorMessage);
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
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="construct" size={SIZES.iconXXL} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Mechanic Hub</Text>
            <Text style={styles.subtitle}>Your trusted service marketplace</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeText}>Sign in to continue to your account</Text>
          </View>

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={11}
            leftIcon={<Ionicons name="call-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={SIZES.iconMD} color={COLORS.gray400} />}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            gradient
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.adminHint}>
            <Text style={styles.adminHintText}>
              Admin Access: Use "00000000000" as phone and "admin123" as password
            </Text>
            <TouchableOpacity 
              style={styles.quickAdminButton}
              onPress={() => {
                setPhone('00000000000');
                setPassword('admin123');
              }}
            >
              <Text style={styles.quickAdminButtonText}>Quick Admin Login</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xl,
    paddingHorizontal: SIZES.lg,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  
  subtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  
  welcomeSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    marginTop: SIZES.lg,
  },
  
  welcomeTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  welcomeText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: SIZES.lg,
  },
  
  forgotPasswordText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  loginButton: {
    marginBottom: SIZES.lg,
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  
  dividerText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  
  registerLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  registerLinkText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  
  registerLinkBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  adminHint: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  adminHintText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },

  quickAdminButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },

  quickAdminButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


