/**
 * Lead Card Component
 * Displays lead information with status badge and stale warning
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Lead } from '../types';
import { StatusBadge } from './StatusBadge';
import { darkTheme, lightTheme, spacing, borderRadius, shadows } from '../theme';
import { isLeadStale } from '../utils/leadUtils';

interface LeadCardProps {
  lead: Lead;
  onPress: () => void;
  onQuickAction?: (action: 'call' | 'message' | 'email' | 'template', phone?: string, email?: string) => void;
}

const LeadCardComponent: React.FC<LeadCardProps> = ({
  lead,
  onPress,
  onQuickAction,
}) => {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
  const stale = isLeadStale(lead);
  const primaryPhone = lead.phoneNumbers?.[0] || '';
  const primaryEmail = lead.emails?.[0] || '';

  // Determine priority color for left border
  const getPriorityColor = () => {
    if (stale) return currentTheme.coral; // Stale leads = coral/red
    switch (lead.status) {
      case 'new':
        return currentTheme.badgeNew; // Green for new leads
      case 'est_sent':
      case 'appointment':
        return currentTheme.badgeEstSent; // Blue for hot leads
      case 'closing':
        return currentTheme.accent; // Amber for closing
      default:
        return 'transparent'; // No border for others
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
          borderLeftColor: getPriorityColor(),
          borderLeftWidth: getPriorityColor() !== 'transparent' ? 4 : 1,
        },
        pressed && styles.containerPressed,
      ]}
    >
      {/* Stale Lead Warning Banner */}
      {stale && (
        <View style={[styles.staleWarning, { backgroundColor: currentTheme.coral }]}>
          <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#fff" />
          <Text style={styles.staleWarningText}>
            Needs attention • No contact in 48+ hours
          </Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.content}>
        {/* Header Row: Name + Status */}
        <View style={styles.header}>
          <Text style={[styles.name, { color: currentTheme.text }]} numberOfLines={1}>
            {lead.fullName || 'Unknown'}
          </Text>
          <StatusBadge status={lead.status} size="small" />
        </View>

        {/* Address */}
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={currentTheme.textSecondary}
          />
          <Text style={[styles.address, { color: currentTheme.textSecondary }]} numberOfLines={1}>
            {lead.city && lead.state
              ? `${lead.city}, ${lead.state}`
              : lead.fullAddress || 'No address'}
          </Text>
        </View>

        {/* Permit Info */}
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={16}
            color={currentTheme.textSecondary}
          />
          <Text style={[styles.permitInfo, { color: currentTheme.textTertiary }]} numberOfLines={1}>
            {lead.permitNumber || 'No permit #'}
            {lead.permitDate && ` • ${new Date(lead.permitDate).toLocaleDateString()}`}
          </Text>
        </View>

        {/* Quick Actions */}
        {(primaryPhone || primaryEmail) && (
          <View style={styles.actions}>
            {primaryPhone && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: currentTheme.primary + '15' }]}
                  onPress={() => {
                    Linking.openURL(`tel:${primaryPhone}`);
                  }}
                >
                  <MaterialCommunityIcons name="phone-outline" size={16} color={currentTheme.primary} />
                  <Text style={[styles.actionText, { color: currentTheme.primary }]}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: currentTheme.primary + '15' }]}
                  onPress={() => {
                    Linking.openURL(`sms:${primaryPhone}`);
                  }}
                >
                  <MaterialCommunityIcons name="message-outline" size={16} color={currentTheme.primary} />
                  <Text style={[styles.actionText, { color: currentTheme.primary }]}>Text</Text>
                </TouchableOpacity>
              </>
            )}
            {primaryEmail && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: currentTheme.primary + '15' }]}
                onPress={() => {
                  Linking.openURL(`mailto:${primaryEmail}`);
                }}
              >
                <MaterialCommunityIcons name="email-outline" size={16} color={currentTheme.primary} />
                <Text style={[styles.actionText, { color: currentTheme.primary }]}>Email</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: currentTheme.accent + '15' }]}
              onPress={(e) => {
                e.stopPropagation();
                onQuickAction?.('template', primaryPhone, primaryEmail);
              }}
            >
              <MaterialCommunityIcons name="text-box-multiple-outline" size={16} color={currentTheme.accent} />
              <Text style={[styles.actionText, { color: currentTheme.accent }]}>Template</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export const LeadCard = memo(LeadCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if lead data or handlers change
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.status === nextProps.lead.status &&
    prevProps.lead.fullName === nextProps.lead.fullName &&
    prevProps.lead.lastContactedAt === nextProps.lead.lastContactedAt &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onQuickAction === nextProps.onQuickAction
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    ...shadows.sm,
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  staleWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  staleWarningText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: '#fff',
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  address: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    flex: 1,
  },
  permitInfo: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
});

export default LeadCard;
