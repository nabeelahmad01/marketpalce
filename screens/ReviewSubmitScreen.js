// screens/ReviewSubmitScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export default function ReviewSubmitScreen({ route, navigation }) {
  const { mechanicId, mechanicName } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map(asset => `data:image/jpeg;base64,${asset.base64}`);
        setPhotos([...photos, ...newPhotos].slice(0, 4)); // Max 4 photos
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(user);

      const response = await fetch(`${API_BASE_URL}/reviews/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        },
        body: JSON.stringify({
          mechanicId,
          rating,
          comment,
          photos
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Review submitted! Thank you for your feedback.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>with {mechanicName}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How would you rate the service?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text style={styles.star}>
                  {rating >= star ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Tap to rate' : 
             rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' : 'Excellent'}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Share your experience</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
          <Text style={styles.photoHint}>Max 4 photos</Text>
          
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {photos.length < 4 && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, (rating === 0 || !comment.trim() || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || !comment.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            You can submit a review every 15 days for the same mechanic
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 30, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#E3F2FD' },
  content: { padding: 20 },
  ratingSection: { backgroundColor: '#fff', borderRadius: 15, padding: 25, marginBottom: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15 },
  starsContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  starButton: { padding: 5 },
  star: { fontSize: 40 },
  ratingText: { fontSize: 14, color: '#666', fontWeight: '500', marginTop: 5 },
  commentSection: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20 },
  commentInput: { 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 14, 
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 5 },
  photoSection: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20 },
  photoHint: { fontSize: 12, color: '#666', marginBottom: 15 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem: { width: 80, height: 80, borderRadius: 10, position: 'relative' },
  photoImage: { width: '100%', height: '100%', borderRadius: 10 },
  removePhotoBtn: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: '#F44336', 
    width: 24, 
    height: 24, 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removePhotoText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  addPhotoBtn: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#007AFF', 
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  addPhotoIcon: { fontSize: 24, marginBottom: 4 },
  addPhotoText: { fontSize: 10, color: '#007AFF', fontWeight: '600' },
  submitBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, marginBottom: 15 },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  noteCard: { 
    backgroundColor: '#E3F2FD', 
    padding: 15, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 10
  },
  noteIcon: { fontSize: 20 },
  noteText: { flex: 1, fontSize: 12, color: '#1976D2', lineHeight: 18 }
});
