// screens/MechanicHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { API_BASE_URL } from '../constants/api';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  background: '#F8FAFC',
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
  caption: 12,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,
};

export default function MechanicHomeScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(user);

      const response = await fetch(`${API_BASE_URL}/services/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderRequest = ({ item }) => {
    // Check if user already sent offer
    const hasOffer = item.offers?.some(o => o.mechanicId === item._id);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('SendOffer', { request: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={[styles.statusBadge, item.status === 'pending' && styles.statusPending]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.location}>📍 {item.location}</Text>
          <Text style={styles.customer}>👤 {item.customerId?.name || 'Customer'}</Text>
        </View>

        <View style={styles.offerInfo}>
          <Text style={styles.offersCount}>
            {item.offers?.length || 0} offer(s) received
          </Text>
          <Text style={styles.timeAgo}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.offerBtn, hasOffer && styles.offerBtnSent]}
          disabled={hasOffer}
        >
          <Text style={styles.offerBtnText}>
            {hasOffer ? '✓ Offer Sent' : 'Send Offer →'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'currentUser']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading available jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header
        title="Available Jobs"
        subtitle={`${requests.length} job${requests.length !== 1 ? 's' : ''} available`}
        rightComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={SIZES.iconMD} color={COLORS.white} />
          </TouchableOpacity>
        }
      />

      <FlatList 
        data={requests} 
        renderItem={renderRequest} 
        keyExtractor={item => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={SIZES.iconXL} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>No Jobs Available</Text>
            <Text style={styles.emptyText}>Check back later for new service requests</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
  },
  
  logoutButton: {
    padding: SIZES.sm,
    borderRadius: SIZES.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  list: {
    flex: 1,
  },
  
  listContent: {
    padding: SIZES.md,
  },
  
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  
  category: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
  },
  
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  
  statusText: {
    color: COLORS.warning,
    fontSize: SIZES.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  description: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    lineHeight: 20,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  
  location: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  
  customer: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  
  offerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  
  offersCount: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  timeAgo: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  
  offerBtn: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  offerBtnSent: {
    backgroundColor: COLORS.success,
  },
  
  offerBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: SIZES.bodySmall,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
  },
  
  emptyTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  
  emptyText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});