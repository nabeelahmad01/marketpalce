// screens/MechanicProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MechanicProfileScreen({ route, navigation }) {
  const { mechanic } = route.params;
  const [reviews, setReviews] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [canReview, setCanReview] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${mechanic._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Write a comment');
      return;
    }

    try {
      const user = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(user);

      const response = await fetch('http://localhost:5000/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        },
        body: JSON.stringify({ mechanicId: mechanic._id, rating, comment })
      });

      if (response.ok) {
        Alert.alert('Success', 'Review submitted!');
        setComment('');
        setRating(5);
        setShowReview(false);
        setCanReview(false);
        loadReviews();
      } else {
        const err = await response.json();
        Alert.alert('Error', err.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed');
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewName}>{item.customerId?.name}</Text>
        <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.avatar}>👨‍🔧</Text>
        <Text style={styles.name}>{mechanic.name}</Text>
        <Text style={styles.rating}>⭐ {mechanic.rating} ({reviews.length})</Text>
        <Text style={styles.score}>Quality Score: {mechanic.qualityScore}%</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {canReview && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowReview(!showReview)}>
              <Text style={styles.addBtnText}>+ Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {showReview && (
          <View style={styles.reviewForm}>
            <Text style={styles.label}>Rating:</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map(r => (
                <TouchableOpacity key={r} onPress={() => setRating(r)} style={[styles.ratingOpt, rating === r && styles.ratingOptSelected]}>
                  <Text>⭐ {r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Your comment..." value={comment} onChangeText={setComment} multiline />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview}>
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList data={reviews} renderItem={renderReview} keyExtractor={i => i._id} scrollEnabled={false} />
      </View>

      <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat')}>
        <Text style={styles.chatBtnText}>💬 Message</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 30, alignItems: 'center', paddingTop: 40 },
  avatar: { fontSize: 60, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  rating: { fontSize: 16, color: '#fff', marginBottom: 5 },
  score: { fontSize: 14, color: '#fff' },
  section: { padding: 20, backgroundColor: '#fff', marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  reviewForm: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  ratingSelector: { flexDirection: 'row', marginBottom: 15, justifyContent: 'space-around' },
  ratingOpt: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0' },
  ratingOptSelected: { backgroundColor: '#FFD700', borderColor: '#FFA500' },
  input: { backgroundColor: '#fff', borderRadius: 6, padding: 10, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 10 },
  submitBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6 },
  submitBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  reviewCard: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewName: { fontSize: 13, fontWeight: '600' },
  reviewRating: { fontSize: 13, color: '#FFB800' },
  reviewComment: { fontSize: 12, color: '#666', lineHeight: 18 },
  chatBtn: { backgroundColor: '#007AFF', margin: 20, padding: 15, borderRadius: 8 },
  chatBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});