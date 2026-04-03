/**
 * EmptyState Component
 * Enhanced empty state design with educational content and actionable CTAs
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Text, Button, Surface, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { spacing, borderRadius, shadows, typography } from '../theme';
import { lightTheme, darkTheme } from '../theme';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  icon?: string;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;

  // Actions
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;

  // Educational content
  tips?: string[];
  helpText?: string;

  // Sample data / preview
  sampleItems?: string[];

  // Styling
  style?: ViewStyle;
  compact?: boolean;
  variant?: 'default' | 'minimal' | 'educational';
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tips,
  helpText,
  sampleItems,
  style,
  compact = false,
  variant = 'default',
}: EmptyStateProps) {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;

  const isMinimal = variant === 'minimal';
  const isEducational = variant === 'educational';

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          ...shadows.sm,
        },
        compact && styles.compact,
        isMinimal && styles.minimal,
        style,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.dark
              ? 'rgba(10, 132, 255, 0.12)'
              : 'rgba(0, 122, 255, 0.08)',
          },
          isMinimal && styles.iconContainerMinimal,
        ]}
      >
        <Icon
          name={icon}
          size={compact ? 48 : isMinimal ? 56 : 64}
          color={theme.colors.primary}
        />
      </View>

      {/* Title */}
      <Text
        variant="headlineSmall"
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
            fontFamily: 'DMSans_700Bold',
          },
          compact && styles.titleCompact,
          isMinimal && styles.titleMinimal,
        ]}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        variant="bodyMedium"
        style={[
          styles.description,
          {
            color: theme.colors.onSurfaceVariant,
            fontFamily: 'DMSans_400Regular',
          },
          isMinimal && styles.descriptionMinimal,
        ]}
      >
        {description}
      </Text>

      {/* Educational Tips */}
      {tips && tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text
            style={[
              styles.tipsTitle,
              {
                color: currentTheme.textSecondary,
                fontFamily: 'DMSans_600SemiBold',
              },
            ]}
          >
            Quick Tips:
          </Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Icon
                name="lightbulb-outline"
                size={16}
                color={currentTheme.primary}
                style={styles.tipIcon}
              />
              <Text
                style={[
                  styles.tipText,
                  {
                    color: currentTheme.textSecondary,
                    fontFamily: 'DMSans_400Regular',
                  },
                ]}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Sample Items Preview */}
      {sampleItems && sampleItems.length > 0 && (
        <View style={styles.sampleContainer}>
          <Text
            style={[
              styles.sampleTitle,
              {
                color: currentTheme.textSecondary,
                fontFamily: 'DMSans_600SemiBold',
              },
            ]}
          >
            Examples:
          </Text>
          <View style={styles.sampleChips}>
            {sampleItems.map((item, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={[
                  styles.sampleChip,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: currentTheme.border,
                  },
                ]}
                textStyle={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 12,
                  color: currentTheme.textSecondary,
                }}
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {/* Help Text */}
      {helpText && (
        <View
          style={[
            styles.helpContainer,
            {
              backgroundColor: theme.dark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
              borderColor: currentTheme.border,
            },
          ]}
        >
          <Icon
            name="information-outline"
            size={16}
            color={currentTheme.textSecondary}
            style={styles.helpIcon}
          />
          <Text
            style={[
              styles.helpText,
              {
                color: currentTheme.textSecondary,
                fontFamily: 'DMSans_400Regular',
              },
            ]}
          >
            {helpText}
          </Text>
        </View>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {primaryAction && (
            <Button
              mode={primaryAction.mode || 'contained'}
              onPress={primaryAction.onPress}
              style={[styles.button, styles.primaryButton]}
              contentStyle={styles.buttonContent}
              icon={primaryAction.icon}
              labelStyle={{ fontFamily: 'DMSans_600SemiBold' }}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              mode={secondaryAction.mode || 'outlined'}
              onPress={secondaryAction.onPress}
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon={secondaryAction.icon}
              labelStyle={{ fontFamily: 'DMSans_600SemiBold' }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </View>
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
    maxWidth: 480,
    alignSelf: 'center',
    marginVertical: spacing.xxxl,
  },
  compact: {
    padding: spacing.xxxl,
    maxWidth: 380,
  },
  minimal: {
    padding: spacing.xxl,
    maxWidth: 340,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconContainerMinimal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
  },
  titleCompact: {
    marginBottom: spacing.sm,
    fontSize: 20,
  },
  titleMinimal: {
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    maxWidth: 380,
    fontSize: 15,
  },
  descriptionMinimal: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  tipsContainer: {
    width: '100%',
    maxWidth: 380,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: 13,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textAlign: 'left',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  tipIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  sampleContainer: {
    width: '100%',
    maxWidth: 380,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sampleTitle: {
    fontSize: 13,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textAlign: 'left',
  },
  sampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sampleChip: {
    marginRight: 0,
    height: 28,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    maxWidth: 380,
  },
  helpIcon: {
    marginRight: spacing.xs,
    marginTop: 1,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    minWidth: 140,
  },
  primaryButton: {
    minWidth: 160,
  },
  buttonContent: {
    height: 44,
    paddingHorizontal: spacing.lg,
  },
});
