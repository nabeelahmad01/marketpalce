// screens/CustomerHomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';

const CATEGORIES = [
  { id: 1, name: 'Bike Mechanic', icon: '🏍️' },
  { id: 2, name: 'Car Mechanic', icon: '🚗' },
  { id: 3, name: 'Plumber', icon: '🔧' },
  { id: 4, name: 'Electrician', icon: '⚡' },
  { id: 5, name: 'AC & Fridge', icon: '❄️' },
  { id: 6, name: 'General Mart', icon: '🛒' },
  { id: 7, name: 'Carpenter', icon: '🪚' },
  { id: 8, name: 'Painter', icon: '🎨' },
  { id: 9, name: 'General Repair', icon: '🛠️' },
];

export default function CustomerHomeScreen({ navigation }) {
  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ServiceCategory', { category: item })}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What service do you need?</Text>
      </View>
      <FlatList data={CATEGORIES} renderItem={renderCategory} keyExtractor={i => i.id.toString()} numColumns={2} scrollEnabled={false} columnWrapperStyle={styles.row} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  row: { justifyContent: 'space-between', paddingHorizontal: 10 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginVertical: 10, alignItems: 'center' },
  icon: { fontSize: 40, marginBottom: 10 },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'center' }
});