import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  white: '#FFFFFF',
  textPrimary: '#1F2937',
};

const SIZES = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body: 16,
  bodySmall: 14,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,
  radiusSmall: 4,
};

const Header = ({
  title,
  subtitle,
  showBack = false,
  showProfile = false,
  onBackPress,
  onProfilePress,
  rightComponent,
  gradient = true,
  style,
}) => {
  const HeaderContent = () => (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={SIZES.iconLG} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.rightSection}>
        {showProfile && (
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <Ionicons name="person-circle" size={SIZES.iconXL} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {rightComponent}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={[styles.gradientHeader, style]}
      >
        <HeaderContent />
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.header, style]}>
      <HeaderContent />
    </View>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  profileButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  title: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: SIZES.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SIZES.xs,
  },
});

export default Header;
