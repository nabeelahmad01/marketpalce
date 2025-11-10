// screens/AnalyticsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Month</Text>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Jobs Completed</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Earnings</Text>
          <Text style={styles.statValue}>Rs. 45,000</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Avg Rating</Text>
          <Text style={styles.statValue}>4.8 ⭐</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Response Time</Text>
          <Text style={styles.statValue}>2 mins</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance</Text>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Completion Rate</Text>
          <Text style={styles.statValue}>98%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Quality Score</Text>
          <Text style={styles.statValue}>92/100</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  stat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  statLabel: { fontSize: 14, color: '#666' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' }
});