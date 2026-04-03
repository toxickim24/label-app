/**
 * Status Badge Component
 * Displays lead status with consistent styling based on 6-stage pipeline
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { getStatusBadgeConfig } from '../theme';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
  showDot?: boolean;
}

const StatusBadgeComponent: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showDot = true,
}) => {
  const theme = useTheme();
  const config = getStatusBadgeConfig(status, theme.dark);

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      dot: styles.dotSmall,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      dot: styles.dotMedium,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      dot: styles.dotLarge,
    },
  };

  return (
    <View
      style={[
        styles.container,
        sizeStyles[size].container,
        { backgroundColor: config.bg },
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            sizeStyles[size].dot,
            { backgroundColor: config.dot },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          sizeStyles[size].text,
          { color: config.text },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

export const StatusBadge = memo(StatusBadgeComponent, (prevProps, nextProps) => {
  // Only re-render if props actually change
  return (
    prevProps.status === nextProps.status &&
    prevProps.size === nextProps.size &&
    prevProps.showDot === nextProps.showDot
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999, // Pill shape
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  dot: {
    borderRadius: 999,
  },
  dotSmall: {
    width: 6,
    height: 6,
  },
  dotMedium: {
    width: 8,
    height: 8,
  },
  dotLarge: {
    width: 10,
    height: 10,
  },
  text: {
    fontFamily: 'DMSans_600SemiBold',
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: 11,
    lineHeight: 14,
  },
  textMedium: {
    fontSize: 13,
    lineHeight: 16,
  },
  textLarge: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export default StatusBadge;
