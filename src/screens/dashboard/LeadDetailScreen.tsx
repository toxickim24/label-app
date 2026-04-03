/**
 * Lead Detail Screen
 * Shows complete information about a lead with edit capability
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  TextInput,
  Menu,
  Dialog,
  Portal,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import BottomSheetModal, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { useLeadsStore, useAuthStore } from '../../store';
import { getStatusColor, lightTheme, darkTheme, spacing, borderRadius, shadows } from '../../theme';
import { Lead, LeadStatus, StatusChange, Template } from '../../types';
import SendMessageDialog from '../../components/SendMessageDialog';
import WebContainer from '../../components/WebContainer';
import { subscribeToTemplates, incrementTemplateUsage } from '../../services/templatesService';
import { useResponsive } from '../../hooks/useResponsive';
import EmptyState from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { BottomSheet } from '../../components';
import { showToast } from '../../utils/toast';
import { haptics } from '../../utils/haptics';

interface LeadDetailScreenProps {
  route: {
    params: {
      leadId: string;
    };
  };
  navigation: any;
}

// Updated to 6-stage pipeline
const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string; bg: string }[] = [
  { value: 'new', label: 'New', color: '#34d399', bg: '#34d39920' },
  { value: 'contacted', label: 'Contacted', color: '#818cf8', bg: '#818cf820' },
  { value: 'engaged', label: 'Engaged', color: '#fbbf24', bg: '#fbbf2420' },
  { value: 'est_sent', label: 'Est. Sent', color: '#60a5fa', bg: '#60a5fa20' },
  { value: 'appointment', label: 'Appointment', color: '#a78bfa', bg: '#a78bfa20' },
  { value: 'closing', label: 'Closing', color: '#f472b6', bg: '#f472b620' },
];

export default function LeadDetailScreen({ route, navigation }: LeadDetailScreenProps) {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
  const { isMobile, containerPadding } = useResponsive();
  const { leadId } = route.params || {};
  const leads = useLeadsStore((state) => state.leads);
  const updateLead = useLeadsStore((state) => state.updateLead);
  const lead = leadId ? leads.find((l) => l.id === leadId) : null;
  const user = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [recipientType, setRecipientType] = useState<'homeowner' | 'contractor'>('homeowner');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateDialogMode, setTemplateDialogMode] = useState<'homeowner' | 'contractor'>('homeowner');
  const [templates, setTemplates] = useState<Template[]>([]);

  // Bottom sheet refs for mobile
  const noteBottomSheetRef = useRef<BottomSheetModal>(null);
  const templateBottomSheetRef = useRef<BottomSheetModal>(null);

  // Debug logging
  if (lead) {
    console.log('🔍 Lead data:', {
      county: lead.county,
      zipCode: lead.zipCode,
      phoneNumbers: lead.phoneNumbers,
      emails: lead.emails,
    });
  }

  // Subscribe to templates for this lead's permit type
  useEffect(() => {
    if (!lead) return;

    console.log(`🔍 Subscribing to templates for permit type: ${lead.permitType}`);
    const unsubscribe = subscribeToTemplates(lead.permitType, (loadedTemplates) => {
      setTemplates(loadedTemplates);
      console.log(`📋 Loaded ${loadedTemplates.length} templates for ${lead.permitType}:`, loadedTemplates.map(t => ({ id: t.id, name: t.name, category: t.category })));
    });

    return () => unsubscribe();
  }, [lead]);

  if (!lead) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={theme.colors.error} />
          <Text variant="titleLarge" style={{ marginTop: spacing.md }}>
            Lead not found
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
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
      haptics.success();
      showToast.success('Lead updated successfully!');
      setIsEditing(false);
      setEditedLead(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update lead';
      haptics.error();
      showToast.error('Failed to update lead', errorMessage);
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

  const handleSMS = (phone: string, recipient: 'homeowner' | 'contractor' = 'homeowner') => {
    setMessageType('sms');
    setSelectedRecipient(phone);
    setRecipientType(recipient);
    setShowMessageDialog(true);
  };

  const handleEmail = (email: string, recipient: 'homeowner' | 'contractor' = 'homeowner') => {
    setMessageType('email');
    setSelectedRecipient(email);
    setRecipientType(recipient);
    setShowMessageDialog(true);
  };

  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    haptics.light();
    showToast.success('Copied!', `${label} copied to clipboard`);
  };

  const replaceTemplateVariables = (text: string): string => {
    if (!lead) return text;

    // Replace all template variables with actual lead data
    return text
      // Name fields
      .replace(/\{firstName\}/g, lead.firstName || '')
      .replace(/\{lastName\}/g, lead.lastName || '')
      .replace(/\{fullName\}/g, lead.fullName || '')

      // Address fields
      .replace(/\{address\}/g, lead.fullAddress || '')
      .replace(/\{fullAddress\}/g, lead.fullAddress || '')
      .replace(/\{street\}/g, lead.street || '')
      .replace(/\{city\}/g, lead.city || '')
      .replace(/\{state\}/g, lead.state || '')
      .replace(/\{zipCode\}/g, lead.zipCode || '')
      .replace(/\{zip\}/g, lead.zipCode || '')
      .replace(/\{county\}/g, lead.county || '')

      // Contact fields
      .replace(/\{phone\}/g, lead.phoneNumbers?.[0] || '')
      .replace(/\{phoneNumber\}/g, lead.phoneNumbers?.[0] || '')
      .replace(/\{email\}/g, lead.emails?.[0] || '')
      .replace(/\{emailAddress\}/g, lead.emails?.[0] || '')

      // Permit fields
      .replace(/\{permitType\}/g, lead.permitType.replace(/_/g, ' ').replace(/permits/i, '').trim() || '')
      .replace(/\{permitNumber\}/g, lead.permitNumber || '')
      .replace(/\{permitDate\}/g, lead.permitDate ? new Date(lead.permitDate).toLocaleDateString() : '')
      .replace(/\{description\}/g, lead.description || '')

      // Contractor fields
      .replace(/\{contractorName\}/g, lead.licensedName || '')
      .replace(/\{licensedName\}/g, lead.licensedName || '')
      .replace(/\{contractorLicense\}/g, lead.licensedContractorNumber || '')
      .replace(/\{licenseNumber\}/g, lead.licensedContractorNumber || '')
      .replace(/\{contractorPhone\}/g, lead.licensedContact || '')
      .replace(/\{contractorContact\}/g, lead.licensedContact || '');
  };

  const handleCopyTemplate = async (template: Template) => {
    try {
      haptics.light();
      // Replace variables in body and subject
      const populatedBody = replaceTemplateVariables(template.body);
      const populatedSubject = template.subject ? replaceTemplateVariables(template.subject) : '';

      // If email template with subject, combine them
      const textToCopy = template.subject
        ? `Subject: ${populatedSubject}\n\n${populatedBody}`
        : populatedBody;

      await Clipboard.setStringAsync(textToCopy);
      await incrementTemplateUsage(template.id);
      haptics.success();
      showToast.success('Template copied!', `"${template.name}" copied with lead data`);
      if (Platform.OS === 'web') {
        setShowTemplateDialog(false);
      } else {
        templateBottomSheetRef.current?.dismiss();
      }
    } catch (error) {
      console.error('Error copying template:', error);
      haptics.error();
      showToast.error('Failed to copy template', 'Please try again');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusOption = (status: LeadStatus) => {
    return STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      if (Platform.OS === 'web') {
        setShowNoteDialog(false);
      } else {
        noteBottomSheetRef.current?.dismiss();
      }
      setNewNote('');
      return;
    }

    try {
      const timestamp = new Date().toLocaleString();
      const noteWithTimestamp = `[${timestamp}] ${newNote.trim()}`;
      const updatedNotes = lead?.notes
        ? `${lead.notes}\n\n${noteWithTimestamp}`
        : noteWithTimestamp;

      await updateLead(leadId, { notes: updatedNotes });
      haptics.success();
      showToast.success('Note added successfully!');
      if (Platform.OS === 'web') {
        setShowNoteDialog(false);
      } else {
        noteBottomSheetRef.current?.dismiss();
      }
      setNewNote('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add note';
      haptics.error();
      showToast.error('Failed to add note', errorMessage);
    }
  };

  const handleMarkAsContacted = async () => {
    try {
      const now = new Date();

      const updates: any = {
        lastContactedAt: now,
        lastContactedBy: user?.email || 'unknown',
        contactedCount: (lead?.contactedCount || 0) + 1,
      };

      // Auto-advance "new" leads to "contacted" status
      if (lead?.status === 'new') {
        updates.status = 'contacted';

        // Add to status history
        const statusChange: StatusChange = {
          from: 'new',
          to: 'contacted',
          changedAt: now,
          changedBy: user?.email || 'unknown',
        };
        updates.statusHistory = [...(lead.statusHistory || []), statusChange];
      }

      await updateLead(leadId, updates);

      haptics.success();
      showToast.success(
        'Lead marked as contacted!',
        lead?.status === 'new' ? 'Status updated to Contacted' : undefined
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to mark as contacted';
      haptics.error();
      showToast.error('Failed to mark as contacted', errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <WebContainer maxWidth="lg">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.backButtonText, { color: theme.colors.onSurfaceVariant }]}>
              Back to leads
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recordId, { color: theme.colors.onSurfaceVariant }]}>
                  {currentLead.recordId}
                </Text>
                {isEditing ? (
                  <TextInput
                    value={editedLead?.fullName || ''}
                    onChangeText={(text) => updateField('fullName', text)}
                    mode="outlined"
                    label="Full Name"
                    dense
                    style={{ marginTop: spacing.xs }}
                  />
                ) : (
                  <Text style={[styles.leadName, { color: theme.colors.onSurface }]}>
                    {currentLead.fullName || 'Unknown'}
                  </Text>
                )}
                <View style={styles.addressRow}>
                  <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} style={{ marginTop: 1 }} />
                  <Text style={[styles.address, { color: theme.colors.onSurfaceVariant }]}>
                    {currentLead.fullAddress || currentLead.city && currentLead.state
                      ? `${currentLead.city}, ${currentLead.state} ${currentLead.zipCode || ''}`
                      : 'No address'}
                  </Text>
                </View>
              </View>
              <StatusBadge status={currentLead.status} size="medium" />
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
          </View>

          {/* Status Pipeline - 6 Stage Selector */}
          {!isEditing && (
            <View style={styles.statusPipeline}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: currentLead.status === status.value ? status.bg : theme.colors.surface,
                      borderColor: currentLead.status === status.value ? status.color : currentTheme.border,
                    },
                  ]}
                  onPress={async () => {
                    if (!isEditing && currentLead.status !== status.value) {
                      const newStatusChange: StatusChange = {
                        from: currentLead.status,
                        to: status.value,
                        changedAt: new Date(),
                        changedBy: user?.email || 'unknown',
                      };
                      const updatedStatusHistory = [...(currentLead.statusHistory || []), newStatusChange];
                      await updateLead(leadId, {
                        ...currentLead,
                        status: status.value,
                        statusHistory: updatedStatusHistory,
                      });
                      haptics.success();
                      showToast.success('Status updated!', `Changed to ${status.label}`);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      {
                        color: currentLead.status === status.value ? status.color : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}


          {/* Homeowner Section */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: currentTheme.border,
              },
              shadows.sm,
            ]}
          >
            <Text style={[styles.sectionLabel, { color: currentTheme.primary }]}>
              HOMEOWNER
            </Text>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {currentLead.fullName || 'Not found'}
            </Text>

            {/* Name Fields */}
            {isEditing && (
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                <TextInput
                  value={editedLead?.firstName || ''}
                  onChangeText={(text) => updateField('firstName', text)}
                  mode="outlined"
                  label="First Name"
                  dense
                  style={{ flex: 1 }}
                />
                <TextInput
                  value={editedLead?.lastName || ''}
                  onChangeText={(text) => updateField('lastName', text)}
                  mode="outlined"
                  label="Last Name"
                  dense
                  style={{ flex: 1 }}
                />
              </View>
            )}

            {/* Address */}
            {isEditing ? (
              <>
                <TextInput
                  value={editedLead?.fullAddress || ''}
                  onChangeText={(text) => updateField('fullAddress', text)}
                  mode="outlined"
                  label="Full Address"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <TextInput
                    value={editedLead?.city || ''}
                    onChangeText={(text) => updateField('city', text)}
                    mode="outlined"
                    label="City"
                    dense
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    value={editedLead?.state || ''}
                    onChangeText={(text) => updateField('state', text)}
                    mode="outlined"
                    label="State"
                    dense
                    style={{ flex: 1 }}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                  <TextInput
                    value={editedLead?.zipCode || ''}
                    onChangeText={(text) => updateField('zipCode', text)}
                    mode="outlined"
                    label="Zip Code"
                    dense
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    value={editedLead?.county || ''}
                    onChangeText={(text) => updateField('county', text)}
                    mode="outlined"
                    label="County"
                    dense
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            ) : (
              currentLead.fullAddress && (
                <View style={styles.contactItem}>
                  <View style={[styles.contactInfo, { flexDirection: 'row', alignItems: 'flex-start' }]}>
                    <Icon name="map-marker" size={16} color={currentTheme.textSecondary} style={{ marginRight: spacing.xs, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactValue, { color: theme.colors.onSurfaceVariant }]}>
                        {currentLead.fullAddress}
                      </Text>
                      {currentLead.county && (
                        <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }]}>
                          County: {currentLead.county}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: currentTheme.surfaceElevated }]}
                    onPress={() => handleCopy(currentLead.fullAddress, 'Address')}
                  >
                    <Icon name="content-copy" size={16} color={currentTheme.textSecondary} />
                    <Text style={[styles.copyButtonText, { color: currentTheme.textSecondary }]}>Copy</Text>
                  </TouchableOpacity>
                </View>
              )
            )}

            {currentLead.fullName ? (
              <>
                {/* Phone Numbers */}
                {isEditing ? (
                  <>
                    {editedLead?.phoneNumbers?.map((phone, index) => (
                      <TextInput
                        key={`phone-${index}`}
                        value={phone}
                        onChangeText={(text) => updatePhoneNumber(index, text)}
                        mode="outlined"
                        label={`Phone ${index + 1}`}
                        dense
                        style={{ marginBottom: spacing.sm }}
                      />
                    ))}
                  </>
                ) : (
                  currentLead.phoneNumbers?.map((phone, index) => phone && (
                    <View key={`phone-${index}`} style={styles.contactItem}>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactValue, { color: theme.colors.onSurfaceVariant }]}>
                          {phone}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
                          onPress={() => handleCall(phone)}
                        >
                          <Icon name="phone" size={16} color="#FFFFFF" />
                          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
                          onPress={() => handleSMS(phone)}
                        >
                          <Icon name="message-text" size={16} color="#FFFFFF" />
                          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Text</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.copyButton, { backgroundColor: currentTheme.surfaceElevated }]}
                          onPress={() => handleCopy(phone, 'Phone')}
                        >
                          <Icon name="content-copy" size={16} color={currentTheme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}

                {/* Email Addresses */}
                {isEditing ? (
                  <>
                    {editedLead?.emails?.map((email, index) => (
                      <TextInput
                        key={`email-${index}`}
                        value={email}
                        onChangeText={(text) => updateEmail(index, text)}
                        mode="outlined"
                        label={`Email ${index + 1}`}
                        dense
                        style={{ marginBottom: spacing.sm }}
                      />
                    ))}
                  </>
                ) : (
                  currentLead.emails?.map((email, index) => email && (
                    <View key={`email-${index}`} style={styles.contactItem}>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactValue, { color: theme.colors.onSurfaceVariant }]}>
                          {email}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
                          onPress={() => handleEmail(email)}
                        >
                          <Icon name="email" size={16} color="#FFFFFF" />
                          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.copyButton, { backgroundColor: currentTheme.surfaceElevated }]}
                          onPress={() => handleCopy(email, 'Email')}
                        >
                          <Icon name="content-copy" size={16} color={currentTheme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : (
              <Text style={[styles.noDataText, { color: currentTheme.textTertiary }]}>
                No homeowner data found via skip trace
              </Text>
            )}

            {/* Homeowner Template Quick-Copy Section */}
            {!isEditing && templates.filter(t => t.category === 'homeowner_email' || t.category === 'homeowner_text').length > 0 && (
              <>
                <Divider style={{ marginVertical: spacing.md, backgroundColor: currentTheme.border }} />
                <TouchableOpacity
                  style={[styles.templateButton, {
                    backgroundColor: currentTheme.primary + '15',
                    borderColor: currentTheme.primary,
                  }]}
                  onPress={() => {
                    setTemplateDialogMode('homeowner');
                    if (Platform.OS === 'web') {
                      setShowTemplateDialog(true);
                    } else {
                      templateBottomSheetRef.current?.present();
                    }
                  }}
                >
                  <Icon name="text-box-multiple" size={18} color={currentTheme.primary} />
                  <Text style={[styles.templateButtonText, { color: currentTheme.primary }]}>
                    Copy Homeowner Template ({templates.filter(t => t.category === 'homeowner_email' || t.category === 'homeowner_text').length})
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Surface>


          {/* Pool Contractor Section */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: currentTheme.border,
              },
              shadows.sm,
            ]}
          >
            <Text style={[styles.sectionLabel, { color: currentTheme.secondary }]}>
              POOL CONTRACTOR
            </Text>
            {isEditing ? (
              <>
                <TextInput
                  value={editedLead?.licensedName || ''}
                  onChangeText={(text) => updateField('licensedName', text)}
                  mode="outlined"
                  label="Contractor Name"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
                <TextInput
                  value={editedLead?.licensedContractorNumber || ''}
                  onChangeText={(text) => updateField('licensedContractorNumber', text)}
                  mode="outlined"
                  label="License Number"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
                <TextInput
                  value={editedLead?.licensedContact !== undefined ? editedLead.licensedContact : ''}
                  onChangeText={(text) => updateField('licensedContact', text || '')}
                  mode="outlined"
                  label="Contractor Phone"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
                <TextInput
                  value={editedLead?.licensedStreet !== undefined ? editedLead.licensedStreet : ''}
                  onChangeText={(text) => updateField('licensedStreet', text || '')}
                  mode="outlined"
                  label="Contractor Street"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <TextInput
                    value={editedLead?.licensedCity !== undefined ? editedLead.licensedCity : ''}
                    onChangeText={(text) => updateField('licensedCity', text || '')}
                    mode="outlined"
                    label="City"
                    dense
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    value={editedLead?.licensedState !== undefined ? editedLead.licensedState : ''}
                    onChangeText={(text) => updateField('licensedState', text || '')}
                    mode="outlined"
                    label="State"
                    dense
                    style={{ flex: 1 }}
                  />
                </View>
                <TextInput
                  value={editedLead?.licensedZip !== undefined ? editedLead.licensedZip : ''}
                  onChangeText={(text) => updateField('licensedZip', text || '')}
                  mode="outlined"
                  label="Zip Code"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
              </>
            ) : (
              <>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  {currentLead.licensedName || 'Unknown Contractor'}
                </Text>

                {/* Contractor License Number */}
                {currentLead.licensedContractorNumber && (
                  <View style={styles.contactItem}>
                    <View style={styles.contactInfo}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>License #</Text>
                        <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                          {currentLead.licensedContractorNumber}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.copyButton, { backgroundColor: currentTheme.surfaceElevated }]}
                      onPress={() => handleCopy(currentLead.licensedContractorNumber!, 'License number')}
                    >
                      <Icon name="content-copy" size={16} color={currentTheme.textSecondary} />
                      <Text style={[styles.copyButtonText, { color: currentTheme.textSecondary }]}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Contractor Address */}
                {(currentLead.licensedStreet || currentLead.licensedCity) && (
                  <View style={styles.contactItem}>
                    <View style={styles.contactInfo}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Address</Text>
                        <Text style={[styles.contactValue, { color: theme.colors.onSurfaceVariant }]}>
                          {[currentLead.licensedStreet, currentLead.licensedCity, currentLead.licensedState, currentLead.licensedZip]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.copyButton, { backgroundColor: currentTheme.surfaceElevated }]}
                      onPress={() => handleCopy(
                        [currentLead.licensedStreet, currentLead.licensedCity, currentLead.licensedState, currentLead.licensedZip]
                          .filter(Boolean)
                          .join(', '),
                        'Contractor address'
                      )}
                    >
                      <Icon name="content-copy" size={16} color={currentTheme.textSecondary} />
                      <Text style={[styles.copyButtonText, { color: currentTheme.textSecondary }]}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Contractor Phone */}
            {!isEditing && currentLead.licensedContact && (
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactValue, { color: theme.colors.onSurfaceVariant }]}>
                    {currentLead.licensedContact}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: currentTheme.secondary }]}
                    onPress={() => handleCall(currentLead.licensedContact!)}
                  >
                    <Icon name="phone" size={16} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: currentTheme.secondary }]}
                    onPress={() => handleSMS(currentLead.licensedContact!, 'contractor')}
                  >
                    <Icon name="message-text" size={16} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: currentTheme.surfaceElevated }]}
                    onPress={() => handleCopy(currentLead.licensedContact!, 'Contractor phone')}
                  >
                    <Icon name="content-copy" size={16} color={currentTheme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Contractor Template Quick-Copy Section */}
            {!isEditing && templates.filter(t => t.category === 'contractor_email' || t.category === 'contractor_text').length > 0 && (
              <>
                <Divider style={{ marginVertical: spacing.md, backgroundColor: currentTheme.border }} />
                <TouchableOpacity
                  style={[styles.templateButton, {
                    backgroundColor: currentTheme.secondary + '15',
                    borderColor: currentTheme.secondary,
                  }]}
                  onPress={() => {
                    setTemplateDialogMode('contractor');
                    if (Platform.OS === 'web') {
                      setShowTemplateDialog(true);
                    } else {
                      templateBottomSheetRef.current?.present();
                    }
                  }}
                >
                  <Icon name="text-box-multiple" size={18} color={currentTheme.secondary} />
                  <Text style={[styles.templateButtonText, { color: currentTheme.secondary }]}>
                    Copy Contractor Template ({templates.filter(t => t.category === 'contractor_email' || t.category === 'contractor_text').length})
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Surface>

          {/* Permit Details Section */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: currentTheme.border,
              },
              shadows.sm,
            ]}
          >
            <Text style={[styles.sectionLabel, { color: currentTheme.accent }]}>
              PERMIT DETAILS
            </Text>

            {isEditing ? (
              <>
                <TextInput
                  value={editedLead?.permitNumber || ''}
                  onChangeText={(text) => updateField('permitNumber', text)}
                  mode="outlined"
                  label="Permit Number"
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
                <TextInput
                  value={editedLead?.description || ''}
                  onChangeText={(text) => updateField('description', text)}
                  mode="outlined"
                  label="Permit Description"
                  multiline
                  numberOfLines={3}
                  dense
                  style={{ marginBottom: spacing.sm }}
                />
              </>
            ) : (
              <>
                <View style={styles.permitGrid}>
                  {currentLead.permitNumber && (
                    <View style={styles.permitGridItem}>
                      <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Permit #</Text>
                      <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                        {currentLead.permitNumber}
                      </Text>
                    </View>
                  )}
                  <View style={styles.permitGridItem}>
                    <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Type</Text>
                    <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                      {currentLead.permitType.replace(/_/g, ' ').replace(/pool permits/i, 'Pool')}
                    </Text>
                  </View>
                  {currentLead.permitDate && (
                    <View style={styles.permitGridItem}>
                      <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Date</Text>
                      <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                        {new Date(currentLead.permitDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.permitGridItem}>
                    <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>City</Text>
                    <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                      {currentLead.city || 'N/A'}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {!isEditing && currentLead.description && (
              <View style={styles.permitDescription}>
                <Divider style={{ marginVertical: spacing.md, backgroundColor: currentTheme.border }} />
                <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Description</Text>
                <Text style={[styles.permitValue, { color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }]}>
                  {currentLead.description}
                </Text>
              </View>
            )}
          </Surface>

          {/* Activity Timeline */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: currentTheme.border,
              },
              shadows.sm,
            ]}
          >
            <Text style={[styles.sectionLabel, { color: currentTheme.badgeEstSent }]}>
              ACTIVITY
            </Text>

            <View style={styles.timeline}>
              {(() => {
                // Build combined timeline with all events
                const timelineEvents: Array<{
                  type: 'created' | 'status_change' | 'communication';
                  date: Date;
                  data?: any;
                }> = [];

                // Add lead creation
                timelineEvents.push({
                  type: 'created',
                  date: currentLead.createdDate,
                });

                // Add status changes
                (currentLead.statusHistory || []).forEach((statusChange) => {
                  timelineEvents.push({
                    type: 'status_change',
                    date: statusChange.changedAt,
                    data: statusChange,
                  });
                });

                // Add communications
                (currentLead.communications || []).forEach((comm) => {
                  timelineEvents.push({
                    type: 'communication',
                    date: comm.sentAt,
                    data: comm,
                  });
                });

                // Sort by date (newest first)
                timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

                return timelineEvents.map((event, index) => {
                  if (event.type === 'created') {
                    return (
                      <View key={`created-${index}`} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: currentTheme.badgeNew }]} />
                        <View style={styles.timelineContent}>
                          <Text style={[styles.timelineTitle, { color: theme.colors.onSurface }]}>Lead created</Text>
                          <Text style={[styles.timelineDate, { color: theme.colors.onSurfaceVariant }]}>
                            {formatDate(event.date)}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  if (event.type === 'status_change') {
                    const statusChange = event.data as StatusChange;
                    const statusOption = getStatusOption(statusChange.to);
                    return (
                      <View key={`status-${index}`} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: statusOption.color }]} />
                        <View style={styles.timelineContent}>
                          <Text style={[styles.timelineTitle, { color: theme.colors.onSurface }]}>
                            Status changed to {statusOption.label}
                          </Text>
                          <Text style={[styles.timelineDate, { color: theme.colors.onSurfaceVariant }]}>
                            {formatDate(event.date)} • {statusChange.changedBy}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  if (event.type === 'communication') {
                    const comm = event.data;
                    return (
                      <View key={`comm-${index}`} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: currentTheme.accent }]} />
                        <View style={styles.timelineContent}>
                          <Text style={[styles.timelineTitle, { color: theme.colors.onSurface }]}>
                            {comm.type === 'sms' ? 'SMS sent' : 'Email sent'}
                          </Text>
                          <Text style={[styles.timelineDate, { color: theme.colors.onSurfaceVariant }]}>
                            {formatDate(event.date)}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  return null;
                });
              })()}

              {/* Action Buttons */}
              {!isEditing && (
                <View style={styles.activityActions}>
                  <TouchableOpacity
                    style={[styles.activityButton, { backgroundColor: currentTheme.primary, flex: 1 }]}
                    onPress={handleMarkAsContacted}
                  >
                    <Icon name="check-circle" size={16} color="#FFFFFF" />
                    <Text style={[styles.activityButtonText, { color: '#FFFFFF' }]}>Mark as Contacted</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addNoteButton, { borderColor: currentTheme.border, flex: 1 }]}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        setShowNoteDialog(true);
                      } else {
                        noteBottomSheetRef.current?.present();
                      }
                    }}
                  >
                    <Icon name="plus" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.addNoteText, { color: theme.colors.onSurfaceVariant }]}>Add note</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Surface>

          {/* Notes Section - Always visible in edit mode */}
          {(currentLead.notes || isEditing) && (
            <Surface
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.border,
                },
                shadows.sm,
              ]}
            >
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                NOTES
              </Text>
              {isEditing ? (
                <TextInput
                  value={editedLead?.notes || ''}
                  onChangeText={(text) => updateField('notes', text)}
                  mode="outlined"
                  label="Lead Notes"
                  multiline
                  numberOfLines={4}
                  style={{ marginTop: spacing.sm }}
                />
              ) : (
                <Text style={[styles.permitValue, { color: theme.colors.onSurface, marginTop: spacing.sm }]}>
                  {currentLead.notes || 'No notes'}
                </Text>
              )}
            </Surface>
          )}

          {/* Source/Import Info */}
          {(currentLead.source || currentLead.importedAt) && (
            <Surface
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.border,
                },
                shadows.sm,
              ]}
            >
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                SOURCE
              </Text>
              <View style={styles.permitGrid}>
                {currentLead.source && (
                  <View style={styles.permitGridItem}>
                    <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Import Source</Text>
                    <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                      {currentLead.source}
                    </Text>
                  </View>
                )}
                {currentLead.importedAt && (
                  <View style={styles.permitGridItem}>
                    <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Imported</Text>
                    <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                      {formatDate(currentLead.importedAt)}
                    </Text>
                  </View>
                )}
                {currentLead.recordId && (
                  <View style={styles.permitGridItem}>
                    <Text style={[styles.permitLabel, { color: theme.colors.onSurfaceVariant }]}>Record ID</Text>
                    <Text style={[styles.permitValue, { color: theme.colors.onSurface }]}>
                      {currentLead.recordId}
                    </Text>
                  </View>
                )}
              </View>
            </Surface>
          )}

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
        lockMessageType={true}
        recipientType={recipientType}
        onSuccess={() => {
          console.log('Message copied successfully');
        }}
      />

      {/* Add Note Dialog (Web only - Mobile uses BottomSheet) */}
      <Portal>
        <Dialog
          visible={showNoteDialog}
          onDismiss={() => {
            setShowNoteDialog(false);
            setNewNote('');
          }}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Add Note</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Note"
              value={newNote}
              onChangeText={setNewNote}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Enter your note here..."
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowNoteDialog(false);
                setNewNote('');
              }}
            >
              Cancel
            </Button>
            <Button onPress={handleAddNote} mode="contained">
              Save Note
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Template Selection Dialog (Web only - Mobile uses BottomSheet) */}
      <Portal>
        <Dialog
          visible={showTemplateDialog}
          onDismiss={() => setShowTemplateDialog(false)}
          style={{ backgroundColor: theme.colors.surface, maxHeight: '80%' }}
        >
          <Dialog.Title>
            {templateDialogMode === 'homeowner' ? 'Homeowner Templates' : 'Contractor Templates'}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 400 }}>
              {templateDialogMode === 'homeowner' ? (
                <>
                  {/* Homeowner Email Templates */}
                  {templates.filter(t => t.category === 'homeowner_email').length > 0 && (
                    <>
                      <Text style={[styles.templateSectionLabel, { color: currentTheme.primary }]}>
                        EMAIL TEMPLATES
                      </Text>
                      {templates
                        .filter(t => t.category === 'homeowner_email')
                        .map((template) => (
                          <View
                            key={template.id}
                            style={[styles.templateItem, {
                              backgroundColor: currentTheme.surfaceElevated,
                              borderColor: currentTheme.border,
                            }]}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                                {template.name}
                              </Text>
                              {template.subject && (
                                <Text style={[styles.templateSubject, { color: theme.colors.onSurfaceVariant }]}>
                                  Subject: {template.subject}
                                </Text>
                              )}
                              <Text
                                style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                                numberOfLines={2}
                              >
                                {template.body}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                              <TouchableOpacity
                                style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                                onPress={() => {
                                  const populatedBody = replaceTemplateVariables(template.body);
                                  const populatedSubject = template.subject ? replaceTemplateVariables(template.subject) : '';
                                  const primaryEmail = lead?.emails?.[0] || '';
                                  const encodedSubject = encodeURIComponent(populatedSubject);
                                  const encodedBody = encodeURIComponent(populatedBody);
                                  const mailtoURL = `mailto:${primaryEmail}?subject=${encodedSubject}&body=${encodedBody}`;
                                  Linking.openURL(mailtoURL);
                                  if (Platform.OS === 'web') {
                                    setShowTemplateDialog(false);
                                  } else {
                                    templateBottomSheetRef.current?.dismiss();
                                  }
                                }}
                              >
                                <Icon name="email-open-outline" size={18} color={currentTheme.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                                onPress={() => handleCopyTemplate(template)}
                              >
                                <Icon name="content-copy" size={18} color={currentTheme.primary} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                    </>
                  )}

                  {/* Homeowner SMS Templates */}
                  {templates.filter(t => t.category === 'homeowner_text').length > 0 && (
                    <>
                      <Text style={[styles.templateSectionLabel, { color: currentTheme.primary, marginTop: spacing.lg }]}>
                        SMS TEMPLATES
                      </Text>
                      {templates
                        .filter(t => t.category === 'homeowner_text')
                        .map((template) => (
                          <View
                            key={template.id}
                            style={[styles.templateItem, {
                              backgroundColor: currentTheme.surfaceElevated,
                              borderColor: currentTheme.border,
                            }]}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                                {template.name}
                              </Text>
                              <Text
                                style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                                numberOfLines={2}
                              >
                                {template.body}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                              <TouchableOpacity
                                style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                                onPress={() => {
                                  const populatedBody = replaceTemplateVariables(template.body);
                                  const primaryPhone = lead?.phoneNumbers?.[0] || '';
                                  const encodedBody = encodeURIComponent(populatedBody);
                                  const smsURL = Platform.OS === 'ios'
                                    ? `sms:${primaryPhone}&body=${encodedBody}`
                                    : `sms:${primaryPhone}?body=${encodedBody}`;
                                  Linking.openURL(smsURL);
                                  if (Platform.OS === 'web') {
                                    setShowTemplateDialog(false);
                                  } else {
                                    templateBottomSheetRef.current?.dismiss();
                                  }
                                }}
                              >
                                <Icon name="message-text-outline" size={18} color={currentTheme.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                                onPress={() => handleCopyTemplate(template)}
                              >
                                <Icon name="content-copy" size={18} color={currentTheme.primary} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                    </>
                  )}

                  {templates.filter(t => t.category === 'homeowner_email' || t.category === 'homeowner_text').length === 0 && (
                    <Text style={[styles.noTemplatesText, { color: currentTheme.textSecondary }]}>
                      No homeowner templates available.
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {/* Contractor Email Templates */}
                  {templates.filter(t => t.category === 'contractor_email').length > 0 && (
                    <>
                      <Text style={[styles.templateSectionLabel, { color: currentTheme.secondary }]}>
                        EMAIL TEMPLATES
                      </Text>
                      {templates
                        .filter(t => t.category === 'contractor_email')
                        .map((template) => (
                          <TouchableOpacity
                            key={template.id}
                            style={[styles.templateItem, {
                              backgroundColor: currentTheme.surfaceElevated,
                              borderColor: currentTheme.border,
                            }]}
                            onPress={() => handleCopyTemplate(template)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                                {template.name}
                              </Text>
                              {template.subject && (
                                <Text style={[styles.templateSubject, { color: theme.colors.onSurfaceVariant }]}>
                                  Subject: {template.subject}
                                </Text>
                              )}
                              <Text
                                style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                                numberOfLines={2}
                              >
                                {template.body}
                              </Text>
                            </View>
                            <Icon name="content-copy" size={20} color={currentTheme.secondary} />
                          </TouchableOpacity>
                        ))}
                    </>
                  )}

                  {/* Contractor SMS Templates */}
                  {templates.filter(t => t.category === 'contractor_text').length > 0 && (
                    <>
                      <Text style={[styles.templateSectionLabel, { color: currentTheme.secondary, marginTop: spacing.lg }]}>
                        SMS TEMPLATES
                      </Text>
                      {templates
                        .filter(t => t.category === 'contractor_text')
                        .map((template) => (
                          <TouchableOpacity
                            key={template.id}
                            style={[styles.templateItem, {
                              backgroundColor: currentTheme.surfaceElevated,
                              borderColor: currentTheme.border,
                            }]}
                            onPress={() => handleCopyTemplate(template)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                                {template.name}
                              </Text>
                              <Text
                                style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                                numberOfLines={2}
                              >
                                {template.body}
                              </Text>
                            </View>
                            <Icon name="content-copy" size={20} color={currentTheme.secondary} />
                          </TouchableOpacity>
                        ))}
                    </>
                  )}

                  {templates.filter(t => t.category === 'contractor_email' || t.category === 'contractor_text').length === 0 && (
                    <Text style={[styles.noTemplatesText, { color: currentTheme.textSecondary }]}>
                      No contractor templates available.
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTemplateDialog(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Note Bottom Sheet (Mobile only) */}
      {Platform.OS !== 'web' && (
        <BottomSheet
          ref={noteBottomSheetRef}
          title="Add Note"
          snapPoints={['50%']}
        >
          <View style={{ paddingBottom: spacing.xl }}>
            <TextInput
              label="Note"
              value={newNote}
              onChangeText={setNewNote}
              mode="outlined"
              multiline
              numberOfLines={6}
              placeholder="Enter your note here..."
              autoFocus
              style={{ marginBottom: spacing.md }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
              <Button
                onPress={() => {
                  noteBottomSheetRef.current?.dismiss();
                  setNewNote('');
                }}
              >
                Cancel
              </Button>
              <Button onPress={handleAddNote} mode="contained">
                Save Note
              </Button>
            </View>
          </View>
        </BottomSheet>
      )}

      {/* Template Selection Bottom Sheet (Mobile only) */}
      {Platform.OS !== 'web' && (
        <BottomSheet
          ref={templateBottomSheetRef}
          title={templateDialogMode === 'homeowner' ? 'Homeowner Templates' : 'Contractor Templates'}
          snapPoints={['65%', '90%']}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {templateDialogMode === 'homeowner' ? (
              <>
                {/* Homeowner Email Templates */}
                {templates.filter(t => t.category === 'homeowner_email').length > 0 && (
                  <>
                    <Text style={[styles.templateSectionLabel, { color: currentTheme.primary }]}>
                      EMAIL TEMPLATES
                    </Text>
                    {templates
                      .filter(t => t.category === 'homeowner_email')
                      .map((template) => (
                        <View
                          key={template.id}
                          style={[
                            styles.templateItem,
                            {
                              backgroundColor: currentTheme.surface,
                              borderColor: currentTheme.border,
                            },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                              {template.name}
                            </Text>
                            {template.subject && (
                              <Text style={[styles.templateSubject, { color: theme.colors.onSurfaceVariant }]}>
                                Subject: {template.subject}
                              </Text>
                            )}
                            <Text
                              style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                              numberOfLines={2}
                            >
                              {template.body}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                            <TouchableOpacity
                              style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                              onPress={() => {
                                const populatedBody = replaceTemplateVariables(template.body);
                                const populatedSubject = template.subject ? replaceTemplateVariables(template.subject) : '';
                                const primaryEmail = lead?.emails?.[0] || '';
                                const encodedSubject = encodeURIComponent(populatedSubject);
                                const encodedBody = encodeURIComponent(populatedBody);
                                const mailtoURL = `mailto:${primaryEmail}?subject=${encodedSubject}&body=${encodedBody}`;
                                Linking.openURL(mailtoURL);
                                templateBottomSheetRef.current?.dismiss();
                              }}
                            >
                              <Icon name="email-open-outline" size={18} color={currentTheme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                              onPress={() => handleCopyTemplate(template)}
                            >
                              <Icon name="content-copy" size={18} color={currentTheme.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </>
                )}

                {/* Homeowner SMS Templates */}
                {templates.filter(t => t.category === 'homeowner_text').length > 0 && (
                  <>
                    <Text style={[styles.templateSectionLabel, { color: currentTheme.primary, marginTop: spacing.lg }]}>
                      SMS TEMPLATES
                    </Text>
                    {templates
                      .filter(t => t.category === 'homeowner_text')
                      .map((template) => (
                        <View
                          key={template.id}
                          style={[
                            styles.templateItem,
                            {
                              backgroundColor: currentTheme.surface,
                              borderColor: currentTheme.border,
                            },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                              {template.name}
                            </Text>
                            <Text
                              style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                              numberOfLines={2}
                            >
                              {template.body}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                            <TouchableOpacity
                              style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                              onPress={() => {
                                const populatedBody = replaceTemplateVariables(template.body);
                                const primaryPhone = lead?.phoneNumbers?.[0] || '';
                                const encodedBody = encodeURIComponent(populatedBody);
                                const smsURL = Platform.OS === 'ios'
                                  ? `sms:${primaryPhone}&body=${encodedBody}`
                                  : `sms:${primaryPhone}?body=${encodedBody}`;
                                Linking.openURL(smsURL);
                                templateBottomSheetRef.current?.dismiss();
                              }}
                            >
                              <Icon name="message-text-outline" size={18} color={currentTheme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                              onPress={() => handleCopyTemplate(template)}
                            >
                              <Icon name="content-copy" size={18} color={currentTheme.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </>
                )}

                {templates.filter(t => t.category === 'homeowner_email' || t.category === 'homeowner_text').length === 0 && (
                  <Text style={[styles.noTemplatesText, { color: currentTheme.textSecondary }]}>
                    No homeowner templates available.
                  </Text>
                )}
              </>
            ) : (
              <>
                {/* Contractor Email Templates */}
                {templates.filter(t => t.category === 'contractor_email').length > 0 && (
                  <>
                    <Text style={[styles.templateSectionLabel, { color: currentTheme.secondary }]}>
                      EMAIL TEMPLATES
                    </Text>
                    {templates
                      .filter(t => t.category === 'contractor_email')
                      .map((template) => (
                        <TouchableOpacity
                          key={template.id}
                          style={[styles.templateItem, {
                            backgroundColor: currentTheme.surfaceElevated,
                            borderColor: currentTheme.border,
                          }]}
                          onPress={() => handleCopyTemplate(template)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                              {template.name}
                            </Text>
                            {template.subject && (
                              <Text style={[styles.templateSubject, { color: theme.colors.onSurfaceVariant }]}>
                                Subject: {template.subject}
                              </Text>
                            )}
                            <Text
                              style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                              numberOfLines={2}
                            >
                              {template.body}
                            </Text>
                          </View>
                          <Icon name="content-copy" size={20} color={currentTheme.secondary} />
                        </TouchableOpacity>
                      ))}
                  </>
                )}

                {/* Contractor SMS Templates */}
                {templates.filter(t => t.category === 'contractor_text').length > 0 && (
                  <>
                    <Text style={[styles.templateSectionLabel, { color: currentTheme.secondary, marginTop: spacing.lg }]}>
                      SMS TEMPLATES
                    </Text>
                    {templates
                      .filter(t => t.category === 'contractor_text')
                      .map((template) => (
                        <TouchableOpacity
                          key={template.id}
                          style={[styles.templateItem, {
                            backgroundColor: currentTheme.surfaceElevated,
                            borderColor: currentTheme.border,
                          }]}
                          onPress={() => handleCopyTemplate(template)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>
                              {template.name}
                            </Text>
                            <Text
                              style={[styles.templatePreview, { color: currentTheme.textSecondary }]}
                              numberOfLines={2}
                            >
                              {template.body}
                            </Text>
                          </View>
                          <Icon name="content-copy" size={20} color={currentTheme.secondary} />
                        </TouchableOpacity>
                      ))}
                  </>
                )}

                {templates.filter(t => t.category === 'contractor_email' || t.category === 'contractor_text').length === 0 && (
                  <Text style={[styles.noTemplatesText, { color: currentTheme.textSecondary }]}>
                    No contractor templates available.
                  </Text>
                )}
              </>
            )}
          </ScrollView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  backButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  headerSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  recordId: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  leadName: {
    fontFamily: 'DMSans_800ExtraBold',
    fontSize: 24,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  address: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statusPipeline: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  statusButton: {
    flex: 1,
    minWidth: 90,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  card: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  contactValue: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  copyButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  noDataText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  permitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  permitGridItem: {
    flex: 1,
    minWidth: '30%',
  },
  permitLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  permitValue: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  permitDescription: {
    marginTop: spacing.md,
  },
  timeline: {
    gap: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  timelineDate: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
  },
  activityActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  activityButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addNoteText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,                    // Larger gap
  },
  contactDescription: {
    flexWrap: 'nowrap',
    overflow: 'visible',
  },
  contactItemMobile: {
    paddingVertical: spacing.lg,        // More padding
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,           // More space
  },
  contactActionsMobile: {
    flexDirection: 'row',
    gap: spacing.md,                    // Larger gap
    marginLeft: 40,
  },
  divider: {
    marginVertical: spacing.xl,         // More space
  },
  input: {
    marginBottom: spacing.lg,           // More space
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
    paddingVertical: spacing.xxxxl,     // More padding
    paddingHorizontal: spacing.xxl,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  templateButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  templateSectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  templateName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  templateSubject: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  templatePreview: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  templateActionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTemplatesText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
