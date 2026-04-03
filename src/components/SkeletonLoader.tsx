/**
 * Skeleton Loader Component
 * Displays animated shimmer effect while content loads
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { darkTheme, lightTheme, spacing, borderRadius } from '../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}) => {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: currentTheme.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface LeadCardSkeletonProps {
  style?: ViewStyle;
}

export const LeadCardSkeleton: React.FC<LeadCardSkeletonProps> = ({ style }) => {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;

  return (
    <View
      style={[
        styles.cardSkeleton,
        {
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <SkeletonLoader width="60%" height={16} />
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>

      {/* Address */}
      <View style={styles.cardRow}>
        <SkeletonLoader width={16} height={16} borderRadius={8} />
        <SkeletonLoader width="70%" height={14} style={{ marginLeft: spacing.xs }} />
      </View>

      {/* Permit Info */}
      <View style={styles.cardRow}>
        <SkeletonLoader width={16} height={16} borderRadius={8} />
        <SkeletonLoader width="50%" height={12} style={{ marginLeft: spacing.xs }} />
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <SkeletonLoader width={70} height={32} borderRadius={borderRadius.sm} />
        <SkeletonLoader width={70} height={32} borderRadius={borderRadius.sm} />
        <SkeletonLoader width={70} height={32} borderRadius={borderRadius.sm} />
      </View>
    </View>
  );
};

interface DashboardSkeletonProps {
  count?: number;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ count = 5 }) => {
  return (
    <View style={styles.dashboardSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <LeadCardSkeleton key={index} style={{ marginBottom: spacing.md }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  cardSkeleton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dashboardSkeleton: {
    padding: spacing.md,
  },
});

export default SkeletonLoader;
