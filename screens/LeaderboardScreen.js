// screens/LeaderboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeaderboardScreen() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/mechanics/leaderboard', {
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

  const renderMechanic = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.rank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>⭐ {item.rating} • {item.totalReviews} reviews • {item.jobsCompleted} jobs</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Quality: {item.qualityScore}%</Text>
        </View>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Top Mechanics</Text>
      </View>
      <FlatList data={mechanics} renderItem={renderMechanic} keyExtractor={i => i._id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FFD700', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', margin: 10, borderRadius: 10, flexDirection: 'row', padding: 15, alignItems: 'center' },
  rank: { backgroundColor: '#FFD700', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rankNumber: { fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 3 },
  details: { fontSize: 12, color: '#666', marginBottom: 5 },
  badge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, color: '#007AFF', fontWeight: '600' }
});