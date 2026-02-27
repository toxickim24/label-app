/**
 * Lead Detail Screen
 * Shows complete information about a lead
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Alert } from 'react-native';
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
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLeadsStore } from '../../store';
import { getStatusColor, spacing } from '../../theme';
import { Lead } from '../../types';
import SendMessageDialog from '../../components/SendMessageDialog';

interface LeadDetailScreenProps {
  route: {
    params: {
      leadId: string;
    };
  };
  navigation: any;
}

export default function LeadDetailScreen({ route, navigation }: LeadDetailScreenProps) {
  const theme = useTheme();
  const { leadId } = route.params;
  const leads = useLeadsStore((state) => state.leads);
  const lead = leads.find((l) => l.id === leadId);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineSmall" style={styles.leadName}>
                {lead.fullName}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                {lead.recordId}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={{
                backgroundColor: getStatusColor(lead.status, theme.dark),
              }}
              textStyle={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
            >
              {lead.status.toUpperCase()}
            </Chip>
          </View>
        </Surface>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.actionsContainer}>
              <Button
                mode="contained-tonal"
                icon="phone"
                onPress={() => handleCall(lead.phone1)}
                style={styles.actionButton}
              >
                Call
              </Button>
              <Button
                mode="contained-tonal"
                icon="message"
                onPress={() => handleSMS(lead.phone1)}
                style={styles.actionButton}
              >
                SMS
              </Button>
              <Button
                mode="contained-tonal"
                icon="email"
                onPress={() => handleEmail(lead.email1)}
                style={styles.actionButton}
              >
                Email
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Contact Information
            </Text>

            <List.Item
              title="Primary Phone"
              description={lead.phone1}
              left={(props) => <List.Icon {...props} icon="phone" />}
              right={(props) => (
                <View style={styles.contactActions}>
                  <IconButton icon="phone" size={20} onPress={() => handleCall(lead.phone1)} />
                  <IconButton icon="message" size={20} onPress={() => handleSMS(lead.phone1)} />
                  <IconButton icon="content-copy" size={20} onPress={() => handleCopy(lead.phone1, 'Phone number')} />
                </View>
              )}
            />

            {lead.phone2 && (
              <List.Item
                title="Secondary Phone"
                description={lead.phone2}
                left={(props) => <List.Icon {...props} icon="phone" />}
                right={(props) => (
                  <View style={styles.contactActions}>
                    <IconButton icon="phone" size={20} onPress={() => handleCall(lead.phone2!)} />
                    <IconButton icon="message" size={20} onPress={() => handleSMS(lead.phone2!)} />
                    <IconButton icon="content-copy" size={20} onPress={() => handleCopy(lead.phone2!, 'Phone number')} />
                  </View>
                )}
              />
            )}

            {lead.phone3 && (
              <List.Item
                title="Tertiary Phone"
                description={lead.phone3}
                left={(props) => <List.Icon {...props} icon="phone" />}
                right={(props) => (
                  <View style={styles.contactActions}>
                    <IconButton icon="phone" size={20} onPress={() => handleCall(lead.phone3!)} />
                    <IconButton icon="message" size={20} onPress={() => handleSMS(lead.phone3!)} />
                    <IconButton icon="content-copy" size={20} onPress={() => handleCopy(lead.phone3!, 'Phone number')} />
                  </View>
                )}
              />
            )}

            <Divider style={styles.divider} />

            <List.Item
              title="Primary Email"
              description={lead.email1}
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => (
                <View style={styles.contactActions}>
                  <IconButton icon="email" size={20} onPress={() => handleEmail(lead.email1)} />
                  <IconButton icon="content-copy" size={20} onPress={() => handleCopy(lead.email1, 'Email address')} />
                </View>
              )}
            />

            {lead.email2 && (
              <List.Item
                title="Secondary Email"
                description={lead.email2}
                left={(props) => <List.Icon {...props} icon="email" />}
                right={(props) => (
                  <View style={styles.contactActions}>
                    <IconButton icon="email" size={20} onPress={() => handleEmail(lead.email2!)} />
                    <IconButton icon="content-copy" size={20} onPress={() => handleCopy(lead.email2!, 'Email address')} />
                  </View>
                )}
              />
            )}

            {lead.email3 && (
              <List.Item
                title="Tertiary Email"
                description={lead.email3}
                left={(props) => <List.Icon {...props} icon="email" />}
                right={(props) => (
                  <View style={styles.contactActions}>
                    <IconButton icon="email" size={20} onPress={() => handleEmail(lead.email3!)} />
                    <IconButton icon="content-copy" size={20} onPress={() => handleCopy(lead.email3!, 'Email address')} />
                  </View>
                )}
              />
            )}
          </Card.Content>
        </Card>

        {/* Property Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Property Information
            </Text>

            <List.Item
              title="Full Address"
              description={lead.fullAddress}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Street"
              description={lead.street}
              left={(props) => <List.Icon {...props} icon="road" />}
            />
            <List.Item
              title="City"
              description={lead.city}
              left={(props) => <List.Icon {...props} icon="city" />}
            />
            <List.Item
              title="State"
              description={lead.state}
              left={(props) => <List.Icon {...props} icon="flag" />}
            />
            <List.Item
              title="ZIP Code"
              description={lead.zip}
              left={(props) => <List.Icon {...props} icon="mailbox" />}
            />
            <List.Item
              title="County"
              description={lead.county}
              left={(props) => <List.Icon {...props} icon="map" />}
            />
          </Card.Content>
        </Card>

        {/* Permit Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Permit Information
            </Text>

            <List.Item
              title="Permit Type"
              description={lead.permitType.replace('_', ' ').toUpperCase()}
              left={(props) => <List.Icon {...props} icon="file-document" />}
            />
            {lead.permitId && (
              <List.Item
                title="Permit ID"
                description={lead.permitId}
                left={(props) => <List.Icon {...props} icon="identifier" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Communication History */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Communication History
            </Text>

            {lead.communications.length > 0 ? (
              lead.communications.map((comm, index) => (
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
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                No communications yet
              </Text>
            )}

            {lead.lastContactedAt && (
              <>
                <Divider style={styles.divider} />
                <List.Item
                  title="Last Contacted"
                  description={formatDate(lead.lastContactedAt)}
                  left={(props) => <List.Icon {...props} icon="clock" />}
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Notes */}
        {lead.notes && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Notes
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: spacing.sm }}>
                {lead.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Metadata */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Information
            </Text>

            <List.Item
              title="Created Date"
              description={formatDate(lead.createdDate)}
              left={(props) => <List.Icon {...props} icon="calendar-plus" />}
            />
            <List.Item
              title="Last Updated"
              description={formatDate(lead.lastUpdated)}
              left={(props) => <List.Icon {...props} icon="calendar-edit" />}
            />
            {lead.importedAt && (
              <List.Item
                title="Imported At"
                description={formatDate(lead.importedAt)}
                left={(props) => <List.Icon {...props} icon="database-import" />}
              />
            )}
            <List.Item
              title="Read Status"
              description={lead.isRead ? 'Read' : 'Unread'}
              left={(props) => <List.Icon {...props} icon={lead.isRead ? 'eye' : 'eye-off'} />}
            />
            <List.Item
              title="Flagged"
              description={lead.isFlagged ? 'Yes' : 'No'}
              left={(props) => <List.Icon {...props} icon={lead.isFlagged ? 'flag' : 'flag-outline'} />}
            />
          </Card.Content>
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Send Message Dialog (for template selection and copying) */}
      <SendMessageDialog
        visible={showMessageDialog}
        onDismiss={() => setShowMessageDialog(false)}
        lead={lead}
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
    padding: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leadName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  card: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
});
