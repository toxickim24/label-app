/**
 * Send Message Dialog
 * Allows sending SMS or Email to a lead
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, TouchableOpacity, Linking } from 'react-native';
import {
  Dialog,
  Portal,
  Text,
  Button,
  TextInput,
  Chip,
  useTheme,
  SegmentedButtons,
  List,
  Divider,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Lead, Template } from '../types';
import { spacing, borderRadius, shadows, darkTheme, lightTheme } from '../theme';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import EmptyState from './EmptyState';
import axios from 'axios';
import { subscribeToTemplates } from '../services/templatesService';
import { replaceTemplateVariables } from '../utils/templateVariables';

interface SendMessageDialogProps {
  visible: boolean;
  onDismiss: () => void;
  lead: Lead;
  initialMessageType?: 'sms' | 'email';
  initialRecipient?: string;
  copyMode?: boolean;
  onSuccess?: () => void;
  lockMessageType?: boolean; // If true, hide message type selector
  recipientType?: 'homeowner' | 'contractor'; // Filter templates by recipient type
}

export default function SendMessageDialog({
  visible,
  onDismiss,
  lead,
  initialMessageType = 'sms',
  initialRecipient,
  copyMode = false,
  onSuccess,
  lockMessageType = false,
  recipientType = 'homeowner',
}: SendMessageDialogProps) {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
  const [messageType, setMessageType] = useState<'sms' | 'email'>(initialMessageType);

  // Debug: Log API config status
  useEffect(() => {
    if (visible) {
      console.log('=== API CONFIG DEBUG ===');
      console.log('Twilio SID:', API_CONFIG.TWILIO_ACCOUNT_SID ? 'CONFIGURED' : 'MISSING');
      console.log('Twilio Token:', API_CONFIG.TWILIO_AUTH_TOKEN ? 'CONFIGURED' : 'MISSING');
      console.log('Twilio Phone:', API_CONFIG.TWILIO_PHONE_NUMBER ? 'CONFIGURED' : 'MISSING');
      console.log('SendGrid Key:', API_CONFIG.SENDGRID_API_KEY ? 'CONFIGURED' : 'MISSING');
      console.log('=======================');
    }
  }, [visible]);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Subscribe to templates from Firestore
  useEffect(() => {
    if (visible) {
      console.log('📡 Subscribing to templates for permit type:', lead.permitType);
      const unsubscribe = subscribeToTemplates(lead.permitType, (fetchedTemplates) => {
        console.log(`✅ Loaded ${fetchedTemplates.length} templates for ${lead.permitType}`);
        console.log('Templates:', fetchedTemplates.map(t => ({ name: t.name, category: t.category, isActive: t.isActive })));
        setTemplates(fetchedTemplates);
      });
      return () => {
        console.log('🔌 Unsubscribing from templates');
        unsubscribe();
      };
    } else {
      // Clear templates when dialog closes
      setTemplates([]);
    }
  }, [visible, lead.permitType]);

  // Get templates for this permit type, message type, and recipient type
  const availableTemplates = templates.filter(
    (t) =>
      t.isActive &&
      t.category.includes(recipientType) && // Filter by homeowner or contractor
      (messageType === 'email'
        ? t.category.includes('email')
        : t.category.includes('text'))
  );

  console.log('🔍 Template filtering:', {
    messageType,
    totalTemplates: templates.length,
    availableTemplates: availableTemplates.length,
    templateCategories: templates.map(t => t.category)
  });

  // Sync message type with initial prop when dialog opens
  useEffect(() => {
    if (visible) {
      setMessageType(initialMessageType);
    }
  }, [visible, initialMessageType]);

  // Set default recipient when dialog opens or message type changes
  useEffect(() => {
    if (visible) {
      // Use initialRecipient if provided, otherwise fall back to primary contact
      if (initialRecipient) {
        setRecipient(initialRecipient);
      } else if (messageType === 'email') {
        setRecipient(lead.email1);
      } else {
        setRecipient(lead.phone1);
      }
    }
  }, [visible, messageType, lead, initialRecipient]);

  const applyTemplate = (template: Template) => {
    // Replace template variables using the utility function
    const content = replaceTemplateVariables(template.body, lead);
    setMessage(content);

    if (messageType === 'email' && template.subject) {
      const subjectText = replaceTemplateVariables(template.subject, lead);
      setSubject(subjectText);
    }

    setShowTemplates(false);
  };

  const handleCopy = async () => {
    if (!message.trim()) {
      const alertMessage = 'No message to copy';
      if (Platform.OS === 'web') {
        window.alert(alertMessage);
      } else {
        Alert.alert('Error', alertMessage);
      }
      return;
    }

    try {
      // For email, copy both subject and message
      let textToCopy = message;
      if (messageType === 'email' && subject.trim()) {
        textToCopy = `Subject: ${subject}\n\n${message}`;
      }

      await Clipboard.setStringAsync(textToCopy);

      const successMessage = 'Message copied to clipboard!';
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Success', successMessage);
      }

      // Reset form and close
      setMessage('');
      setSubject('');
      onSuccess?.();
      onDismiss();
    } catch (error) {
      console.error('Copy error:', error);
      const errorMessage = 'Failed to copy message';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleOpenEmailApp = async () => {
    if (!recipient || !message.trim()) {
      const alertMessage = 'Please fill in recipient and message';
      if (Platform.OS === 'web') {
        window.alert(alertMessage);
      } else {
        Alert.alert('Error', alertMessage);
      }
      return;
    }

    try {
      // Encode subject and body for mailto URL
      const encodedSubject = encodeURIComponent(subject || '');
      const encodedBody = encodeURIComponent(message);
      const mailtoURL = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;

      await Linking.openURL(mailtoURL);

      // Close dialog after opening email app
      onSuccess?.();
      onDismiss();
    } catch (error) {
      console.error('Open email app error:', error);
      const errorMessage = 'Failed to open email app';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleOpenSMSApp = async () => {
    if (!recipient || !message.trim()) {
      const alertMessage = 'Please fill in recipient and message';
      if (Platform.OS === 'web') {
        window.alert(alertMessage);
      } else {
        Alert.alert('Error', alertMessage);
      }
      return;
    }

    try {
      // Encode body for SMS URL
      const encodedBody = encodeURIComponent(message);
      // iOS uses & while Android uses ? - use & as it works on both
      const smsURL = Platform.OS === 'ios'
        ? `sms:${recipient}&body=${encodedBody}`
        : `sms:${recipient}?body=${encodedBody}`;

      await Linking.openURL(smsURL);

      // Close dialog after opening SMS app
      onSuccess?.();
      onDismiss();
    } catch (error) {
      console.error('Open SMS app error:', error);
      const errorMessage = 'Failed to open SMS app';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleSend = async () => {
    // Validation
    if (!recipient) {
      const alertMessage = `Please enter a ${messageType === 'email' ? 'email address' : 'phone number'}`;
      if (Platform.OS === 'web') {
        window.alert(alertMessage);
      } else {
        Alert.alert('Error', alertMessage);
      }
      return;
    }

    if (!message.trim()) {
      const alertMessage = 'Please enter a message';
      if (Platform.OS === 'web') {
        window.alert(alertMessage);
      } else {
        Alert.alert('Error', alertMessage);
      }
      return;
    }

    if (messageType === 'email' && !subject.trim()) {
      const alertMessage = 'Please enter a subject';
      if (Platform.OS === 'web') {
        window.alert(alertMessage);
      } else {
        Alert.alert('Error', alertMessage);
      }
      return;
    }

    setIsSending(true);

    try {
      if (messageType === 'sms') {
        await sendSMS();
      } else {
        await sendEmail();
      }

      const successMessage = `${messageType.toUpperCase()} sent successfully!`;
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Success', successMessage);
      }

      // Reset form
      setMessage('');
      setSubject('');
      onSuccess?.();
      onDismiss();
    } catch (error: any) {
      console.error('Send error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSending(false);
    }
  };

  const sendSMS = async () => {
    if (!API_CONFIG.TWILIO_ACCOUNT_SID || !API_CONFIG.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured. Please add them to src/config/api.ts');
    }

    const url = `${API_ENDPOINTS.twilio}/Accounts/${API_CONFIG.TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: API_CONFIG.TWILIO_PHONE_NUMBER,
        To: recipient,
        Body: message,
      }),
      {
        auth: {
          username: API_CONFIG.TWILIO_ACCOUNT_SID,
          password: API_CONFIG.TWILIO_AUTH_TOKEN,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  };

  const sendEmail = async () => {
    if (!API_CONFIG.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured. Please add it to src/config/api.ts');
    }

    const response = await axios.post(
      API_ENDPOINTS.sendgrid,
      {
        personalizations: [
          {
            to: [{ email: recipient }],
            subject: subject,
          },
        ],
        from: {
          email: API_CONFIG.SENDGRID_FROM_EMAIL,
          name: API_CONFIG.SENDGRID_FROM_NAME,
        },
        content: [
          {
            type: 'text/plain',
            value: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_CONFIG.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, { backgroundColor: currentTheme.surface }]}>
        <Dialog.Title style={{ fontFamily: 'DMSans_700Bold', fontSize: 18, color: currentTheme.text }}>
          {copyMode ? 'Compose Message' : 'Send Message'}
        </Dialog.Title>
        <Text style={{ paddingHorizontal: spacing.lg, fontFamily: 'DMSans_500Medium', fontSize: 13, color: currentTheme.textSecondary, marginTop: -spacing.sm, marginBottom: spacing.md }}>
          {lead.fullName} • {messageType === 'email' ? 'Email' : 'SMS'} {recipientType === 'contractor' ? '(Contractor)' : '(Homeowner)'}
        </Text>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            {/* Message Type Selector - Only show if not locked */}
            {!lockMessageType && (
              <SegmentedButtons
                value={messageType}
                onValueChange={(value) => setMessageType(value as 'sms' | 'email')}
                buttons={[
                  {
                    value: 'sms',
                    label: 'SMS',
                    icon: 'message',
                  },
                  {
                    value: 'email',
                    label: 'Email',
                    icon: 'email',
                  },
                ]}
                style={styles.segmentedButtons}
              />
            )}

            {/* Templates Section */}
            {availableTemplates.length > 0 ? (
              <View style={styles.section}>
                <TouchableOpacity
                  style={[styles.templateToggle, { backgroundColor: currentTheme.primary + '10', borderColor: currentTheme.primary }]}
                  onPress={() => setShowTemplates(!showTemplates)}
                >
                  <Icon name={showTemplates ? 'chevron-up' : 'chevron-down'} size={20} color={currentTheme.primary} />
                  <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: currentTheme.primary, flex: 1 }}>
                    {showTemplates ? 'Hide' : 'Use'} Template ({availableTemplates.length})
                  </Text>
                  <Icon name="text-box-multiple-outline" size={18} color={currentTheme.primary} />
                </TouchableOpacity>

                {showTemplates && (
                  <View style={styles.templatesList}>
                    {availableTemplates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={[styles.templateCard, { backgroundColor: currentTheme.surfaceElevated, borderColor: currentTheme.border }]}
                        onPress={() => applyTemplate(template)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: currentTheme.text }}>
                            {template.name}
                          </Text>
                          {template.subject && (
                            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: currentTheme.textSecondary, marginTop: 2 }}>
                              Subject: {template.subject}
                            </Text>
                          )}
                          <Text
                            style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: currentTheme.textTertiary, marginTop: spacing.xs }}
                            numberOfLines={2}
                          >
                            {template.body.substring(0, 80)}...
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={currentTheme.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : templates.length > 0 ? (
              <View style={[styles.section, { backgroundColor: currentTheme.accent + '15', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: currentTheme.accent }]}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: currentTheme.accent }}>
                  No {messageType === 'email' ? 'email' : 'SMS'} templates available for {recipientType}s.
                  {'\n'}Create templates in the Templates screen.
                </Text>
              </View>
            ) : (
              <View style={styles.section}>
                <EmptyState
                  icon="text-box-outline"
                  title="No Templates Available"
                  description={`Create ${messageType === 'email' ? 'email' : 'SMS'} templates in the Templates tab.`}
                  compact
                  style={{ marginVertical: 0 }}
                />
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Recipient */}
            <TextInput
              label={messageType === 'email' ? 'Email Address' : 'Phone Number'}
              value={recipient}
              onChangeText={setRecipient}
              mode="outlined"
              style={styles.input}
              keyboardType={messageType === 'email' ? 'email-address' : 'phone-pad'}
              left={<TextInput.Icon icon={messageType === 'email' ? 'email' : 'phone'} />}
            />

            {/* Subject (Email only) */}
            {messageType === 'email' && (
              <View style={{ position: 'relative' }}>
                <TextInput
                  label="Subject"
                  value={subject}
                  onChangeText={setSubject}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="text-short" />}
                />
                {subject.trim() && (
                  <TouchableOpacity
                    style={{ position: 'absolute', right: spacing.lg + spacing.xs, top: 14 }}
                    onPress={async () => {
                      await Clipboard.setStringAsync(subject);
                      if (Platform.OS === 'web') {
                        window.alert('Subject copied!');
                      } else {
                        Alert.alert('Success', 'Subject copied!');
                      }
                    }}
                  >
                    <Icon name="content-copy" size={18} color={currentTheme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Message */}
            <TextInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={8}
              style={[styles.input, styles.messageInput]}
              left={<TextInput.Icon icon="message-text" />}
            />

            {/* Character Count for SMS */}
            {messageType === 'sms' && (
              <View style={styles.characterCount}>
                <Text
                  style={{
                    fontFamily: 'DMSans_500Medium',
                    fontSize: 11,
                    color: message.length > 160 ? currentTheme.coral : currentTheme.textSecondary,
                  }}
                >
                  {message.length} characters
                  {message.length > 160 && ` (${Math.ceil(message.length / 160)} messages)`}
                </Text>
              </View>
            )}

            {/* API Warning */}
            {(!API_CONFIG.TWILIO_ACCOUNT_SID && messageType === 'sms') ||
            (!API_CONFIG.SENDGRID_API_KEY && messageType === 'email') ? (
              <View style={[styles.warningBox, { backgroundColor: currentTheme.coral + '15', borderWidth: 1, borderColor: currentTheme.coral }]}>
                <Icon name="alert-circle-outline" size={16} color={currentTheme.coral} />
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: currentTheme.coral, marginLeft: spacing.xs, flex: 1 }}>
                  {messageType === 'sms'
                    ? 'Twilio credentials not configured'
                    : 'SendGrid API key not configured'}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </Dialog.ScrollArea>

        <Dialog.Actions style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm }}>
          <Button
            onPress={onDismiss}
            disabled={isSending}
            textColor={currentTheme.textSecondary}
            labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: 13 }}
          >
            Cancel
          </Button>
          {copyMode ? (
            <>
              {messageType === 'email' ? (
                <Button
                  mode="outlined"
                  onPress={handleOpenEmailApp}
                  icon="email-open-outline"
                  style={{ borderColor: currentTheme.primary, marginRight: spacing.xs }}
                  textColor={currentTheme.primary}
                  labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: 13 }}
                >
                  Open Email
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handleOpenSMSApp}
                  icon="message-text-outline"
                  style={{ borderColor: currentTheme.primary, marginRight: spacing.xs }}
                  textColor={currentTheme.primary}
                  labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: 13 }}
                >
                  Open SMS
                </Button>
              )}
              <Button
                mode="contained"
                onPress={handleCopy}
                icon="content-copy"
                buttonColor={currentTheme.primary}
                labelStyle={{ fontFamily: 'DMSans_700Bold', fontSize: 13 }}
              >
                Copy
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={handleSend}
              loading={isSending}
              disabled={isSending}
              buttonColor={currentTheme.primary}
              labelStyle={{ fontFamily: 'DMSans_700Bold', fontSize: 13 }}
            >
              Send {messageType.toUpperCase()}
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 550,
    alignSelf: 'center',
    width: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
    maxHeight: 500,
  },
  segmentedButtons: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
  },
  templateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  templatesList: {
    gap: spacing.sm,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  input: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  messageInput: {
    minHeight: 100,
  },
  characterCount: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
    alignItems: 'flex-end',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
});
