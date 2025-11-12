import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Import theme constants - define inline to avoid import issues
const COLORS = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  secondary: '#EC4899',
  white: '#FFFFFF',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  textPrimary: '#1F2937',
  error: '#EF4444',
};

const SIZES = {
  md: 16,
  lg: 24,
  xl: 32,
  buttonHeight: 48,
  bodySmall: 14,
  body: 16,
  h6: 16,
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  gradient = false,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size variants
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      default:
        baseStyle.push(styles.medium);
    }
    
    // Color variants
    if (!gradient) {
      switch (variant) {
        case 'secondary':
          baseStyle.push(styles.secondary);
          break;
        case 'outline':
          baseStyle.push(styles.outline);
          break;
        case 'ghost':
          baseStyle.push(styles.ghost);
          break;
        case 'danger':
          baseStyle.push(styles.danger);
          break;
        default:
          baseStyle.push(styles.primary);
      }
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return [...baseStyle, style];
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
      default:
        baseStyle.push(styles.textMedium);
    }
    
    switch (variant) {
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      case 'ghost':
        baseStyle.push(styles.textGhost);
        break;
      case 'danger':
        baseStyle.push(styles.textDanger);
        break;
      default:
        baseStyle.push(styles.textPrimary);
    }
    
    return [...baseStyle, textStyle];
  };
  
  const ButtonContent = () => (
    <>
      {loading && <ActivityIndicator color={COLORS.white} style={styles.loader} />}
      {icon && !loading && icon}
      <Text style={getTextStyle()}>{title}</Text>
    </>
  );
  
  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.gradientContainer, style]}
        {...props}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={getButtonStyle()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      {...props}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Size variants
  small: {
    height: 36,
    paddingHorizontal: 16, // 16
  },
  medium: {
    height: 48, // SIZES.buttonHeight
    paddingHorizontal: 24, // SIZES.lg
  },
  large: {
    height: 56,
    paddingHorizontal: 32, // SIZES.xl
  },
  
  // Color variants
  primary: {
    backgroundColor: '#8B5CF6', // COLORS.primary
  },
  secondary: {
    backgroundColor: '#EC4899', // COLORS.secondary
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B5CF6', // COLORS.primary
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#EF4444', // COLORS.error
  },
  disabled: {
    backgroundColor: '#D1D5DB', // COLORS.gray300
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14, // SIZES.bodySmall
  },
  textMedium: {
    fontSize: 16, // SIZES.body
  },
  textLarge: {
    fontSize: 16, // SIZES.h6
  },
  textPrimary: {
    color: '#FFFFFF', // COLORS.white
  },
  textOutline: {
    color: '#8B5CF6', // COLORS.primary
  },
  textGhost: {
    color: '#8B5CF6', // COLORS.primary
  },
  textDanger: {
    color: '#FFFFFF', // COLORS.white
  },
  
  gradientContainer: {
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  loader: {
    marginRight: 8,
  },
});

export default Button;
