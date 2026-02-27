/**
 * InfoPanel Component
 * Professional info panel for displaying structured information
 * Used for displaying available variables, metadata, etc.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { Text, Surface, Chip, useTheme, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { spacing, borderRadius, shadows, typography } from '../theme';

interface InfoPanelSection {
  title: string;
  items: Array<{ label: string; value?: string; isVariable?: boolean }>;
}

interface InfoPanelProps {
  icon?: string;
  title: string;
  subtitle?: string;
  sections?: InfoPanelSection[];
  metadata?: Array<{ label: string; value: string }>;
  style?: ViewStyle;
  scrollable?: boolean;
}

export default function InfoPanel({
  icon,
  title,
  subtitle,
  sections,
  metadata,
  style,
  scrollable = false,
}: InfoPanelProps) {
  const theme = useTheme();

  const renderContent = () => (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: theme.dark ? theme.colors.surfaceVariant : theme.colors.surface,
          borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
        shadows.sm,
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        {icon && (
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
            <Icon name={icon} size={20} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.headerText}>
          <Text
            variant="titleMedium"
            style={[
              styles.title,
              {
                color: theme.colors.onSurface,
                ...typography.h3,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodySmall"
              style={[
                styles.subtitle,
                {
                  color: theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Sections */}
      {sections && sections.length > 0 && (
        <View style={styles.sections}>
          {sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text
                variant="labelMedium"
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.onSurfaceVariant,
                    ...typography.overline,
                  },
                ]}
              >
                {section.title}
              </Text>
              <View style={styles.itemsContainer}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.item}>
                    {item.isVariable ? (
                      <Chip
                        mode="flat"
                        textStyle={styles.variableText}
                        style={[
                          styles.variableChip,
                          {
                            backgroundColor: theme.dark
                              ? 'rgba(10, 132, 255, 0.15)'
                              : 'rgba(0, 122, 255, 0.1)',
                          },
                        ]}
                      >
                        {item.label}
                      </Chip>
                    ) : (
                      <View style={styles.metadataRow}>
                        <Text
                          variant="bodySmall"
                          style={[
                            styles.metadataLabel,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {item.label}:
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={[
                            styles.metadataValue,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {item.value}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
              {sectionIndex < sections.length - 1 && (
                <Divider style={styles.sectionDivider} />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <View style={styles.metadata}>
          <Divider style={styles.metadataDivider} />
          {metadata.map((item, index) => (
            <View key={index} style={styles.metadataRow}>
              <Text
                variant="bodySmall"
                style={[styles.metadataLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                {item.label}:
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.metadataValue, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Surface>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    );
  }

  return renderContent();
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 18,
  },
  sections: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    marginBottom: spacing.sm,
  },
  variableChip: {
    height: 32,
  },
  variableText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionDivider: {
    marginTop: spacing.lg,
  },
  metadata: {
    marginTop: spacing.lg,
  },
  metadataDivider: {
    marginBottom: spacing.lg,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metadataLabel: {
    fontWeight: '600',
    marginRight: spacing.md,
  },
  metadataValue: {
    flex: 1,
    textAlign: 'right',
  },
});
