/**
 * Terms & Conditions Screen
 * View and edit terms & conditions
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, Surface, Divider } from 'react-native-paper';
import { spacing, borderRadius, shadows } from '../../theme';
import { getPolicy, updatePolicy } from '../../services/policiesService';
import WebContainer from '../../components/WebContainer';

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
          Terms & Conditions
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
                Loading terms...
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
                    Terms & Conditions
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
                  value={termsText}
                  onChangeText={setTermsText}
                  multiline
                  mode="outlined"
                  style={styles.textInput}
                  disabled={isSaving}
                  placeholder="Enter terms and conditions..."
                />
              ) : (
                <Text
                  variant="bodyMedium"
                  style={[styles.text, { color: theme.colors.onSurface }]}
                >
                  {termsText}
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
