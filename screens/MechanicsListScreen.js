// screens/MechanicsListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MechanicsListScreen({ route, navigation }) {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMechanics();
  }, []);

  const loadMechanics = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/mechanics/by-category?category=${route.params?.category}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMechanics(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderMechanic = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MechanicProfile', { mechanic: item })}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.score}>Quality: {item.qualityScore}%</Text>
      <Text style={styles.reviews}>{item.totalReviews} reviews • {item.jobsCompleted} jobs</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <FlatList data={mechanics} renderItem={renderMechanic} keyExtractor={i => i._id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  rating: { fontSize: 14, color: '#FFB800' },
  score: { fontSize: 13, color: '#007AFF', marginBottom: 5 },
  reviews: { fontSize: 12, color: '#999' }
});