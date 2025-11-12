import { Platform } from 'react-native';

// API Configuration for different platforms
const getApiUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    } else {
      // For mobile devices/simulators - use your computer's IP
      return "http://192.168.0.47:5000/api";
    }
  } else {
    // Production mode - replace with your production API URL
    return 'https://your-production-api.com/api';
  }
};

export const API_BASE_URL = getApiUrl();
