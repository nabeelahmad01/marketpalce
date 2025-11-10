// screens/QualityScoreScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function QualityScoreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreCard}>
        <Text style={styles.score}>92</Text>
        <Text style={styles.scoreLabel}>Overall Quality Score</Text>
      </View>

      <View style={styles.metricsCard}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Response Time</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '95%' }]} />
          </View>
          <Text style={styles.metricValue}>95/100</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Completion Rate</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '98%' }]} />
          </View>
          <Text style={styles.metricValue}>98/100</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Professionalism</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '88%' }]} />
          </View>
          <Text style={styles.metricValue}>88/100</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Customer Satisfaction</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '92%' }]} />
          </View>
          <Text style={styles.metricValue}>92/100</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scoreCard: { backgroundColor: '#007AFF', padding: 30, alignItems: 'center', paddingTop: 40 },
  score: { fontSize: 60, fontWeight: 'bold', color: '#fff' },
  scoreLabel: { fontSize: 16, color: '#fff', marginTop: 10 },
  metricsCard: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 10 },
  metric: { marginBottom: 20 },
  metricLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  metricBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  metricFill: { height: '100%', backgroundColor: '#007AFF' },
  metricValue: { fontSize: 12, color: '#666', marginTop: 5 }
});