# Google Maps API Setup Guide

## 🗺️ Complete Setup for Professional Mechanic Marketplace

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name: "Mechanic Hub App"
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - ✅ Maps SDK for Android
     - ✅ Maps SDK for iOS  
     - ✅ Places API
     - ✅ Directions API
     - ✅ Geocoding API
     - ✅ Distance Matrix API

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

5. **Secure Your API Key**
   - Click on your API key to edit
   - Under "Application restrictions":
     - Select "Android apps" and add your package name
     - Select "iOS apps" and add your bundle identifier
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose the APIs you enabled above

### Step 2: Configure Your App

1. **Update Config File**
   ```javascript
   // constants/config.js
   export const GOOGLE_MAPS_CONFIG = {
     API_KEY: 'YOUR_ACTUAL_API_KEY_HERE', // Replace with your API key
     // ... rest of config
   };
   ```

2. **For Android (android/app/src/main/AndroidManifest.xml)**
   ```xml
   <application>
     <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_API_KEY_HERE"/>
   </application>
   ```

3. **For iOS (ios/YourApp/AppDelegate.m)**
   ```objc
   #import <GoogleMaps/GoogleMaps.h>

   - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
   {
     [GMSServices provideAPIKey:@"YOUR_API_KEY_HERE"];
     return YES;
   }
   ```

### Step 3: Install Required Packages

```bash
# Install Google Maps packages
npm install react-native-maps react-native-maps-directions

# For Expo (if using Expo)
expo install expo-location

# For React Native CLI
npm install @react-native-community/geolocation
```

### Step 4: Features Implemented

#### 🎯 **InDrive-like Functionality**
- **Nearby Mechanics**: Find mechanics within 10km radius
- **Real-time Distance**: Calculate exact distance and arrival time
- **Live Tracking**: Track mechanic location in real-time
- **Broadcast Requests**: Send request to all nearby mechanics
- **Instant Offers**: Receive offers with pricing and ETA

#### 🗺️ **Professional Map Features**
- **Custom Markers**: Different icons for each service category
- **Route Directions**: Google Maps directions integration
- **Distance Calculation**: Accurate distance and time estimation
- **Live Location**: Real-time location updates
- **Professional Styling**: Clean, business-focused map design

#### 📱 **Mobile-First Design**
- **Responsive Layout**: Perfect on all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Performance Optimized**: Smooth scrolling and fast loading
- **Offline Support**: Basic functionality without internet

### Step 5: API Endpoints Added

#### **Find Nearby Mechanics**
```javascript
POST /api/mechanics/nearby
{
  "latitude": 31.5204,
  "longitude": 74.3587,
  "category": "Bike Mechanic",
  "radius": 10
}
```

#### **Send Service Request**
```javascript
POST /api/services/request
{
  "mechanicId": "mechanic_id",
  "category": "Car Mechanic",
  "description": "Engine problem",
  "location": { "latitude": 31.5204, "longitude": 74.3587 },
  "requestedPrice": 1500,
  "urgency": "normal"
}
```

#### **Broadcast to All Mechanics**
```javascript
POST /api/services/broadcast
{
  "mechanicIds": ["id1", "id2", "id3"],
  "category": "Plumber",
  "description": "Water leakage",
  "requestedPrice": 2000,
  "urgency": "urgent"
}
```

#### **Get Offers for Request**
```javascript
GET /api/services/request/:requestId/offers
```

#### **Accept Offer**
```javascript
POST /api/services/offer/:offerId/accept
```

### Step 6: Professional Features

#### 🚀 **Live Tracking System**
- Updates every 30 seconds
- Shows distance in km/meters
- Estimates arrival time
- Real-time location sync with server

#### 💰 **Smart Pricing System**
- Customer sets budget
- Mechanics send competitive offers
- Transparent pricing
- No hidden fees

#### ⭐ **Rating & Review System**
- Customer ratings for mechanics
- Review history
- Quality score tracking
- Performance metrics

#### 🔔 **Real-time Notifications**
- New request alerts
- Offer notifications
- Status updates
- Chat messages

### Step 7: Testing Your Setup

1. **Test Map Loading**
   - Open the app
   - Navigate to service request
   - Check if map loads properly

2. **Test Location Services**
   - Allow location permissions
   - Verify current location detection
   - Test location picker

3. **Test API Integration**
   - Search for nearby mechanics
   - Send a test request
   - Check offer system

### Step 8: Production Deployment

1. **Secure API Keys**
   - Use environment variables
   - Restrict API key usage
   - Monitor API usage

2. **Performance Optimization**
   - Enable map caching
   - Optimize marker rendering
   - Implement lazy loading

3. **Error Handling**
   - Network error handling
   - Location permission errors
   - API rate limit handling

### 🎉 **Your App is Now Ready!**

You now have a **professional, InDrive-like mechanic marketplace** with:
- ✅ Google Maps integration
- ✅ Live location tracking  
- ✅ Distance & time calculation
- ✅ Real-time offers system
- ✅ Professional UI/UX
- ✅ Pakistan-specific features
- ✅ Mobile-optimized design

### 📞 **Support**
If you need help with setup or have questions:
- Check the console for error messages
- Verify API key permissions
- Test on actual device (not simulator for location)
- Ensure all packages are properly installed

**Your professional mechanic marketplace is ready for launch! 🚀**
