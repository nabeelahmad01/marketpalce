import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

const COLORS = {
  primary: '#8B5CF6',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  success: '#10B981',
  error: '#EF4444',
};

export default function CameraTestScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [testResults, setTestResults] = useState({
    permissions: 'pending',
    imagePicker: 'pending',
    camera: 'pending',
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Check permissions
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      const permissionsGranted = cameraStatus === 'granted' && mediaStatus === 'granted';
      setHasPermission(permissionsGranted);
      
      setTestResults(prev => ({
        ...prev,
        permissions: permissionsGranted ? 'success' : 'error'
      }));
    } catch (error) {
      console.error('Permission test failed:', error);
      setTestResults(prev => ({
        ...prev,
        permissions: 'error'
      }));
    }

    // Test 2: Test ImagePicker
    try {
      // Just check if the function exists and can be called
      const canLaunch = typeof ImagePicker.launchImageLibraryAsync === 'function';
      setTestResults(prev => ({
        ...prev,
        imagePicker: canLaunch ? 'success' : 'error'
      }));
    } catch (error) {
      console.error('ImagePicker test failed:', error);
      setTestResults(prev => ({
        ...prev,
        imagePicker: 'error'
      }));
    }

    // Test 3: Test Camera component
    try {
      // Check if Camera component is available
      const cameraAvailable = typeof Camera.requestCameraPermissionsAsync === 'function';
      setTestResults(prev => ({
        ...prev,
        camera: cameraAvailable ? 'success' : 'error'
      }));
    } catch (error) {
      console.error('Camera test failed:', error);
      setTestResults(prev => ({
        ...prev,
        camera: 'error'
      }));
    }
  };

  const testImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        Alert.alert('Success!', 'Image picker is working correctly');
      }
    } catch (error) {
      Alert.alert('Error', `Image picker failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'time-outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Camera Test</Text>
        <View />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Camera Functionality Test</Text>
        <Text style={styles.subtitle}>
          This screen tests if camera and image picker functionality is working correctly.
        </Text>

        <View style={styles.testResults}>
          <View style={styles.testItem}>
            <Ionicons 
              name={getStatusIcon(testResults.permissions)} 
              size={24} 
              color={getStatusColor(testResults.permissions)} 
            />
            <Text style={styles.testLabel}>Camera Permissions</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.permissions) }]}>
              {testResults.permissions}
            </Text>
          </View>

          <View style={styles.testItem}>
            <Ionicons 
              name={getStatusIcon(testResults.imagePicker)} 
              size={24} 
              color={getStatusColor(testResults.imagePicker)} 
            />
            <Text style={styles.testLabel}>Image Picker</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.imagePicker) }]}>
              {testResults.imagePicker}
            </Text>
          </View>

          <View style={styles.testItem}>
            <Ionicons 
              name={getStatusIcon(testResults.camera)} 
              size={24} 
              color={getStatusColor(testResults.camera)} 
            />
            <Text style={styles.testLabel}>Camera Component</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.camera) }]}>
              {testResults.camera}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.testButton} onPress={testImagePicker}>
            <Ionicons name="images" size={20} color={COLORS.white} />
            <Text style={styles.testButtonText}>Test Image Picker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retestButton} onPress={runTests}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.retestButtonText}>Run Tests Again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Troubleshooting:</Text>
          <Text style={styles.infoText}>
            • Make sure you have granted camera and media library permissions{'\n'}
            • Restart the app if permissions were just granted{'\n'}
            • Check that expo-camera and expo-image-picker are properly installed
          </Text>
        </View>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 30,
  },
  testResults: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  testLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  testStatus: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actions: {
    gap: 15,
    marginBottom: 30,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  retestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  retestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  info: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
