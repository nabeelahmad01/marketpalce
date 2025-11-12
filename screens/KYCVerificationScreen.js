import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const { width } = Dimensions.get('window');

export default function KYCVerificationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [kycStatus, setKycStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    checkKYCStatus();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
      Alert.alert('Error', 'Failed to request camera permissions');
    }
  };

  const checkKYCStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        setKycStatus(userData.kycStatus || 'not_started');
      }
    } catch (error) {
      console.log('Error checking KYC status:', error);
    }
  };

  const pickImageFromGallery = async (step) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: step === 3 ? [1, 1] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        switch (step) {
          case 1:
            setCnicFrontImage(imageUri);
            break;
          case 2:
            setCnicBackImage(imageUri);
            break;
          case 3:
            setSelfieImage(imageUri);
            break;
        }

        if (step < 3) {
          setTimeout(() => {
            setCurrentStep(step + 1);
          }, 500);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const submitKYC = async () => {
    if (!cnicFrontImage || !cnicBackImage || !selfieImage) {
      Alert.alert('Error', 'Please complete all steps');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(user);

      // Create KYC request object
      const kycRequest = {
        id: Date.now().toString(),
        userId: userData.id || Date.now().toString(),
        userName: userData.name || 'Unknown User',
        userEmail: userData.email || 'user@example.com',
        userPhone: userData.phone || '+92300000000',
        userType: userData.type || 'customer',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        cnicFront: cnicFrontImage,
        cnicBack: cnicBackImage,
        selfie: selfieImage,
        categories: userData.categories || ['General Service'],
        location: userData.location || 'Pakistan',
      };

      // Save to pending KYC requests
      const existingRequests = await AsyncStorage.getItem('pendingKYCRequests');
      const requests = existingRequests ? JSON.parse(existingRequests) : [];
      requests.push(kycRequest);
      await AsyncStorage.setItem('pendingKYCRequests', JSON.stringify(requests));

      // Update user status
      const updatedUser = { ...userData, kycStatus: 'pending' };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setKycStatus('pending');
      Alert.alert(
        'Success!', 
        'Your KYC documents have been submitted successfully. Admin will review within 24-48 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit KYC documents');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepImage = () => {
    switch (currentStep) {
      case 1: return cnicFrontImage;
      case 2: return cnicBackImage;
      case 3: return selfieImage;
      default: return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'CNIC Front Side';
      case 2: return 'CNIC Back Side';
      case 3: return 'Live Selfie';
      default: return 'Step';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'Take a clear photo of the front side of your CNIC';
      case 2: return 'Take a clear photo of the back side of your CNIC';
      case 3: return 'Take a clear selfie for identity verification';
      default: return '';
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (kycStatus === 'approved') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          <Text style={styles.statusTitle}>Verification Complete!</Text>
          <Text style={styles.statusText}>
            Your account has been successfully verified.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.statusContainer}>
          <Ionicons name="time-outline" size={80} color={COLORS.warning} />
          <Text style={styles.statusTitle}>Under Review</Text>
          <Text style={styles.statusText}>
            Your documents are being reviewed. This usually takes 24-48 hours.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentImage = getCurrentStepImage();
  const allStepsCompleted = cnicFrontImage && cnicBackImage && selfieImage;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={styles.headerProgress}>
          <Text style={styles.progressText}>
            {(cnicFrontImage ? 1 : 0) + (cnicBackImage ? 1 : 0) + (selfieImage ? 1 : 0)}/3
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!allStepsCompleted ? (
          <>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{getStepTitle()}</Text>
              <Text style={styles.stepSubtitle}>{getStepSubtitle()}</Text>
            </View>

            {currentImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: currentImage }} style={styles.previewImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={() => pickImageFromGallery(currentStep)}
                  >
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </TouchableOpacity>
                  {currentStep < 3 && (
                    <TouchableOpacity 
                      style={styles.nextButton} 
                      onPress={() => setCurrentStep(currentStep + 1)}
                    >
                      <Text style={styles.nextButtonText}>Next Step</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.captureContainer}>
                <TouchableOpacity 
                  style={styles.captureButton} 
                  onPress={() => pickImageFromGallery(currentStep)}
                >
                  <Ionicons name="camera" size={32} color={COLORS.white} />
                  <Text style={styles.captureButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Review Your Documents</Text>
            
            <View style={styles.reviewGrid}>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>CNIC Front</Text>
                <Image source={{ uri: cnicFrontImage }} style={styles.reviewImage} />
                <TouchableOpacity onPress={() => { setCurrentStep(1); setCnicFrontImage(null); }}>
                  <Text style={styles.retakeLink}>Retake</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>CNIC Back</Text>
                <Image source={{ uri: cnicBackImage }} style={styles.reviewImage} />
                <TouchableOpacity onPress={() => { setCurrentStep(2); setCnicBackImage(null); }}>
                  <Text style={styles.retakeLink}>Retake</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Selfie</Text>
                <Image source={{ uri: selfieImage }} style={styles.reviewImage} />
                <TouchableOpacity onPress={() => { setCurrentStep(3); setSelfieImage(null); }}>
                  <Text style={styles.retakeLink}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={submitKYC}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Submit for Verification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerBackButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerProgress: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  captureContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
    gap: 10,
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  imagePreview: {
    flex: 1,
    alignItems: 'center',
  },
  previewImage: {
    width: width - 40,
    height: 240,
    borderRadius: 12,
    marginBottom: 20,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 15,
  },
  retakeButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  reviewContainer: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  reviewGrid: {
    marginBottom: 40,
  },
  reviewItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 10,
  },
  reviewImage: {
    width: width - 40,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  retakeLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
