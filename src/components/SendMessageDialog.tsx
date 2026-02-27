/**
 * Send Message Dialog
 * Allows sending SMS or Email to a lead
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
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
import { Lead, Template } from '../types';
import { spacing } from '../theme';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
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
}

export default function SendMessageDialog({
  visible,
  onDismiss,
  lead,
  initialMessageType = 'sms',
  initialRecipient,
  copyMode = false,
  onSuccess,
}: SendMessageDialogProps) {
  const theme = useTheme();
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

  // Get templates for this permit type and message type
  const availableTemplates = templates.filter(
    (t) =>
      t.isActive &&
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
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>
          {copyMode ? 'Compose Message' : 'Send Message to'} {lead.fullName}
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            {/* Message Type Selector */}
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

            {/* Templates Section */}
            {availableTemplates.length > 0 ? (
              <View style={styles.section}>
                <Button
                  mode="outlined"
                  icon="text-box"
                  onPress={() => setShowTemplates(!showTemplates)}
                  style={styles.templateButton}
                >
                  {showTemplates ? 'Hide Templates' : `Use Template (${availableTemplates.length})`}
                </Button>

                {showTemplates && (
                  <View style={styles.templatesList}>
                    {availableTemplates.map((template) => (
                      <List.Item
                        key={template.id}
                        title={template.name}
                        description={template.subject || template.body.substring(0, 50) + '...'}
                        left={(props) => <List.Icon {...props} icon="text-box-outline" />}
                        onPress={() => applyTemplate(template)}
                        style={styles.templateItem}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : templates.length > 0 ? (
              <View style={[styles.section, styles.infoBox]}>
                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                  No {messageType === 'email' ? 'email' : 'SMS'} templates available for {lead.permitType.replace(/_/g, ' ')}.
                  {'\n'}Switch to {messageType === 'email' ? 'SMS' : 'Email'} or create templates in the Templates screen.
                </Text>
              </View>
            ) : null}

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
              <TextInput
                label="Subject"
                value={subject}
                onChangeText={setSubject}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="text-short" />}
              />
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
                  variant="bodySmall"
                  style={{
                    color: message.length > 160 ? theme.colors.error : theme.colors.secondary,
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
              <View style={[styles.warningBox, { backgroundColor: theme.colors.errorContainer }]}>
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {messageType === 'sms'
                    ? 'Twilio credentials not configured. Add them to src/config/api.ts'
                    : 'SendGrid API key not configured. Add it to src/config/api.ts'}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </Dialog.ScrollArea>

        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSending}>
            Cancel
          </Button>
          {copyMode ? (
            <Button
              mode="contained"
              onPress={handleCopy}
              icon="content-copy"
            >
              Copy Message
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSend}
              loading={isSending}
              disabled={isSending}
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
    maxHeight: 500,
  },
  segmentedButtons: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  templateButton: {
    marginBottom: spacing.sm,
  },
  templatesList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  templateItem: {
    paddingVertical: spacing.xs,
  },
  divider: {
    marginVertical: spacing.md,
  },
  input: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  messageInput: {
    minHeight: 120,
  },
  characterCount: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  warningBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
});
