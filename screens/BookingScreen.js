// screens/BookingScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function BookingScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const dates = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  const times = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

  const handleBook = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Select date and time');
      return;
    }
    Alert.alert('Success', `Booking confirmed for ${selectedDate} at ${selectedTime}`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Select Date</Text>
        <View style={styles.grid}>
          {dates.map(date => (
            <TouchableOpacity
              key={date}
              style={[styles.box, selectedDate === date && styles.boxSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.boxText, selectedDate === date && styles.boxTextSelected]}>{date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Select Time</Text>
        <View style={styles.grid}>
          {times.map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.box, selectedTime === time && styles.boxSelected]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.boxText, selectedTime === time && styles.boxTextSelected]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
        <Text style={styles.bookBtnText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  section: { marginBottom: 30 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  box: { width: '32%', backgroundColor: '#fff', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0' },
  boxSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
  boxText: { fontSize: 12, fontWeight: '600', color: '#333' },
  boxTextSelected: { color: '#007AFF' },
  bookBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});