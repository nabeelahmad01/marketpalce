import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  info: '#3B82F6',
};

export default function AdminDashboardScreen({ navigation }) {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        setAdminData(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('currentUser');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const adminFeatures = [
    {
      id: 1,
      title: 'KYC Approvals',
      subtitle: 'Review and approve KYC submissions',
      icon: 'document-text-outline',
      color: COLORS.primary,
      screen: 'AdminKYCApproval',
      count: '3 Pending',
    },
    {
      id: 2,
      title: 'User Management',
      subtitle: 'Manage customers and mechanics',
      icon: 'people-outline',
      color: COLORS.info,
      screen: null,
      count: '150+ Users',
    },
    {
      id: 3,
      title: 'Service Analytics',
      subtitle: 'View service statistics and reports',
      icon: 'analytics-outline',
      color: COLORS.success,
      screen: null,
      count: '25 Today',
    },
    {
      id: 4,
      title: 'Revenue Reports',
      subtitle: 'Financial reports and earnings',
      icon: 'card-outline',
      color: COLORS.warning,
      screen: null,
      count: 'PKR 45,000',
    },
    {
      id: 5,
      title: 'Support Tickets',
      subtitle: 'Handle customer support requests',
      icon: 'help-circle-outline',
      color: COLORS.error,
      screen: null,
      count: '2 Open',
    },
    {
      id: 6,
      title: 'App Settings',
      subtitle: 'Configure app settings and features',
      icon: 'settings-outline',
      color: COLORS.secondary,
      screen: null,
      count: 'Configure',
    },
  ];

  const handleFeaturePress = (feature) => {
    if (feature.screen) {
      navigation.navigate(feature.screen);
    } else {
      Alert.alert(
        'Coming Soon',
        `${feature.title} feature is under development and will be available in the next update.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={24} color={COLORS.white} />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>
              {adminData?.name || 'Administrator'}
            </Text>
            <Text style={styles.adminRole}>System Administrator</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>150</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="construct" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>Active Services</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Pending KYC</Text>
        </View>
      </View>

      {/* Admin Features */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Admin Features</Text>
        
        <View style={styles.featuresGrid}>
          {adminFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature)}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                <Ionicons name={feature.icon} size={28} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                <View style={styles.featureFooter}>
                  <Text style={[styles.featureCount, { color: feature.color }]}>
                    {feature.count}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('AdminKYCApproval')}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>Review KYC</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: COLORS.success }]}
            onPress={() => Alert.alert('Coming Soon', 'User management feature coming soon!')}
          >
            <Ionicons name="people" size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  adminRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  featuresGrid: {
    marginBottom: 30,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  featureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
  },
  bottomPadding: {
    height: 20,
  },
});
