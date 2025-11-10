// screens/WalletScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PACKAGES = [
  { id: 'small', diamonds: 100, price: 500 },
  { id: 'medium', diamonds: 250, price: 1000 },
  { id: 'large', diamonds: 500, price: 2000 },
  { id: 'premium', diamonds: 1000, price: 3500 }
];

export default function WalletScreen({ navigation }) {
  const [diamonds, setDiamonds] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('customer');
  const [kycStatus, setKycStatus] = useState('pending');
  const [kycVerified, setKycVerified] = useState(false);

  useEffect(() => {
    loadDiamonds();
    loadKYCStatus();
  }, []);

  const loadDiamonds = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(user);
      setDiamonds(userData.diamonds || 0);
      setUserType(userData.type || 'customer');
    } catch (error) {
      console.log(error);
    }
  };

  const loadKYCStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(user);
      
      if (userData.type !== 'mechanic') return;

      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        }
      });

      const data = await response.json();
      setKycStatus(data.kycStatus);
      setKycVerified(data.kycVerified);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPkg || !paymentMethod || !phone) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    try {
      const user = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(user);

      const response = await fetch('http://localhost:5000/api/wallet/buy-diamonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': userData.id
        },
        body: JSON.stringify({
          packageName: selectedPkg,
          paymentMethod,
          phoneNumber: phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDiamonds(data.diamonds);
        Alert.alert('Success', 'Diamonds added!');
        setSelectedPkg(null);
        setPaymentMethod(null);
        setPhone('');
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Diamonds</Text>
        <Text style={styles.balance}>{diamonds}</Text>
        <Text style={styles.balanceText}>💎</Text>
      </View>

      {userType === 'mechanic' && !kycVerified && (
        <TouchableOpacity 
          style={styles.kycCard}
          onPress={() => navigation.navigate('KYCVerification')}
        >
          <View style={styles.kycHeader}>
            <Text style={styles.kycIcon}>
              {kycStatus === 'pending' ? '⏳' : kycStatus === 'rejected' ? '❌' : '📝'}
            </Text>
            <View style={styles.kycInfo}>
              <Text style={styles.kycTitle}>
                {kycStatus === 'pending' ? 'KYC Under Review' : 
                 kycStatus === 'rejected' ? 'KYC Rejected' : 'Complete KYC'}
              </Text>
              <Text style={styles.kycText}>
                {kycStatus === 'pending' ? 'Your documents are being verified' : 
                 kycStatus === 'rejected' ? 'Please resubmit your documents' : 
                 'Verify your account to accept jobs'}
              </Text>
            </View>
            <Text style={styles.kycArrow}>→</Text>
          </View>
        </TouchableOpacity>
      )}

      {userType === 'mechanic' && kycVerified && (
        <View style={styles.verifiedCard}>
          <Text style={styles.verifiedIcon}>✅</Text>
          <Text style={styles.verifiedText}>Account Verified</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.title}>Buy Diamonds</Text>
        <View style={styles.packagesGrid}>
          {PACKAGES.map(pkg => (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packageCard, selectedPkg === pkg.id && styles.packageSelected]}
              onPress={() => setSelectedPkg(pkg.id)}
            >
              <Text style={styles.pkgDiamonds}>{pkg.diamonds}</Text>
              <Text style={styles.pkgPrice}>Rs. {pkg.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedPkg && (
        <View style={styles.section}>
          <Text style={styles.title}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.paymentOpt, paymentMethod === 'jazzcash' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('jazzcash')}
          >
            <Text style={styles.paymentText}>📱 JazzCash</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOpt, paymentMethod === 'easypaisa' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('easypaisa')}
          >
            <Text style={styles.paymentText}>📲 Easypaisa</Text>
          </TouchableOpacity>

          {paymentMethod && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase}>
                <Text style={styles.purchaseBtnText}>
                  Purchase Rs. {PACKAGES.find(p => p.id === selectedPkg)?.price}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  balanceCard: { backgroundColor: '#007AFF', margin: 20, padding: 25, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  balanceLabel: { fontSize: 14, color: '#fff' },
  balance: { fontSize: 42, fontWeight: 'bold', color: '#fff', marginVertical: 5 },
  balanceText: { fontSize: 30 },
  kycCard: { backgroundColor: '#FFF3E0', marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#FF9800' },
  kycHeader: { flexDirection: 'row', alignItems: 'center' },
  kycIcon: { fontSize: 30, marginRight: 12 },
  kycInfo: { flex: 1 },
  kycTitle: { fontSize: 16, fontWeight: '600', color: '#E65100', marginBottom: 4 },
  kycText: { fontSize: 13, color: '#EF6C00' },
  kycArrow: { fontSize: 24, color: '#FF9800' },
  verifiedCard: { backgroundColor: '#E8F5E9', marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  verifiedIcon: { fontSize: 24 },
  verifiedText: { fontSize: 16, fontWeight: '600', color: '#2E7D32' },
  section: { padding: 20 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  packagesGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  packageCard: { width: '48%', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0' },
  packageSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
  pkgDiamonds: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  pkgPrice: { fontSize: 14, fontWeight: '600' },
  paymentOpt: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 2, borderColor: '#e0e0e0' },
  paymentSelected: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
  paymentText: { fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  purchaseBtn: { backgroundColor: '#34C759', padding: 15, borderRadius: 8 },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});