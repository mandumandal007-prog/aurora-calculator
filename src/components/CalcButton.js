import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../context/ThemeContext';

/**
 * A single themed calculator key.
 * type: 'number' | 'operator' | 'function' | 'scientific' | 'equals' | 'danger'
 */
export default function CalcButton({ label, type = 'number', onPress, compact = false }) {
  const { colors } = useTheme();

  const look = useMemo(() => {
    switch (type) {
      case 'operator':
        return { gradient: colors.operatorGradient, text: colors.operatorText };
      case 'equals':
        return { gradient: colors.equalsGradient, text: colors.equalsText };
      case 'danger':
        return { gradient: colors.dangerGradient, text: colors.dangerText };
      case 'function':
        return { bg: colors.functionBg, text: colors.functionText };
      case 'scientific':
        return { bg: colors.scientificBg, text: colors.scientificText };
      default:
        return { bg: colors.numberBg, text: colors.numberText };
    }
  }, [type, colors]);

  const handlePress = () => {
    try {
      if (type === 'equals') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'operator' || type === 'danger') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // haptics are best-effort
    }
    if (onPress) onPress(label);
  };

  const fontSize = compact ? 18 : label.length > 2 ? 22 : 28;

  const content = (
    <Text
      style={[styles.label, { color: look.text, fontSize }]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {label}
    </Text>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.wrapper, compact && styles.compactWrapper]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {look.gradient ? (
        <LinearGradient
          colors={look.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.inner, { borderColor: colors.border }]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.inner, { backgroundColor: look.bg, borderColor: colors.border }]}>
          {content}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 6,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  compactWrapper: {
    margin: 5,
    borderRadius: 16,
  },
  inner: {
    flex: 1,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '600',
  },
});
