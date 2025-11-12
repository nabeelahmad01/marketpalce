// screens/KYCVerificationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const { width, height } = Dimensions.get('window');

export default function KYCVerificationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: CNIC Front, 2: CNIC Back, 3: Selfie, 4: Review
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [kycStatus, setKycStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  useEffect(() => {
    checkKYCStatus();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
  };

  const checkKYCStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        // Mock status - replace with actual API call
        setKycStatus(userData.kycStatus || 'not_started');
      }
    } catch (error) {
      console.log('Error checking KYC status:', error);
    }
  };

  const pickCNICImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setCnicImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takeSelfie = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setSelfieImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture selfie');
    }
  };

  const handleSubmit = async () => {
    if (!cnicImage || !selfieImage) {
      Alert.alert('Error', 'Please upload both CNIC and selfie');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(user);

      const response = await fetch(`${API_BASE_URL}/kyc/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        },
        body: JSON.stringify({
          cnicImage,
          selfieImage
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'KYC submitted! Under review.');
        setKycStatus('pending');
      } else {
        Alert.alert('Error', 'Failed to submit KYC');
      }
    } catch (error) {
      Alert.alert('Error', 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera and media library permissions required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KYC Verification</Text>
        <View style={[styles.statusBadge, kycStatus === 'approved' && styles.approved, kycStatus === 'rejected' && styles.rejected]}>
          <Text style={styles.statusText}>
            {kycStatus === 'pending' ? '⏳ Under Review' : kycStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {kycStatus === 'approved' ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Verified!</Text>
            <Text style={styles.successText}>Your account is verified. You can now accept jobs.</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Upload CNIC Photo</Text>
              <Text style={styles.instruction}>Take a clear photo of your National ID card</Text>
              
              {cnicImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: cnicImage }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.retakeBtn} onPress={pickCNICImage}>
                    <Text style={styles.retakeText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={pickCNICImage}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Upload CNIC</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Take Live Selfie</Text>
              <Text style={styles.instruction}>Take a clear selfie for verification</Text>
              
              {selfieImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selfieImage }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.retakeBtn} onPress={takeSelfie}>
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={takeSelfie}>
                  <Text style={styles.uploadIcon}>🤳</Text>
                  <Text style={styles.uploadText}>Take Selfie</Text>
                </TouchableOpacity>
              )}
            </View>

            {cnicImage && selfieImage && kycStatus !== 'pending' && (
              <TouchableOpacity 
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit for Verification</Text>
                )}
              </TouchableOpacity>
            )}

            {kycStatus === 'pending' && (
              <View style={styles.pendingCard}>
                <Text style={styles.pendingIcon}>⏳</Text>
                <Text style={styles.pendingTitle}>Under Review</Text>
                <Text style={styles.pendingText}>
                  Your documents are being verified. This usually takes 24-48 hours.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  statusBadge: { backgroundColor: '#FFB74D', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  approved: { backgroundColor: '#4CAF50' },
  rejected: { backgroundColor: '#F44336' },
  statusText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  content: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#333' },
  instruction: { fontSize: 13, color: '#666', marginBottom: 15 },
  uploadBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 30, alignItems: 'center', borderWidth: 2, borderColor: '#007AFF', borderStyle: 'dashed' },
  uploadIcon: { fontSize: 50, marginBottom: 10 },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  imagePreview: { alignItems: 'center' },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  retakeBtn: { backgroundColor: '#FF9800', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retakeText: { color: '#fff', fontWeight: '600' },
  submitBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, marginTop: 20 },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  successCard: { backgroundColor: '#E8F5E9', padding: 30, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  successIcon: { fontSize: 60, marginBottom: 10 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  successText: { fontSize: 14, color: '#558B2F', textAlign: 'center' },
  pendingCard: { backgroundColor: '#FFF3E0', padding: 25, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  pendingIcon: { fontSize: 50, marginBottom: 10 },
  pendingTitle: { fontSize: 20, fontWeight: 'bold', color: '#E65100', marginBottom: 10 },
  pendingText: { fontSize: 13, color: '#EF6C00', textAlign: 'center' },
  errorText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }
});
