import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const STATUS_COLORS = {
  pending: COLORS.warning,
  accepted: COLORS.primary,
  'in-progress': COLORS.secondary,
  completed: COLORS.success,
  cancelled: COLORS.error,
};

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed

  useEffect(() => {
    loadUserData();
    loadBookings();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('currentUser');
      const user = JSON.parse(userData);

      // Mock data for now - replace with actual API call
      const mockBookings = [
        {
          id: '1',
          category: 'Car Mechanic',
          description: 'Engine oil change and brake check',
          status: 'completed',
          mechanicName: 'Ahmed Ali',
          customerName: 'John Doe',
          price: 2500,
          date: '2024-11-10',
          location: 'Gulberg, Lahore',
          rating: 5,
          canReview: true,
        },
        {
          id: '2',
          category: 'Bike Mechanic',
          description: 'Chain replacement and tune-up',
          status: 'in-progress',
          mechanicName: 'Hassan Khan',
          customerName: 'Jane Smith',
          price: 1500,
          date: '2024-11-12',
          location: 'DHA, Karachi',
          rating: null,
          canReview: false,
        },
        {
          id: '3',
          category: 'Electrician',
          description: 'Wiring repair in kitchen',
          status: 'pending',
          mechanicName: 'Ali Raza',
          customerName: 'Mike Johnson',
          price: 3000,
          date: '2024-11-13',
          location: 'F-7, Islamabad',
          rating: null,
          canReview: false,
        },
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleRateService = (booking) => {
    navigation.navigate('ReviewSubmit', { booking });
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Update booking status to cancelled
            setBookings(prev => 
              prev.map(booking => 
                booking.id === bookingId 
                  ? { ...booking, status: 'cancelled' }
                  : booking
              )
            );
            Alert.alert('Success', 'Booking cancelled successfully');
          },
        },
      ]
    );
  };

  const handleContactMechanic = (booking) => {
    navigation.navigate('Chat', { 
      otherUser: {
        id: booking.mechanicId,
        name: booking.mechanicName,
        type: 'mechanic'
      }
    });
  };

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'pending':
        return bookings.filter(b => ['pending', 'accepted', 'in-progress'].includes(b.status));
      case 'completed':
        return bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
      default:
        return bookings;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingCategory}>{item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}20` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.bookingPrice}>₹{item.price}</Text>
      </View>

      <Text style={styles.bookingDescription}>{item.description}</Text>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {currentUser?.type === 'customer' ? item.mechanicName : item.customerName}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
      </View>

      {item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Your Rating:</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? 'star' : 'star-outline'}
                size={16}
                color={COLORS.warning}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.bookingActions}>
        {item.status === 'completed' && item.canReview && !item.rating && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => handleRateService(item)}
          >
            <Ionicons name="star-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Rate Service</Text>
          </TouchableOpacity>
        )}

        {['accepted', 'in-progress'].includes(item.status) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => handleContactMechanic(item)}
          >
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        )}

        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(item.id)}
          >
            <Ionicons name="close-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          title="All"
          isActive={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
        />
        <TabButton
          title="Active"
          isActive={activeTab === 'pending'}
          onPress={() => setActiveTab('pending')}
        />
        <TabButton
          title="History"
          isActive={activeTab === 'completed'}
          onPress={() => setActiveTab('completed')}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={getFilteredBookings()}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' 
                ? 'You haven\'t made any bookings yet'
                : `No ${activeTab} bookings found`
              }
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 34,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  reviewButton: {
    backgroundColor: COLORS.warning,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
