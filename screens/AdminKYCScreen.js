// screens/AdminKYCScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export default function AdminKYCScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/kyc-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, status) => {
    const statusText = status === 'approved' ? 'approve' : 'reject';
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${statusText} this KYC request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessing(true);
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/admin/kyc-approve`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, status })
              });

              if (response.ok) {
                Alert.alert('Success', `KYC ${status}!`);
                setSelectedRequest(null);
                loadRequests();
              } else {
                Alert.alert('Error', 'Failed to process request');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to process request');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const renderRequest = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedRequest(item)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>📱 {item.phone}</Text>
          <Text style={styles.cnic}>🆔 {item.cnic}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
      
      <Text style={styles.date}>
        Submitted: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => setSelectedRequest(item)}
      >
        <Text style={styles.viewBtnText}>View Details →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KYC Verification</Text>
        <Text style={styles.subtitle}>{requests.length} pending request(s)</Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No pending KYC requests</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={selectedRequest !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>KYC Verification</Text>
                  <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.modalName}>{selectedRequest.name}</Text>
                  <Text style={styles.modalPhone}>📱 {selectedRequest.phone}</Text>
                  <Text style={styles.modalCnic}>🆔 {selectedRequest.cnic}</Text>
                </View>

                <View style={styles.imagesSection}>
                  <Text style={styles.sectionTitle}>CNIC Photo</Text>
                  {selectedRequest.cnicImage ? (
                    <Image
                      source={{ uri: selectedRequest.cnicImage }}
                      style={styles.documentImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.noImage}>No image uploaded</Text>
                  )}

                  <Text style={styles.sectionTitle}>Selfie Photo</Text>
                  {selectedRequest.selfieImage ? (
                    <Image
                      source={{ uri: selectedRequest.selfieImage }}
                      style={styles.documentImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.noImage}>No image uploaded</Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn, processing && styles.actionBtnDisabled]}
                    onPress={() => handleApproval(selectedRequest._id, 'approved')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.actionBtnText}>✓ Approve</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn, processing && styles.actionBtnDisabled]}
                    onPress={() => handleApproval(selectedRequest._id, 'rejected')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.actionBtnText}>✕ Reject</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#E3F2FD', marginTop: 5 },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  phone: { fontSize: 13, color: '#666', marginBottom: 2 },
  cnic: { fontSize: 13, color: '#666' },
  statusBadge: { backgroundColor: '#FFE0B2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start' },
  statusText: { color: '#E65100', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: '#999', marginBottom: 10 },
  viewBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
  viewBtnText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyText: { fontSize: 16, color: '#666' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeBtn: { fontSize: 28, color: '#666' },
  userInfo: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalName: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  modalPhone: { fontSize: 14, color: '#666', marginBottom: 4 },
  modalCnic: { fontSize: 14, color: '#666' },
  imagesSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
  documentImage: { width: '100%', height: 200, backgroundColor: '#F5F5F5', borderRadius: 10, marginBottom: 15 },
  noImage: { padding: 30, textAlign: 'center', color: '#999', backgroundColor: '#F5F5F5', borderRadius: 10 },
  actionButtons: { flexDirection: 'row', padding: 20, gap: 10 },
  actionBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  actionBtnDisabled: { opacity: 0.5 },
  approveBtn: { backgroundColor: '#4CAF50' },
  rejectBtn: { backgroundColor: '#F44336' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
