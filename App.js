// App.js - Main Application
import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StatusBar } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Auth Context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CustomerHomeScreen from './screens/CustomerHomeScreen';
import MechanicHomeScreen from './screens/MechanicHomeScreen';
import ServiceCategoryScreen from './screens/ServiceCategoryScreen';
import MechanicsListScreen from './screens/MechanicsListScreen';
import MechanicProfileScreen from './screens/MechanicProfileScreen';
import ChatScreen from './screens/ChatScreen';
import BookingScreen from './screens/BookingScreen';
import WalletScreen from './screens/WalletScreen';
import QualityScoreScreen from './screens/QualityScoreScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import LocationTrackingScreen from './screens/LocationTrackingScreen';
import MyJobsScreen from './screens/MyJobsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import KYCVerificationScreen from './screens/KYCVerificationScreen';
import OffersScreen from './screens/OffersScreen';
import SendOfferScreen from './screens/SendOfferScreen';
import MapTrackingScreen from './screens/MapTrackingScreen';
import ReviewSubmitScreen from './screens/ReviewSubmitScreen';
import AdminKYCScreen from './screens/AdminKYCScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';
import AdminKYCApprovalScreen from './screens/AdminKYCApprovalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const API_URL = 'http://localhost:5000/api';

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e0e0e0', height: 60 },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 3 },
      }}
    >
      <Tab.Screen
        name="CustomerHome"
        component={CustomerHomeScreen}
        options={{
          tabBarLabel: 'Services',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Top Mechanics',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function MechanicTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e0e0e0', height: 60 },
      }}
    >
      <Tab.Screen
        name="MechanicHome"
        component={MechanicHomeScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💼</Text>,
        }}
      />
      <Tab.Screen
        name="MyJobs"
        component={MyJobsScreen}
        options={{
          tabBarLabel: 'My Jobs',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="MechanicChat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="MechanicWallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      // Check if user is already logged in
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('currentUser');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('Found existing login:', user);
        setUserType(user.type);
      } else {
        console.log('No existing login found');
        setUserType(null);
      }
    } catch (error) {
      console.log('Error checking user type:', error);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('currentUser');
      setUserType(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userType === null ? (
          <>
            <Stack.Screen
              name="Login"
              children={(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={(user) => {
                    if (user?.type) {
                      setUserType(user.type);
                    }
                  }}
                />
              )}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : userType === 'customer' ? (
          <>
            <Stack.Screen 
              name="CustomerTabs" 
              children={(props) => (
                <AuthContext.Provider value={{ handleLogout }}>
                  <CustomerTabs {...props} />
                </AuthContext.Provider>
              )}
            />
            <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} options={{ headerShown: true, title: 'Request Service' }} />
            <Stack.Screen name="Offers" component={OffersScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MapTracking" component={MapTrackingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} options={{ headerShown: true, title: 'Write Review' }} />
            <Stack.Screen name="MechanicsList" component={MechanicsListScreen} options={{ headerShown: true }} />
            <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: true }} />
            <Stack.Screen name="LocationTracking" component={LocationTrackingScreen} options={{ headerShown: true }} />
            <Stack.Screen 
              name="Settings" 
              children={(props) => (
                <AuthContext.Provider value={{ handleLogout }}>
                  <SettingsScreen {...props} />
                </AuthContext.Provider>
              )}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Profile" 
              children={(props) => (
                <AuthContext.Provider value={{ handleLogout }}>
                  <ProfileScreen {...props} />
                </AuthContext.Provider>
              )}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
          </>
        ) : userType === 'admin' ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AdminKYC" component={AdminKYCScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AdminKYCApproval" component={AdminKYCApprovalScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="MechanicTabs" 
              children={(props) => (
                <AuthContext.Provider value={{ handleLogout }}>
                  <MechanicTabs {...props} />
                </AuthContext.Provider>
              )}
            />
            <Stack.Screen name="SendOffer" component={SendOfferScreen} options={{ headerShown: true, title: 'Send Offer' }} />
            <Stack.Screen name="KYCVerification" component={KYCVerificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} options={{ headerShown: true }} />
          </>
        )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}