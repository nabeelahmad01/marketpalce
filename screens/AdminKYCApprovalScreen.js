import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const STATUS_COLORS = {
  pending: COLORS.warning,
  approved: COLORS.success,
  rejected: COLORS.error,
};

export default function AdminKYCApprovalScreen({ navigation }) {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected, all

  useEffect(() => {
    loadKYCRequests();
  }, []);

  const loadKYCRequests = async () => {
    try {
      // Load real KYC requests from AsyncStorage
      const pendingRequests = await AsyncStorage.getItem('pendingKYCRequests');
      const approvedRequests = await AsyncStorage.getItem('approvedKYCRequests');
      const rejectedRequests = await AsyncStorage.getItem('rejectedKYCRequests');

      let allRequests = [];

      // Add pending requests
      if (pendingRequests) {
        const pending = JSON.parse(pendingRequests);
        allRequests = [...allRequests, ...pending];
      }

      // Add approved requests
      if (approvedRequests) {
        const approved = JSON.parse(approvedRequests);
        allRequests = [...allRequests, ...approved];
      }

      // Add rejected requests
      if (rejectedRequests) {
        const rejected = JSON.parse(rejectedRequests);
        allRequests = [...allRequests, ...rejected];
      }

      // If no real requests, show sample data
      if (allRequests.length === 0) {
        const sampleRequests = [
          {
            id: 'sample_1',
            userId: 'sample_user_001',
            userName: 'Sample User',
            userEmail: 'sample@example.com',
            userPhone: '+92300000000',
            userType: 'customer',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            cnicFront: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=CNIC+Front',
            cnicBack: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=CNIC+Back',
            selfie: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Selfie',
            categories: ['General Service'],
            location: 'Pakistan',
          },
        ];
        allRequests = sampleRequests;
      }

      // Sort by submission date (newest first)
      allRequests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      setKycRequests(allRequests);
    } catch (error) {
      console.error('Error loading KYC requests:', error);
      Alert.alert('Error', 'Failed to load KYC requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadKYCRequests();
  };

  const getFilteredRequests = () => {
    if (activeTab === 'all') return kycRequests;
    return kycRequests.filter(request => request.status === activeTab);
  };

  const handleApprove = async (requestId) => {
    Alert.alert(
      'Approve KYC',
      'Are you sure you want to approve this KYC request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              // Find the request to approve
              const requestToApprove = kycRequests.find(req => req.id === requestId);
              if (!requestToApprove) return;

              // Update request status
              const approvedRequest = {
                ...requestToApprove,
                status: 'approved',
                approvedAt: new Date().toISOString(),
                approvedBy: 'admin_001',
              };

              // Move from pending to approved storage
              const pendingRequests = await AsyncStorage.getItem('pendingKYCRequests');
              if (pendingRequests) {
                const pending = JSON.parse(pendingRequests);
                const updatedPending = pending.filter(req => req.id !== requestId);
                await AsyncStorage.setItem('pendingKYCRequests', JSON.stringify(updatedPending));
              }

              // Add to approved storage
              const approvedRequests = await AsyncStorage.getItem('approvedKYCRequests');
              const approved = approvedRequests ? JSON.parse(approvedRequests) : [];
              approved.push(approvedRequest);
              await AsyncStorage.setItem('approvedKYCRequests', JSON.stringify(approved));

              // Reload requests
              loadKYCRequests();

              Alert.alert('Success', 'KYC request approved successfully');
              setShowDetailModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to approve KYC request');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (requestId) => {
    Alert.prompt(
      'Reject KYC',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || !reason.trim()) {
              Alert.alert('Error', 'Please provide a rejection reason');
              return;
            }

            try {
              // Find the request to reject
              const requestToReject = kycRequests.find(req => req.id === requestId);
              if (!requestToReject) return;

              // Update request status
              const rejectedRequest = {
                ...requestToReject,
                status: 'rejected',
                rejectedAt: new Date().toISOString(),
                rejectedBy: 'admin_001',
                rejectionReason: reason.trim(),
              };

              // Move from pending to rejected storage
              const pendingRequests = await AsyncStorage.getItem('pendingKYCRequests');
              if (pendingRequests) {
                const pending = JSON.parse(pendingRequests);
                const updatedPending = pending.filter(req => req.id !== requestId);
                await AsyncStorage.setItem('pendingKYCRequests', JSON.stringify(updatedPending));
              }

              // Add to rejected storage
              const rejectedRequests = await AsyncStorage.getItem('rejectedKYCRequests');
              const rejected = rejectedRequests ? JSON.parse(rejectedRequests) : [];
              rejected.push(rejectedRequest);
              await AsyncStorage.setItem('rejectedKYCRequests', JSON.stringify(rejected));

              // Reload requests
              loadKYCRequests();

              Alert.alert('Success', 'KYC request rejected');
              setShowDetailModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject KYC request');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderKYCRequest = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.requestHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userEmail}>{item.userEmail}</Text>
            <Text style={styles.userPhone}>{item.userPhone}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}20` }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="construct-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.categories.join(', ')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Submitted {formatDate(item.submittedAt)}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleApprove(item.id);
            }}
          >
            <Ionicons name="checkmark" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleReject(item.id);
            }}
          >
            <Ionicons name="close" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal visible={showDetailModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>KYC Details</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* User Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{selectedRequest.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{selectedRequest.userEmail}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{selectedRequest.userPhone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoValue}>{selectedRequest.userType}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{selectedRequest.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Categories:</Text>
                  <Text style={styles.infoValue}>{selectedRequest.categories.join(', ')}</Text>
                </View>
              </View>
            </View>

            {/* Documents */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Documents</Text>
              
              <View style={styles.documentsGrid}>
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>CNIC Front</Text>
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=CNIC+Front' }} 
                    style={styles.documentImage} 
                  />
                </View>
                
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>CNIC Back</Text>
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=CNIC+Back' }} 
                    style={styles.documentImage} 
                  />
                </View>
                
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>Selfie</Text>
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Selfie' }} 
                    style={[styles.documentImage, styles.selfieImage]} 
                  />
                </View>
              </View>
            </View>

            {/* Status Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[selectedRequest.status]}20` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[selectedRequest.status] }]}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Submitted:</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedRequest.submittedAt)}</Text>
                </View>
                
                {selectedRequest.status === 'approved' && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Approved:</Text>
                      <Text style={styles.infoValue}>{formatDate(selectedRequest.approvedAt)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Approved By:</Text>
                      <Text style={styles.infoValue}>{selectedRequest.approvedBy}</Text>
                    </View>
                  </>
                )}
                
                {selectedRequest.status === 'rejected' && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Rejected:</Text>
                      <Text style={styles.infoValue}>{formatDate(selectedRequest.rejectedAt)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Rejected By:</Text>
                      <Text style={styles.infoValue}>{selectedRequest.rejectedBy}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Reason:</Text>
                      <Text style={styles.infoValue}>{selectedRequest.rejectionReason}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.approveButton]}
                  onPress={() => handleApprove(selectedRequest.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.modalActionText}>Approve KYC</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.rejectButton]}
                  onPress={() => handleReject(selectedRequest.id)}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.white} />
                  <Text style={styles.modalActionText}>Reject KYC</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const TabButton = ({ title, isActive, onPress, count }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const getTabCount = (status) => {
    if (status === 'all') return kycRequests.length;
    return kycRequests.filter(req => req.status === status).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Approvals</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TabButton
            title="Pending"
            isActive={activeTab === 'pending'}
            onPress={() => setActiveTab('pending')}
            count={getTabCount('pending')}
          />
          <TabButton
            title="Approved"
            isActive={activeTab === 'approved'}
            onPress={() => setActiveTab('approved')}
            count={getTabCount('approved')}
          />
          <TabButton
            title="Rejected"
            isActive={activeTab === 'rejected'}
            onPress={() => setActiveTab('rejected')}
            count={getTabCount('rejected')}
          />
          <TabButton
            title="All"
            isActive={activeTab === 'all'}
            onPress={() => setActiveTab('all')}
            count={getTabCount('all')}
          />
        </ScrollView>
      </View>

      {/* KYC Requests List */}
      <FlatList
        data={getFilteredRequests()}
        renderItem={renderKYCRequest}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No KYC requests found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' 
                ? 'No KYC requests have been submitted yet'
                : `No ${activeTab} KYC requests found`
              }
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  refreshButton: {
    padding: 5,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  documentsGrid: {
    gap: 16,
  },
  documentItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  selfieImage: {
    height: 250,
  },
  modalActions: {
    gap: 12,
    marginBottom: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
