/**
 * Lead Detail Screen
 * Shows complete information about a lead with edit capability
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Alert, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  Divider,
  useTheme,
  IconButton,
  List,
  Surface,
  Snackbar,
  TextInput,
  Menu,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLeadsStore } from '../../store';
import { getStatusColor, spacing, borderRadius, shadows } from '../../theme';
import { Lead, LeadStatus } from '../../types';
import SendMessageDialog from '../../components/SendMessageDialog';
import WebContainer from '../../components/WebContainer';
import { useResponsive } from '../../hooks/useResponsive';
import EmptyState from '../../components/EmptyState';

interface LeadDetailScreenProps {
  route: {
    params: {
      leadId: string;
    };
  };
  navigation: any;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string; icon: string }[] = [
  { value: 'new', label: 'New', icon: 'new-box' },
  { value: 'contacted', label: 'Contacted', icon: 'phone-check' },
  { value: 'responded', label: 'Responded', icon: 'message-reply' },
  { value: 'qualified', label: 'Qualified', icon: 'check-circle' },
  { value: 'disqualified', label: 'Disqualified', icon: 'close-circle' },
  { value: 'converted', label: 'Converted', icon: 'trophy' },
  { value: 'invalid', label: 'Invalid', icon: 'alert-circle' },
];

export default function LeadDetailScreen({ route, navigation }: LeadDetailScreenProps) {
  const theme = useTheme();
  const { isMobile, containerPadding } = useResponsive();
  const { leadId } = route.params;
  const leads = useLeadsStore((state) => state.leads);
  const updateLead = useLeadsStore((state) => state.updateLead);
  const lead = leads.find((l) => l.id === leadId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  // Debug logging
  if (lead) {
    console.log('🔍 Lead data:', {
      county: lead.county,
      zipCode: lead.zipCode,
      phoneNumbers: lead.phoneNumbers,
      emails: lead.emails,
    });
  }

  if (!lead) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={theme.colors.error} />
          <Text variant="titleLarge" style={{ marginTop: spacing.md }}>
            Lead not found
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const currentLead = isEditing && editedLead ? editedLead : lead;

  const handleEdit = () => {
    setEditedLead({ ...lead });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedLead(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedLead) return;

    setIsSaving(true);
    try {
      await updateLead(leadId, editedLead);
      setSnackbarMessage('Lead updated successfully');
      setSnackbarVisible(true);
      setIsEditing(false);
      setEditedLead(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update lead';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof Lead, value: any) => {
    if (editedLead) {
      setEditedLead({ ...editedLead, [field]: value });
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    if (editedLead) {
      const newPhones = [...(editedLead.phoneNumbers || [])];
      newPhones[index] = value;
      setEditedLead({ ...editedLead, phoneNumbers: newPhones });
    }
  };

  const updateEmail = (index: number, value: string) => {
    if (editedLead) {
      const newEmails = [...(editedLead.emails || [])];
      newEmails[index] = value;
      setEditedLead({ ...editedLead, emails: newEmails });
    }
  };

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.openURL(phoneUrl);
  };

  const handleSMS = (phone: string) => {
    setMessageType('sms');
    setSelectedRecipient(phone);
    setShowMessageDialog(true);
  };

  const handleEmail = (email: string) => {
    setMessageType('email');
    setSelectedRecipient(email);
    setShowMessageDialog(true);
  };

  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    setSnackbarMessage(`${label} copied to clipboard`);
    setSnackbarVisible(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusOption = (status: LeadStatus) => {
    return STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebContainer maxWidth="lg">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Surface
            style={[styles.header, { backgroundColor: theme.colors.surface }, shadows.sm]}
          >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              {isEditing ? (
                <TextInput
                  value={editedLead?.fullName}
                  onChangeText={(text) => updateField('fullName', text)}
                  mode="outlined"
                  label="Full Name"
                  dense
                  style={{ marginBottom: spacing.xs }}
                />
              ) : (
                <Text variant="headlineSmall" style={styles.leadName}>
                  {currentLead.fullName}
                </Text>
              )}
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                {currentLead.recordId}
              </Text>
            </View>
            <Chip
              mode="flat"
              icon={getStatusOption(currentLead.status).icon}
              style={{
                backgroundColor: getStatusColor(currentLead.status, theme.dark),
              }}
              textStyle={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
            >
              {currentLead.status.toUpperCase()}
            </Chip>
          </View>
          {/* Edit/Save/Cancel Buttons */}
          <View style={styles.editActions}>
            {isEditing ? (
              <>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  disabled={isSaving}
                  style={{ marginRight: spacing.sm }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                  icon="content-save"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button mode="contained-tonal" onPress={handleEdit} icon="pencil">
                Edit Lead
              </Button>
            )}
          </View>
        </Surface>

          {/* Quick Actions */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Quick Actions
            </Text>
            <View style={[styles.actionsContainer, isMobile && styles.actionsContainerMobile]}>
              <Button
                mode="elevated"
                icon="phone"
                onPress={() => handleCall(currentLead.phoneNumbers?.[0] || '')}
                style={[styles.actionButton, isMobile && styles.actionButtonMobile]}
                disabled={!currentLead.phoneNumbers?.[0]}
              >
                Call
              </Button>
              <Button
                mode="elevated"
                icon="message"
                onPress={() => handleSMS(currentLead.phoneNumbers?.[0] || '')}
                style={[styles.actionButton, isMobile && styles.actionButtonMobile]}
                disabled={!currentLead.phoneNumbers?.[0]}
              >
                SMS
              </Button>
              <Button
                mode="elevated"
                icon="email"
                onPress={() => handleEmail(currentLead.emails?.[0] || '')}
                style={[styles.actionButton, isMobile && styles.actionButtonMobile]}
                disabled={!currentLead.emails?.[0]}
              >
                Email
              </Button>
            </View>
          </Surface>

          {/* Contact Information */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Contact Information
            </Text>

            {isEditing ? (
              <>
                <TextInput
                  label="First Name"
                  value={editedLead?.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />
                <TextInput
                  label="Last Name"
                  value={editedLead?.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />
                <TextInput
                  label="Primary Phone"
                  value={editedLead?.phoneNumbers?.[0] || ''}
                  onChangeText={(text) => updatePhoneNumber(0, text)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
                <TextInput
                  label="Secondary Phone"
                  value={editedLead?.phoneNumbers?.[1] || ''}
                  onChangeText={(text) => updatePhoneNumber(1, text)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
                <TextInput
                  label="Tertiary Phone"
                  value={editedLead?.phoneNumbers?.[2] || ''}
                  onChangeText={(text) => updatePhoneNumber(2, text)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
                <TextInput
                  label="Primary Email"
                  value={editedLead?.emails?.[0] || ''}
                  onChangeText={(text) => updateEmail(0, text)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  left={<TextInput.Icon icon="email" />}
                />
                <TextInput
                  label="Secondary Email"
                  value={editedLead?.emails?.[1] || ''}
                  onChangeText={(text) => updateEmail(1, text)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  left={<TextInput.Icon icon="email" />}
                />
                <TextInput
                  label="Tertiary Email"
                  value={editedLead?.emails?.[2] || ''}
                  onChangeText={(text) => updateEmail(2, text)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  left={<TextInput.Icon icon="email" />}
                />

                <Divider style={{ marginVertical: spacing.md }} />

                {/* Status Dropdown */}
                <Text variant="labelLarge" style={{ marginBottom: spacing.xs, marginTop: spacing.sm }}>
                  Lead Status
                </Text>
                <Menu
                  visible={statusMenuVisible}
                  onDismiss={() => setStatusMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setStatusMenuVisible(true)}
                      style={{
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: theme.colors.outline,
                        backgroundColor: theme.colors.surface,
                      }}
                    >
                      <List.Item
                        title={getStatusOption(editedLead?.status || 'new').label}
                        left={(props) => <List.Icon {...props} icon={getStatusOption(editedLead?.status || 'new').icon} />}
                        right={(props) => <List.Icon {...props} icon="chevron-down" />}
                        style={{ paddingVertical: 0 }}
                      />
                    </TouchableOpacity>
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <Menu.Item
                      key={option.value}
                      leadingIcon={option.icon}
                      onPress={() => {
                        updateField('status', option.value);
                        setStatusMenuVisible(false);
                      }}
                      title={option.label}
                      style={{
                        backgroundColor: editedLead?.status === option.value ? theme.colors.surfaceVariant : 'transparent'
                      }}
                    />
                  ))}
                </Menu>
              </>
            ) : (
              <>
                <List.Item
                  title="Primary Phone"
                  description={currentLead.phoneNumbers?.[0] || ''}
                  left={(props) => <List.Icon {...props} icon="phone" />}
                  right={(props) => (
                    <View style={styles.contactActions}>
                      <IconButton icon="phone" size={20} onPress={() => handleCall(currentLead.phoneNumbers?.[0] || '')} />
                      <IconButton icon="message" size={20} onPress={() => handleSMS(currentLead.phoneNumbers?.[0] || '')} />
                      <IconButton icon="content-copy" size={20} onPress={() => handleCopy(currentLead.phoneNumbers?.[0] || '', 'Phone number')} />
                    </View>
                  )}
                />

                {currentLead.phoneNumbers?.[1] && (
                  <List.Item
                    title="Secondary Phone"
                    description={currentLead.phoneNumbers?.[1]}
                    left={(props) => <List.Icon {...props} icon="phone" />}
                    right={(props) => (
                      <View style={styles.contactActions}>
                        <IconButton icon="phone" size={20} onPress={() => handleCall(currentLead.phoneNumbers?.[1]!)} />
                        <IconButton icon="message" size={20} onPress={() => handleSMS(currentLead.phoneNumbers?.[1]!)} />
                        <IconButton icon="content-copy" size={20} onPress={() => handleCopy(currentLead.phoneNumbers?.[1]!, 'Phone number')} />
                      </View>
                    )}
                  />
                )}

                {currentLead.phoneNumbers?.[2] && (
                  <List.Item
                    title="Tertiary Phone"
                    description={currentLead.phoneNumbers?.[2]}
                    left={(props) => <List.Icon {...props} icon="phone" />}
                    right={(props) => (
                      <View style={styles.contactActions}>
                        <IconButton icon="phone" size={20} onPress={() => handleCall(currentLead.phoneNumbers?.[2]!)} />
                        <IconButton icon="message" size={20} onPress={() => handleSMS(currentLead.phoneNumbers?.[2]!)} />
                        <IconButton icon="content-copy" size={20} onPress={() => handleCopy(currentLead.phoneNumbers?.[2]!, 'Phone number')} />
                      </View>
                    )}
                  />
                )}

                <Divider style={styles.divider} />

                <List.Item
                  title="Primary Email"
                  description={currentLead.emails?.[0] || ''}
                  left={(props) => <List.Icon {...props} icon="email" />}
                  right={(props) => (
                    <View style={styles.contactActions}>
                      <IconButton icon="email" size={20} onPress={() => handleEmail(currentLead.emails?.[0] || '')} />
                      <IconButton icon="content-copy" size={20} onPress={() => handleCopy(currentLead.emails?.[0] || '', 'Email address')} />
                    </View>
                  )}
                />

                {currentLead.emails?.[1] && (
                  <List.Item
                    title="Secondary Email"
                    description={currentLead.emails?.[1]}
                    left={(props) => <List.Icon {...props} icon="email" />}
                    right={(props) => (
                      <View style={styles.contactActions}>
                        <IconButton icon="email" size={20} onPress={() => handleEmail(currentLead.emails?.[1]!)} />
                        <IconButton icon="content-copy" size={20} onPress={() => handleCopy(currentLead.emails?.[1]!, 'Email address')} />
                      </View>
                    )}
                  />
                )}

                {currentLead.emails?.[2] && (
                  <List.Item
                    title="Tertiary Email"
                    description={currentLead.emails?.[2]}
                    left={(props) => <List.Icon {...props} icon="email" />}
                    right={(props) => (
                      <View style={styles.contactActions}>
                        <IconButton icon="email" size={20} onPress={() => handleEmail(currentLead.emails?.[2]!)} />
                        <IconButton icon="content-copy" size={20} onPress={() => handleCopy(currentLead.emails?.[2]!, 'Email address')} />
                      </View>
                    )}
                  />
                )}
              </>
            )}
          </Surface>

          {/* Property Information */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Property Information
            </Text>

            {isEditing ? (
              <>
                <TextInput
                  label="Full Address"
                  value={editedLead?.fullAddress}
                  onChangeText={(text) => updateField('fullAddress', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" />}
                />
                <TextInput
                  label="Street"
                  value={editedLead?.street}
                  onChangeText={(text) => updateField('street', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="road" />}
                />
                <TextInput
                  label="City"
                  value={editedLead?.city}
                  onChangeText={(text) => updateField('city', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="city" />}
                />
                <TextInput
                  label="State"
                  value={editedLead?.state}
                  onChangeText={(text) => updateField('state', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="flag" />}
                />
                <TextInput
                  label="ZIP Code"
                  value={editedLead?.zipCode}
                  onChangeText={(text) => updateField('zipCode', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="mailbox" />}
                />
                <TextInput
                  label="County"
                  value={editedLead?.county}
                  onChangeText={(text) => updateField('county', text)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="map" />}
                />
              </>
            ) : (
              <>
                <List.Item
                  title="Full Address"
                  description={currentLead.fullAddress}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
                <List.Item
                  title="Street"
                  description={currentLead.street}
                  left={(props) => <List.Icon {...props} icon="road" />}
                />
                <List.Item
                  title="City"
                  description={currentLead.city}
                  left={(props) => <List.Icon {...props} icon="city" />}
                />
                <List.Item
                  title="State"
                  description={currentLead.state}
                  left={(props) => <List.Icon {...props} icon="flag" />}
                />
                <List.Item
                  title="ZIP Code"
                  description={currentLead.zipCode || 'N/A'}
                  left={(props) => <List.Icon {...props} icon="mailbox" />}
                />
                <List.Item
                  title="County"
                  description={currentLead.county || 'N/A'}
                  left={(props) => <List.Icon {...props} icon="map" />}
                />
              </>
            )}
          </Surface>

          {/* Permit Information */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Permit Information
            </Text>

            <List.Item
              title="Permit Type"
              description={currentLead.permitType.replace(/_/g, ' ').toUpperCase()}
              left={(props) => <List.Icon {...props} icon="file-document" />}
            />
            {currentLead.permitId && (
              <List.Item
                title="Permit ID"
                description={currentLead.permitId}
                left={(props) => <List.Icon {...props} icon="identifier" />}
              />
            )}
          </Surface>

          {/* Communication History */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Communication History
            </Text>

            {currentLead.communications.length > 0 ? (
              currentLead.communications.map((comm, index) => (
                <List.Item
                  key={index}
                  title={comm.type.toUpperCase()}
                  description={`${comm.deliveryStatus} - ${formatDate(comm.sentAt)}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={comm.type === 'sms' ? 'message' : 'email'}
                    />
                  )}
                />
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Icon name="email-off-outline" size={48} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md, textAlign: 'center' }}>
                  No communications yet
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs, textAlign: 'center', opacity: 0.7 }}>
                  Send an SMS or email to start communicating with this lead
                </Text>
              </View>
            )}

            {currentLead.lastContactedAt && (
              <>
                <Divider style={styles.divider} />
                <List.Item
                  title="Last Contacted"
                  description={formatDate(currentLead.lastContactedAt)}
                  left={(props) => <List.Icon {...props} icon="clock" />}
                />
              </>
            )}
          </Surface>

          {/* Notes */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Notes
            </Text>
            {isEditing ? (
              <TextInput
                value={editedLead?.notes}
                onChangeText={(text) => updateField('notes', text)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                left={<TextInput.Icon icon="note-text" />}
              />
            ) : (
              <Text variant="bodyMedium" style={{ marginTop: spacing.sm, color: theme.colors.onSurfaceVariant }}>
                {currentLead.notes || 'No notes'}
              </Text>
            )}
          </Surface>

          {/* Metadata */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline + '20',
              },
              shadows.sm,
            ]}
          >
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Information
            </Text>

            <List.Item
              title="Created Date"
              description={formatDate(currentLead.createdDate)}
              left={(props) => <List.Icon {...props} icon="calendar-plus" />}
            />
            <List.Item
              title="Last Updated"
              description={formatDate(currentLead.lastUpdated)}
              left={(props) => <List.Icon {...props} icon="calendar-edit" />}
            />
            {currentLead.importedAt && (
              <List.Item
                title="Imported At"
                description={formatDate(currentLead.importedAt)}
                left={(props) => <List.Icon {...props} icon="database-import" />}
              />
            )}
            <List.Item
              title="Read Status"
              description={currentLead.isRead ? 'Read' : 'Unread'}
              left={(props) => <List.Icon {...props} icon={currentLead.isRead ? 'eye' : 'eye-off'} />}
            />
            <List.Item
              title="Flagged"
              description={currentLead.isFlagged ? 'Yes' : 'No'}
              left={(props) => <List.Icon {...props} icon={currentLead.isFlagged ? 'flag' : 'flag-outline'} />}
            />
          </Surface>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </WebContainer>

      {/* Send Message Dialog (for template selection and copying) */}
      <SendMessageDialog
        visible={showMessageDialog}
        onDismiss={() => setShowMessageDialog(false)}
        lead={currentLead}
        initialMessageType={messageType}
        initialRecipient={selectedRecipient}
        copyMode={true}
        onSuccess={() => {
          console.log('Message copied successfully');
        }}
      />

      {/* Copy Feedback Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    margin: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  leadName: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionsContainerMobile: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
  },
  actionButtonMobile: {
    width: '100%',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxxl,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
});
