// screens/RequestOffersScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import { API_BASE_URL } from '../constants/api';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';

export default function RequestOffersScreen({ route, navigation }) {
  const { requestId, category } = route.params;
  const [offers, setOffers] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(null);

  useEffect(() => {
    loadOffers();
    const interval = setInterval(loadOffers, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOffers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/services/request/${requestId}/offers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setOffers(data.offers || []);
        setRequestDetails(data.request);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOffers();
  };

  const acceptOffer = async (offer) => {
    Alert.alert(
      'Accept Offer',
      `Accept offer from ${offer.mechanic.name} for PKR ${offer.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setAcceptingOffer(offer._id);
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/services/offer/${offer._id}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.ok) {
                Alert.alert(
                  'Offer Accepted!',
                  `${offer.mechanic.name} will contact you shortly.`,
                  [
                    {
                      text: 'Track Service',
                      onPress: () => navigation.navigate('ServiceTracking', {
                        serviceId: offer._id,
                        mechanicId: offer.mechanic._id
                      })
                    }
                  ]
                );
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message || 'Failed to accept offer');
              }
            } catch (error) {
              console.error('Error accepting offer:', error);
              Alert.alert('Error', 'Failed to accept offer');
            } finally {
              setAcceptingOffer(null);
            }
          }
        }
      ]
    );
  };

  const calculateDistance = (mechanicLocation) => {
    if (!requestDetails?.location || !mechanicLocation) return 'Unknown';
    
    const lat1 = requestDetails.location.latitude;
    const lon1 = requestDetails.location.longitude;
    const lat2 = mechanicLocation.latitude;
    const lon2 = mechanicLocation.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const estimateArrivalTime = (distance) => {
    if (distance === 'Unknown') return 'Unknown';
    
    const km = parseFloat(distance);
    if (isNaN(km)) return 'Unknown';
    
    // Estimate based on average city speed (25 km/h)
    const hours = km / 25;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const renderOffer = ({ item: offer }) => {
    const distance = calculateDistance(offer.mechanic.location);
    const arrivalTime = estimateArrivalTime(distance);
    const isAccepting = acceptingOffer === offer._id;

    return (
      <View style={styles.offerCard}>
        <View style={styles.offerHeader}>
          <View style={styles.mechanicInfo}>
            <View style={styles.mechanicAvatar}>
              <Text style={styles.mechanicInitial}>
                {offer.mechanic.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.mechanicDetails}>
              <Text style={styles.mechanicName}>{offer.mechanic.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={SIZES.iconSM} color={COLORS.warning} />
                <Text style={styles.ratingText}>{offer.mechanic.rating || '4.5'}</Text>
                <Text style={styles.reviewsText}>({offer.mechanic.reviews || '25'})</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Offer</Text>
            <Text style={styles.priceValue}>PKR {offer.price}</Text>
          </View>
        </View>

        <View style={styles.offerDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={SIZES.iconSM} color={COLORS.primary} />
            <Text style={styles.detailText}>Distance: {distance}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={SIZES.iconSM} color={COLORS.success} />
            <Text style={styles.detailText}>Arrival: {arrivalTime}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="construct" size={SIZES.iconSM} color={COLORS.secondary} />
            <Text style={styles.detailText}>Experience: {offer.mechanic.experience || '5+'} years</Text>
          </View>
        </View>

        {offer.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>{offer.message}</Text>
          </View>
        )}

        <View style={styles.offerActions}>
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => navigation.navigate('MechanicProfile', { mechanicId: offer.mechanic._id })}
          >
            <Ionicons name="person" size={SIZES.iconSM} color={COLORS.primary} />
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>

          <Button
            title="Accept Offer"
            onPress={() => acceptOffer(offer)}
            loading={isAccepting}
            gradient
            style={styles.acceptButton}
          />
        </View>

        <View style={styles.timeStamp}>
          <Text style={styles.timeStampText}>
            Received {new Date(offer.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="hourglass" size={SIZES.iconXXL} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>Waiting for Offers</Text>
      <Text style={styles.emptyText}>
        Mechanics in your area will send offers soon. Pull down to refresh.
      </Text>
    </View>
  );

  if (loading && offers.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title="Service Offers"
          subtitle="Waiting for responses..."
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={SIZES.iconXXL} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header
        title="Service Offers"
        subtitle={`${offers.length} offers received`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {requestDetails && (
        <View style={styles.requestSummary}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.requestHeader}
          >
            <Text style={styles.requestCategory}>{category}</Text>
            <Text style={styles.requestDescription} numberOfLines={2}>
              {requestDetails.description}
            </Text>
            <Text style={styles.requestBudget}>
              Budget: PKR {requestDetails.requestedPrice}
            </Text>
          </LinearGradient>
        </View>
      )}

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
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
  },
  
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  
  requestSummary: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  
  requestHeader: {
    padding: 16,
  },
  
  requestCategory: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  
  requestDescription: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SIZES.sm,
  },
  
  requestBudget: {
    fontSize: SIZES.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  
  offerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  mechanicAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  mechanicInitial: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  mechanicDetails: {
    flex: 1,
  },
  
  mechanicName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SIZES.xs,
  },
  
  reviewsText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
  
  priceContainer: {
    alignItems: 'flex-end',
  },
  
  priceLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  
  priceValue: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  
  offerDetails: {
    marginBottom: 16,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  
  detailText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  
  messageContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: 4,
    padding: SIZES.sm,
    marginBottom: 16,
  },
  
  messageLabel: {
    fontSize: SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  messageText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  viewProfileText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: SIZES.xs,
  },
  
  acceptButton: {
    flex: 1,
    marginLeft: 16,
  },
  
  timeStamp: {
    alignItems: 'flex-end',
  },
  
  timeStampText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: SIZES.sm,
  },
  
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SIZES.xl,
  },
});
