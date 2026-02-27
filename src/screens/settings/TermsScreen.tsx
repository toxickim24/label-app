/**
 * Terms & Conditions Screen
 * View and edit terms & conditions
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import { spacing } from '../../theme';
import { getPolicy, updatePolicy } from '../../services/policiesService';

const DEFAULT_TERMS = `Terms & Conditions

Last Updated: ${new Date().toLocaleDateString()}

1. Acceptance of Terms
By accessing and using the Label app, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on Label's app for personal, non-commercial transitory viewing only.

3. Disclaimer
The materials on Label's app are provided on an 'as is' basis. Label makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall Label or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Label's app.

5. Accuracy of Materials
The materials appearing on Label's app could include technical, typographical, or photographic errors. Label does not warrant that any of the materials on its app are accurate, complete or current.

6. Links
Label has not reviewed all of the sites linked to its app and is not responsible for the contents of any such linked site.

7. Modifications
Label may revise these terms of service for its app at any time without notice. By using this app you are agreeing to be bound by the then current version of these terms of service.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`;

export default function TermsScreen({ navigation }: any) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [termsText, setTermsText] = useState(DEFAULT_TERMS);
  const [originalText, setOriginalText] = useState(DEFAULT_TERMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load terms from Firestore on mount
  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const policy = await getPolicy('terms_and_conditions');

      if (policy && policy.content) {
        setTermsText(policy.content);
        setOriginalText(policy.content);
      } else {
        // No policy in database, use default
        setTermsText(DEFAULT_TERMS);
        setOriginalText(DEFAULT_TERMS);
      }
    } catch (error) {
      console.error('Failed to load terms:', error);
      setTermsText(DEFAULT_TERMS);
      setOriginalText(DEFAULT_TERMS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePolicy('terms_and_conditions', termsText);
      setOriginalText(termsText); // Update original to current
      setIsEditing(false);
      console.log('✅ Terms saved successfully');
    } catch (error) {
      console.error('Failed to save terms:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTermsText(originalText); // Restore to last saved version
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
          Terms & Conditions
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
              Loading terms...
            </Text>
          </View>
        ) : isEditing ? (
          <TextInput
            value={termsText}
            onChangeText={setTermsText}
            multiline
            mode="outlined"
            style={styles.textInput}
            disabled={isSaving}
          />
        ) : (
          <Text variant="bodyMedium" style={styles.text}>
            {termsText}
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
