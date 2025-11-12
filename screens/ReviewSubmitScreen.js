import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

const { width } = Dimensions.get('window');

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const QUICK_COMMENTS = [
  'Great service!',
  'Professional and on time',
  'Fixed the problem quickly',
  'Fair pricing',
  'Would recommend',
  'Excellent communication',
  'Very skilled mechanic',
  'Clean work area',
];

export default function ReviewSubmitScreen({ route, navigation }) {
  const { booking, mechanicId, mechanicName } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedQuickComments, setSelectedQuickComments] = useState([]);

  useEffect(() => {
    loadUserData();
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

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const toggleQuickComment = (quickComment) => {
    setSelectedQuickComments(prev => {
      if (prev.includes(quickComment)) {
        return prev.filter(c => c !== quickComment);
      } else {
        return [...prev, quickComment];
      }
    });
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map(asset => ({
          uri: asset.uri,
          id: Date.now() + Math.random(),
        }));
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim() && selectedQuickComments.length === 0) {
      Alert.alert('Error', 'Please write a comment or select quick comments');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        bookingId: booking?.id,
        mechanicId: mechanicId || booking?.mechanicId,
        mechanicName: mechanicName || booking?.mechanicName,
        customerId: currentUser?.id,
        customerName: currentUser?.name,
        rating,
        comment: comment.trim(),
        quickComments: selectedQuickComments,
        photos: photos.map(photo => photo.uri),
        serviceCategory: booking?.category,
        timestamp: new Date().toISOString(),
      };

      // Mock API call - replace with actual endpoint
      console.log('Submitting review:', reviewData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Your review has been submitted successfully. Thank you for your feedback!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? COLORS.warning : COLORS.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderQuickComments = () => {
    return (
      <View style={styles.quickCommentsContainer}>
        <Text style={styles.sectionTitle}>Quick Comments</Text>
        <View style={styles.quickCommentsGrid}>
          {QUICK_COMMENTS.map((quickComment) => (
            <TouchableOpacity
              key={quickComment}
              style={[
                styles.quickCommentChip,
                selectedQuickComments.includes(quickComment) && styles.quickCommentChipSelected,
              ]}
              onPress={() => toggleQuickComment(quickComment)}
            >
              <Text
                style={[
                  styles.quickCommentText,
                  selectedQuickComments.includes(quickComment) && styles.quickCommentTextSelected,
                ]}
              >
                {quickComment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPhotos = () => {
    return (
      <View style={styles.photosContainer}>
        <View style={styles.photosHeader}>
          <Text style={styles.sectionTitle}>Photos (Optional)</Text>
          <Text style={styles.photosCount}>{photos.length}/5</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(photo.id)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          
          {photos.length < 5 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImages}>
              <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <View style={styles.serviceIcon}>
            <Ionicons name="construct" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>
              {booking?.category || 'Service'}
            </Text>
            <Text style={styles.mechanicName}>
              by {mechanicName || booking?.mechanicName || 'Mechanic'}
            </Text>
            <Text style={styles.serviceDate}>
              {booking?.date ? new Date(booking.date).toLocaleDateString() : 'Recently completed'}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How was the service?</Text>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {RATING_LABELS[rating]}
            </Text>
          )}
        </View>

        {/* Quick Comments */}
        {renderQuickComments()}

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Additional Comments</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share more details about your experience..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comment.length}/500</Text>
        </View>

        {/* Photos */}
        {renderPhotos()}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={submitReview}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  serviceInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  mechanicName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  serviceDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ratingSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  quickCommentsContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickCommentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickCommentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickCommentChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickCommentText: {
    fontSize: 14,
    color: COLORS.text,
  },
  quickCommentTextSelected: {
    color: COLORS.white,
  },
  commentSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    backgroundColor: COLORS.background,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  photosContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photosCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  addPhotoText: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
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
});
