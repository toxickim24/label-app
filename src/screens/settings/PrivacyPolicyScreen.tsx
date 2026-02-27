/**
 * Privacy Policy Screen
 * View and edit privacy policy
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, Surface, Divider } from 'react-native-paper';
import { spacing, borderRadius, shadows } from '../../theme';
import { getPolicy, updatePolicy } from '../../services/policiesService';
import WebContainer from '../../components/WebContainer';

const DEFAULT_POLICY = `Privacy Policy

Last Updated: ${new Date().toLocaleDateString()}

1. Information We Collect
We collect information you provide directly to us, including:
- Account information (name, email, phone number)
- Lead information (addresses, contact details, permit types)
- Usage data (app interactions, feature usage)
- Device information (device type, operating system)

2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Process and manage leads
- Send you technical notices and support messages
- Communicate with you about products, services, and events
- Monitor and analyze trends, usage, and activities

3. Information Sharing
We do not sell your personal information. We may share information:
- With your consent
- To comply with legal obligations
- To protect rights, privacy, safety, or property
- With service providers who assist our operations

4. Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Data Retention
We retain your information for as long as your account is active or as needed to provide services. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.

6. Your Rights
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Object to processing of your information
- Export your data

7. Children's Privacy
Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.

8. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.

9. Contact Us
If you have questions about this privacy policy, please contact us at:
privacy@labelapp.com`;

export default function PrivacyPolicyScreen({ navigation }: any) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY);
  const [originalText, setOriginalText] = useState(DEFAULT_POLICY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load privacy policy from Firestore on mount
  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setIsLoading(true);
      const policy = await getPolicy('privacy_policy');

      if (policy && policy.content) {
        setPolicyText(policy.content);
        setOriginalText(policy.content);
      } else {
        // No policy in database, use default
        setPolicyText(DEFAULT_POLICY);
        setOriginalText(DEFAULT_POLICY);
      }
    } catch (error) {
      console.error('Failed to load privacy policy:', error);
      setPolicyText(DEFAULT_POLICY);
      setOriginalText(DEFAULT_POLICY);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePolicy('privacy_policy', policyText);
      setOriginalText(policyText); // Update original to current
      setIsEditing(false);
      console.log('✅ Privacy policy saved successfully');
    } catch (error) {
      console.error('Failed to save privacy policy:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPolicyText(originalText); // Restore to last saved version
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Privacy Policy
        </Text>
        <IconButton
          icon={isEditing ? 'close' : 'pencil'}
          size={24}
          onPress={() => (isEditing ? handleCancel() : setIsEditing(true))}
        />
      </Surface>

      <WebContainer maxWidth="lg">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ marginTop: spacing.lg, color: theme.colors.onSurfaceVariant }}>
                Loading privacy policy...
              </Text>
            </View>
          ) : (
            <Surface
              style={[
                styles.contentCard,
                {
                  backgroundColor: theme.colors.surface,
                  ...shadows.sm,
                },
              ]}
            >
              {/* Page Header */}
              {!isEditing && (
                <>
                  <Text
                    variant="headlineMedium"
                    style={[styles.pageTitle, { color: theme.colors.onSurface }]}
                  >
                    Privacy Policy
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Last Updated: {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Divider style={styles.divider} />
                </>
              )}

              {/* Content */}
              {isEditing ? (
                <TextInput
                  value={policyText}
                  onChangeText={setPolicyText}
                  multiline
                  mode="outlined"
                  style={styles.textInput}
                  disabled={isSaving}
                  placeholder="Enter privacy policy..."
                />
              ) : (
                <Text
                  variant="bodyMedium"
                  style={[styles.text, { color: theme.colors.onSurface }]}
                >
                  {policyText}
                </Text>
              )}
            </Surface>
          )}
        </ScrollView>
      </WebContainer>

      {/* Actions */}
      {isEditing && !isLoading && (
        <Surface
          style={[styles.actions, { backgroundColor: theme.colors.surface }]}
          elevation={2}
        >
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.button}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            loading={isSaving}
            disabled={isSaving}
          >
            Save Changes
          </Button>
        </Surface>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  contentCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  lastUpdated: {
    marginBottom: spacing.xl,
  },
  divider: {
    marginBottom: spacing.xxxl,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxxl * 2,
  },
  text: {
    lineHeight: 28,
    fontSize: 15,
  },
  textInput: {
    minHeight: 500,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  button: {
    flex: 1,
  },
});
