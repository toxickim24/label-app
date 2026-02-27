/**
 * Privacy Policy Screen
 * View and edit privacy policy
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import { spacing } from '../../theme';
import { getPolicy, updatePolicy } from '../../services/policiesService';

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
      <View style={styles.header}>
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
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: spacing.md }}>
              Loading privacy policy...
            </Text>
          </View>
        ) : isEditing ? (
          <TextInput
            value={policyText}
            onChangeText={setPolicyText}
            multiline
            mode="outlined"
            style={styles.textInput}
            disabled={isSaving}
          />
        ) : (
          <Text variant="bodyMedium" style={styles.text}>
            {policyText}
          </Text>
        )}
      </ScrollView>

      {isEditing && !isLoading && (
        <View style={styles.actions}>
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
        </View>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  text: {
    lineHeight: 24,
  },
  textInput: {
    minHeight: 400,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
