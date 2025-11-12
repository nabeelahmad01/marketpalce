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
import { Camera, CameraType } from 'expo-camera';

// Camera type constants for expo-camera v17+
const CAMERA_TYPES = {
  back: 'back',
  front: 'front',
};
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

const STEPS = [
  {
    id: 1,
    title: 'CNIC Front Side',
    subtitle: 'Take a clear photo of the front side of your CNIC',
    icon: 'card-outline',
    cameraType: CAMERA_TYPES.back,
  },
  {
    id: 2,
    title: 'CNIC Back Side',
    subtitle: 'Take a clear photo of the back side of your CNIC',
    icon: 'card-outline',
    cameraType: CAMERA_TYPES.back,
  },
  {
    id: 3,
    title: 'Live Selfie',
    subtitle: 'Take a clear selfie for identity verification',
    icon: 'person-outline',
    cameraType: CAMERA_TYPES.front,
  },
];

export default function KYCVerificationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [kycStatus, setKycStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(CAMERA_TYPES.back);
  const cameraRef = useRef(null);

  useEffect(() => {
    checkKYCStatus();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('Requesting camera permissions...');
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      console.log('Camera permission status:', cameraStatus);
      
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission status:', mediaStatus);
      
      const hasAllPermissions = cameraStatus === 'granted' && mediaStatus === 'granted';
      console.log('All permissions granted:', hasAllPermissions);
      
      setHasPermission(hasAllPermissions);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
      Alert.alert('Error', 'Failed to request camera permissions. Please enable camera access in your device settings.');
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

  const openCamera = (step) => {
    try {
      console.log('Opening camera for step:', step);
      const stepData = STEPS.find(s => s.id === step);
      console.log('Step data:', stepData);
      console.log('Camera type:', stepData.cameraType);
      setCameraType(stepData.cameraType);
      setShowCamera(true);
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        const imageUri = `data:image/jpeg;base64,${photo.base64}`;

        // Store image based on current step
        switch (currentStep) {
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

        setShowCamera(false);
        
        // Auto advance to next step
        if (currentStep < 3) {
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
          }, 500);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const retakePicture = (step) => {
    setCurrentStep(step);
    openCamera(step);
  };

  const submitKYC = async () => {
    if (!cnicFrontImage || !cnicBackImage || !selfieImage) {
      Alert.alert('Error', 'Please complete all steps');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(user);

      // Mock API call - replace with actual endpoint
      const kycData = {
        userId: userData.id,
        cnicFront: cnicFrontImage,
        cnicBack: cnicBackImage,
        selfie: selfieImage,
        timestamp: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user data
      const updatedUser = { ...userData, kycStatus: 'pending' };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setKycStatus('pending');
      Alert.alert(
        'Success!', 
        'Your KYC documents have been submitted successfully. We will review them within 24-48 hours.',
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

  const getCompletedSteps = () => {
    let completed = 0;
    if (cnicFrontImage) completed++;
    if (cnicBackImage) completed++;
    if (selfieImage) completed++;
    return completed;
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep === step.id && styles.activeStep,
            getCurrentStepImage() && currentStep === step.id && styles.completedStep,
            currentStep > step.id && styles.completedStep,
          ]}>
            {currentStep > step.id || (currentStep === step.id && getCurrentStepImage()) ? (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            ) : (
              <Text style={[styles.stepNumber, currentStep === step.id && styles.activeStepNumber]}>
                {step.id}
              </Text>
            )}
          </View>
          {index < STEPS.length - 1 && (
            <View style={[styles.stepLine, currentStep > step.id && styles.completedLine]} />
          )}
        </View>
      ))}
    </View>
  );

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to capture your identity documents
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (kycStatus === 'approved') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.statusContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.statusTitle}>Verification Complete!</Text>
          <Text style={styles.statusText}>
            Your account has been successfully verified. You can now access all features.
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
          <View style={styles.pendingIcon}>
            <Ionicons name="time-outline" size={80} color={COLORS.warning} />
          </View>
          <Text style={styles.statusTitle}>Under Review</Text>
          <Text style={styles.statusText}>
            Your documents are being reviewed. This process usually takes 24-48 hours. 
            We'll notify you once the verification is complete.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepData = STEPS.find(s => s.id === currentStep);
  const currentImage = getCurrentStepImage();
  const completedSteps = getCompletedSteps();
  const allStepsCompleted = completedSteps === 3;

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
          <Text style={styles.progressText}>{completedSteps}/3</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Content */}
      <View style={styles.content}>
        {!allStepsCompleted ? (
          <>
            <View style={styles.stepInfo}>
              <View style={styles.stepIconContainer}>
                <Ionicons name={currentStepData.icon} size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
            </View>

            {currentImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: currentImage }} style={styles.previewImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={() => retakePicture(currentStep)}
                  >
                    <Ionicons name="camera-outline" size={20} color={COLORS.white} />
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </TouchableOpacity>
                  {currentStep < 3 && (
                    <TouchableOpacity 
                      style={styles.nextButton} 
                      onPress={() => setCurrentStep(currentStep + 1)}
                    >
                      <Text style={styles.nextButtonText}>Next Step</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.captureContainer}>
              <View style={styles.captureOptions}>
                <TouchableOpacity 
                  style={styles.captureButton} 
                  onPress={() => openCamera(currentStep)}
                >
                  <Ionicons name="camera" size={32} color={COLORS.white} />
                  <Text style={styles.captureButtonText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.galleryButton} 
                  onPress={() => pickImageFromGallery(currentStep)}
                >
                  <Ionicons name="images" size={24} color={COLORS.primary} />
                  <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
            <Text style={styles.reviewTitle}>Review Your Documents</Text>
            
            <View style={styles.reviewGrid}>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>CNIC Front</Text>
                <Image source={{ uri: cnicFrontImage }} style={styles.reviewImage} />
                <TouchableOpacity onPress={() => retakePicture(1)}>
                  <Text style={styles.retakeLink}>Retake</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>CNIC Back</Text>
                <Image source={{ uri: cnicBackImage }} style={styles.reviewImage} />
                <TouchableOpacity onPress={() => retakePicture(2)}>
                  <Text style={styles.retakeLink}>Retake</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Selfie</Text>
                <Image source={{ uri: selfieImage }} style={styles.reviewImage} />
                <TouchableOpacity onPress={() => retakePicture(3)}>
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

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            ratio="16:9"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity onPress={() => setShowCamera(false)}>
                  <Ionicons name="close" size={30} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.cameraTitle}>{currentStepData?.title}</Text>
                <View style={{ width: 30 }} />
              </View>

              <View style={styles.cameraGuide}>
                {currentStep === 3 ? (
                  <View style={styles.selfieGuide} />
                ) : (
                  <View style={styles.cardGuide} />
                )}
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                  <View style={styles.captureBtnInner} />
                </TouchableOpacity>
              </View>
            </View>
          </Camera>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  completedStep: {
    backgroundColor: COLORS.success,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeStepNumber: {
    color: COLORS.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  completedLine: {
    backgroundColor: COLORS.success,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  reviewItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 10,
  },
  reviewImage: {
    width: '100%',
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
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  cameraGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGuide: {
    width: width * 0.8,
    height: width * 0.5,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  selfieGuide: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 100,
    borderStyle: 'dashed',
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIcon: {
    marginBottom: 30,
  },
  pendingIcon: {
    marginBottom: 30,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
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
