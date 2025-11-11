# 🚀 Mechanic Marketplace - Setup Guide

## Quick Start

### 1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 2. **Start the Development Server**
```bash
npm start
# or
expo start
```

### 3. **Run on Device/Simulator**
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **iOS**: Press `i` in terminal or scan QR code with Camera app
- **Web**: Press `w` in terminal

## 📱 Project Structure

```
marketpalce/
├── app/                    # Expo Router files
├── assets/                 # Images and static files
├── backend/               # Node.js backend server
├── components/            # Reusable UI components
│   ├── Button.js         # Custom button component
│   ├── Header.js         # Screen header component
│   ├── Input.js          # Form input component
│   └── ...
├── constants/            # App constants
│   ├── api.js           # API endpoints
│   ├── theme.js         # Theme configuration
│   └── pakistanCities.js # Location data
├── screens/             # App screens
│   ├── LoginScreen.js
│   ├── CustomerHomeScreen.js
│   ├── MechanicHomeScreen.js
│   └── ...
└── App.js              # Main app component
```

## 🔧 Configuration

### **API Configuration**
Update `constants/api.js`:
```javascript
export const API_BASE_URL = 'http://your-backend-url:5000/api';
```

### **Google Maps Setup**
1. Get Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `constants/config.js`:
```javascript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: 'your-google-maps-api-key'
};
```

### **Backend Server**
Start the backend server:
```bash
cd backend
npm install
npm start
```

## 👥 User Types & Features

### **Customer App**
- Browse service categories (Bike, Car, Plumber, etc.)
- Request services with location
- Chat with mechanics
- Track service progress
- Make payments

### **Mechanic App**  
- View available jobs
- Send competitive offers
- Navigate to customer location
- Complete service requests
- Manage earnings

### **Admin Panel**
- Review KYC applications
- Monitor platform activity
- Manage user disputes

## 🎨 UI Components

### **Theme System**
All components use consistent theming:
```javascript
const COLORS = {
  primary: '#2563EB',
  secondary: '#10B981', 
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};
```

### **Component Usage**
```jsx
// Button component
<Button 
  title="Login" 
  onPress={handleLogin}
  variant="primary"
  gradient={true}
  loading={isLoading}
/>

// Input component  
<Input
  label="Phone Number"
  placeholder="Enter phone"
  value={phone}
  onChangeText={setPhone}
  error={errors.phone}
/>
```

## 📱 Screen Navigation

```
App Launch → Login/Register → User Dashboard
    ↓
Customer: Home → Service → Mechanics → Booking → Chat
Mechanic: Jobs → Offers → Navigation → Completion  
Admin: KYC → Reviews → Approvals
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Metro bundler port conflict**
   ```bash
   npx expo start --port 8083
   ```

2. **Missing dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Android build issues**
   ```bash
   npx expo run:android
   ```

4. **iOS simulator not working**
   ```bash
   npx expo run:ios
   ```

### **Development Tips**

- Use `npx expo install` for Expo-compatible packages
- Clear cache: `npx expo start --clear`
- Reset project: `npm run reset-project`
- Check logs: Enable Remote JS Debugging

## 📋 Testing

### **Manual Testing Checklist**
- [ ] App launches successfully
- [ ] Login/Registration works
- [ ] Navigation between screens
- [ ] Form validation
- [ ] Location services
- [ ] Map integration
- [ ] Chat functionality
- [ ] Payment flow

### **Device Testing**
- [ ] Android phones (various screen sizes)
- [ ] iOS devices (iPhone/iPad)
- [ ] Web browser compatibility
- [ ] Tablet layouts

## 🚀 Deployment

### **Build for Production**
```bash
# Android APK
eas build --platform android

# iOS IPA  
eas build --platform ios

# Web deployment
npm run build:web
```

### **App Store Submission**
1. Update `app.json` with store information
2. Generate app icons and splash screens
3. Build production versions
4. Submit to Google Play / App Store

## 📞 Support

For technical issues:
1. Check this setup guide
2. Review error logs in terminal
3. Test on different devices/simulators
4. Verify backend API connectivity

---

**Status**: ✅ Ready for Development
**Last Updated**: November 11, 2025
