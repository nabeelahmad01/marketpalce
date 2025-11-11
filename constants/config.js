// constants/config.js
// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Add your Google Maps API Key here
  // Get it from: https://console.cloud.google.com/google/maps-apis
  API_KEY: '42ce295d465c1abd16bf7c4a887f09b6c2ebe48a',
  
  // Default map settings
  DEFAULT_REGION: {
    latitude: 31.5204, // Lahore, Pakistan
    longitude: 74.3587,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  
  // Pakistan bounds for location suggestions
  PAKISTAN_BOUNDS: {
    northeast: { lat: 37.084, lng: 77.835 },
    southwest: { lat: 23.634, lng: 60.872 }
  },
  
  // Map styling for professional look
  MAP_STYLE: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
  ],
  
  // Distance calculation settings
  DISTANCE_SETTINGS: {
    MAX_RADIUS_KM: 50,
    DEFAULT_RADIUS_KM: 10,
    AVERAGE_SPEED_KMH: 25,
  }
};

// App Configuration
export const APP_CONFIG = {
  // Live tracking settings
  LIVE_TRACKING: {
    UPDATE_INTERVAL_MS: 30000, // 30 seconds
    MIN_DISTANCE_METERS: 50,   // 50 meters
    ACCURACY_THRESHOLD: 100,   // 100 meters
  },
  
  // Request settings
  REQUEST_SETTINGS: {
    AUTO_REFRESH_INTERVAL_MS: 10000, // 10 seconds
    OFFER_TIMEOUT_MINUTES: 30,
    MAX_OFFERS_PER_REQUEST: 10,
  },
  
  // Notification settings
  NOTIFICATIONS: {
    ENABLE_PUSH: true,
    SOUND_ENABLED: true,
    VIBRATION_ENABLED: true,
  }
};

// Professional App Metadata
export const APP_METADATA = {
  NAME: 'Mechanic Hub',
  VERSION: '1.0.0',
  DESCRIPTION: 'Professional mechanic marketplace for Pakistan',
  SUPPORT_EMAIL: 'support@mechanichub.pk',
  SUPPORT_PHONE: '+92-300-1234567',
  WEBSITE: 'https://mechanichub.pk',
  
  // Social links
  SOCIAL: {
    FACEBOOK: 'https://facebook.com/mechanichub',
    INSTAGRAM: 'https://instagram.com/mechanichub',
    TWITTER: 'https://twitter.com/mechanichub',
  },
  
  // Legal
  PRIVACY_POLICY: 'https://mechanichub.pk/privacy',
  TERMS_OF_SERVICE: 'https://mechanichub.pk/terms',
};
