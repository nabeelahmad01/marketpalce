// screens/MyJobsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const MOCK_JOBS = [
  { id: '1', customer: 'Ahmed Ali', category: 'Car Mechanic', status: 'completed', earnings: 5000 },
  { id: '2', customer: 'Hassan Khan', category: 'Bike Mechanic', status: 'in-progress', earnings: 3000 },
];

export default function MyJobsScreen() {
  const renderJob = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.customer}>{item.customer}</Text>
        <Text style={[styles.status, item.status === 'completed' && styles.statusCompleted]}>{item.status}</Text>
      </View>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.earnings}>Earnings: Rs. {item.earnings}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
      </View>
      <FlatList data={MOCK_JOBS} renderItem={renderJob} keyExtractor={i => i.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#fff', margin: 10, borderRadius: 10, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customer: { fontSize: 16, fontWeight: '600' },
  status: { backgroundColor: '#FFC107', color: '#fff', paddingHorizontal: 8, borderRadius: 4, fontSize: 12 },
  statusCompleted: { backgroundColor: '#4CAF50' },
  category: { fontSize: 13, color: '#007AFF', marginBottom: 5 },
  earnings: { fontSize: 14, fontWeight: '600', color: '#2E7D32' }
});