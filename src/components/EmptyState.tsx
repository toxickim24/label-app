/**
 * EmptyState Component
 * Premium empty state design for modern SaaS aesthetic
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { spacing, borderRadius, shadows, typography } from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
  compact = false,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          ...shadows.sm,
        },
        compact && styles.compact,
        style,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.dark
              ? 'rgba(10, 132, 255, 0.12)'
              : 'rgba(0, 122, 255, 0.08)',
          },
        ]}
      >
        <Icon
          name={icon}
          size={compact ? 48 : 64}
          color={theme.colors.primary}
        />
      </View>

      <Text
        variant="headlineSmall"
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
            ...typography.h2,
          },
          compact && styles.titleCompact,
        ]}
      >
        {title}
      </Text>

      <Text
        variant="bodyMedium"
        style={[
          styles.description,
          {
            color: theme.colors.onSurfaceVariant,
            ...typography.body,
          },
        ]}
      >
        {description}
      </Text>

      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {actionLabel}
        </Button>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxxl,
    borderRadius: borderRadius.lg,
    maxWidth: 440,
    alignSelf: 'center',
    marginVertical: spacing.xxxl,
  },
  compact: {
    padding: spacing.xxxl,
    maxWidth: 380,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  titleCompact: {
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    maxWidth: 340,
  },
  button: {
    marginTop: spacing.md,
    minWidth: 180,
  },
  buttonContent: {
    height: 44,
    paddingHorizontal: spacing.xl,
  },
});
