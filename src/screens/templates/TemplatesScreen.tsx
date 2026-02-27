/**
 * Templates Screen
 * Manage email and SMS templates
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, Card, Button, useTheme, Chip, Dialog, Portal, RadioButton, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTemplatesStore } from '../../store';
import { Template, PermitType, TemplateCategory } from '../../types';
import { spacing, borderRadius } from '../../theme';
import InfoPanel from '../../components/InfoPanel';
import EmptyState from '../../components/EmptyState';
import WebContainer from '../../components/WebContainer';
import { useResponsive } from '../../hooks/useResponsive';
import { generateAITemplate } from '../../services/aiService';
import {
  subscribeToTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../../services/templatesService';
import { getTemplateVariablesGuide, getAITemplateInstruction } from '../../utils/templateVariables';

export default function TemplatesScreen() {
  const theme = useTheme();
  const { isMobile, containerPadding } = useResponsive();
  const { templates, setTemplates } = useTemplatesStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [selectedPermitType, setSelectedPermitType] = useState<PermitType>('pool_permits');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('homeowner_email');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Subscribe to Firestore templates in real-time
  useEffect(() => {
    console.log('📡 Setting up templates Firestore subscription...');
    const unsubscribe = subscribeToTemplates('all', (fetchedTemplates) => {
      console.log(`✅ Received ${fetchedTemplates.length} templates from Firestore`);
      setTemplates(fetchedTemplates);
    });

    return () => {
      console.log('🔌 Cleaning up templates Firestore subscription');
      unsubscribe();
    };
  }, [setTemplates]);

  const handleGenerateTemplate = async () => {
    setIsGenerating(true);
    try {
      // Add instruction to use template variables
      const enhancedPrompt = customPrompt
        ? `${customPrompt}\n\n${getAITemplateInstruction()}`
        : getAITemplateInstruction();

      const result = await generateAITemplate({
        provider: 'openai',
        permitType: selectedPermitType,
        category: selectedCategory,
        customPrompt: enhancedPrompt,
      });

      // Parse subject from email content if it's an email template
      let subject = null;
      let body = result.content;

      if (selectedCategory.includes('email')) {
        const subjectMatch = result.content.match(/^Subject:\s*(.+?)$/m);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          body = result.content.replace(/^Subject:\s*.+?$/m, '').trim();
        }
      }

      // Create new template in Firestore
      const templateData = {
        name: `${selectedCategory.replace(/_/g, ' ')} - ${selectedPermitType.replace(/_/g, ' ')}`,
        permitType: selectedPermitType,
        category: selectedCategory,
        subject,
        body,
        generatedBy: result.provider,
        aiModel: result.model,
        basePrompt: customPrompt || null,
        createdBy: 'current-user',
        updatedBy: 'current-user',
      };

      await createTemplate(templateData);
      setShowDialog(false);
      setCustomPrompt('');

      // Show success message
      if (Platform.OS === 'web') {
        window.alert('Template generated successfully!');
      } else {
        Alert.alert('Success', 'Template generated successfully!');
      }
    } catch (error) {
      console.error('Failed to generate template:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to generate template. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to generate template. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setEditedName(template.name);
    setEditedSubject(template.subject || '');
    setEditedBody(template.body);
    setShowEditDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const updates = {
        name: editedName,
        subject: editedSubject || null,
        body: editedBody,
        updatedBy: 'current-user',
      };

      await updateTemplate(selectedTemplate.id, updates);
      setShowEditDialog(false);
      setSelectedTemplate(null);

      if (Platform.OS === 'web') {
        window.alert('Template updated successfully!');
      } else {
        Alert.alert('Success', 'Template updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to update template. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to update template. Please try again.');
      }
    }
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return;

    const confirmDelete = async () => {
      try {
        await deleteTemplate(selectedTemplate.id);
        setShowEditDialog(false);
        setSelectedTemplate(null);

        if (Platform.OS === 'web') {
          window.alert('Template deleted successfully!');
        } else {
          Alert.alert('Success', 'Template deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
        if (Platform.OS === 'web') {
          window.alert('Failed to delete template. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete template. Please try again.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this template?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Template',
        'Are you sure you want to delete this template?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const renderTemplate = ({ item }: { item: Template }) => (
    <TouchableOpacity onPress={() => handleTemplateClick(item)} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium">{item.name}</Text>
            <Chip
              mode="flat"
              style={{ backgroundColor: theme.colors.primaryContainer }}
              icon={() => <Icon name="robot" size={16} color={theme.colors.onPrimaryContainer} />}
            >
              {item.generatedBy.toUpperCase()}
            </Chip>
          </View>

          <Text variant="bodyMedium" style={styles.category}>
            {item.category.replace('_', ' ').toUpperCase()}
          </Text>

          {item.subject && (
            <Text variant="bodySmall" style={styles.subject}>
              Subject: {item.subject}
            </Text>
          )}

          <Text variant="bodySmall" numberOfLines={2} style={styles.body}>
            {item.body}
          </Text>

          <View style={styles.footer}>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              Used {item.timesUsed} times
            </Text>
            {item.lastUsedAt && (
              <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                Last: {new Date(item.lastUsedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebContainer maxWidth="xl">
        <View style={[styles.headerContainer, { padding: containerPadding, paddingBottom: spacing.md }]}>
          <Text variant="headlineSmall">Templates</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => setShowDialog(true)}
            compact={isMobile}
          >
            {isMobile ? 'AI' : 'Generate with AI'}
          </Button>
        </View>

        <FlatList
          data={templates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { padding: containerPadding, paddingTop: 0 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="file-document-multiple-outline" size={64} color={theme.colors.secondary} />
              <Text variant="titleMedium" style={{ color: theme.colors.secondary, marginTop: spacing.md }}>
                No templates yet
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: spacing.sm, textAlign: 'center' }}>
                Create your first template with AI
              </Text>
            </View>
          }
        />
      </WebContainer>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)} style={styles.dialog}>
          <Dialog.Title>Generate AI Template</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={styles.dialogContent}>
                <Text variant="labelLarge" style={styles.sectionLabel}>Permit Type</Text>
                <RadioButton.Group
                  onValueChange={(value) => setSelectedPermitType(value as PermitType)}
                  value={selectedPermitType}
                >
                  <RadioButton.Item label="Pool Permits" value="pool_permits" />
                  <RadioButton.Item label="Kitchen & Bath Permits" value="kitchen_bath_permits" />
                  <RadioButton.Item label="Roof Permits" value="roof_permits" />
                </RadioButton.Group>

                <Text variant="labelLarge" style={[styles.sectionLabel, { marginTop: spacing.md }]}>Template Category</Text>
                <RadioButton.Group
                  onValueChange={(value) => setSelectedCategory(value as TemplateCategory)}
                  value={selectedCategory}
                >
                  <RadioButton.Item label="Homeowner Email" value="homeowner_email" />
                  <RadioButton.Item label="Homeowner Text (SMS)" value="homeowner_text" />
                  <RadioButton.Item label="Contractor Email" value="contractor_email" />
                  <RadioButton.Item label="Contractor Text (SMS)" value="contractor_text" />
                </RadioButton.Group>

                <TextInput
                  label="Custom Instructions (Optional)"
                  value={customPrompt}
                  onChangeText={setCustomPrompt}
                  multiline
                  numberOfLines={4}
                  mode="outlined"
                  style={{ marginTop: spacing.md }}
                  placeholder="E.g., Make it more formal, include pricing info, etc."
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleGenerateTemplate}
              disabled={isGenerating}
              loading={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)} style={styles.dialog}>
          <Dialog.Title>Edit Template</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={styles.dialogContent}>
                <TextInput
                  label="Template Name"
                  value={editedName}
                  onChangeText={setEditedName}
                  mode="outlined"
                  style={{ marginBottom: spacing.md }}
                />

                {selectedTemplate?.category.includes('email') && (
                  <TextInput
                    label="Email Subject"
                    value={editedSubject}
                    onChangeText={setEditedSubject}
                    mode="outlined"
                    style={{ marginBottom: spacing.md }}
                  />
                )}

                <TextInput
                  label="Template Body"
                  value={editedBody}
                  onChangeText={setEditedBody}
                  multiline
                  numberOfLines={10}
                  mode="outlined"
                  style={{ marginBottom: spacing.md }}
                  placeholder="Use variables like {firstName}, {fullAddress}, {permitType}..."
                />

                {/* Template Variables Guide */}
                <InfoPanel
                  icon="code-braces"
                  title="Available Variables"
                  subtitle="Use these in your template - they'll be replaced with actual lead data"
                  sections={[
                    {
                      title: 'Identity',
                      items: [
                        { label: '{firstName}', isVariable: true },
                        { label: '{lastName}', isVariable: true },
                        { label: '{fullName}', isVariable: true },
                      ],
                    },
                    {
                      title: 'Contact',
                      items: [
                        { label: '{primaryPhone}', isVariable: true },
                        { label: '{primaryEmail}', isVariable: true },
                      ],
                    },
                    {
                      title: 'Address',
                      items: [
                        { label: '{fullAddress}', isVariable: true },
                        { label: '{street}', isVariable: true },
                        { label: '{city}', isVariable: true },
                        { label: '{state}', isVariable: true },
                        { label: '{zip}', isVariable: true },
                      ],
                    },
                    {
                      title: 'Permit Info',
                      items: [
                        { label: '{permitType}', isVariable: true },
                        { label: '{permitNumber}', isVariable: true },
                        { label: '{permitDate}', isVariable: true },
                      ],
                    },
                  ]}
                  style={{ marginBottom: spacing.lg }}
                />

                {selectedTemplate && (
                  <View style={[styles.templateInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Category: {selectedTemplate.category.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Generated by: {selectedTemplate.generatedBy.toUpperCase()}
                    </Text>
                    {selectedTemplate.aiModel && (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Model: {selectedTemplate.aiModel}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              onPress={handleDeleteTemplate}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
            <View style={{ flex: 1 }} />
            <Button onPress={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSaveTemplate}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
    ...Platform.select({
      web: {
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  category: {
    color: '#666',
    marginBottom: spacing.sm,
  },
  subject: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  body: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xxl,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    paddingHorizontal: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  templateInfo: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  variablesGuide: {
    backgroundColor: '#e3f2fd',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
});
