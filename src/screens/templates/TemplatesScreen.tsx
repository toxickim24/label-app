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

const PROFESSIONAL_SALES_OPTIMIZATION = `Use consultative selling (help-first, not pushy).
Sound natural and conversational — not robotic.
Avoid generic marketing phrases.
Avoid spammy language.
Keep it professional but friendly.
Include one specific, practical expert insight related to the permit type.
Include one clear but soft call-to-action question.
Keep sentences short and easy to read.
Only use the provided dynamic variables.
Do not invent information.`;

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

  // Check if selected category should show optimization buttons
  const shouldShowOptimizationButtons = () => {
    return ['homeowner_email', 'homeowner_text', 'contractor_email', 'contractor_text'].includes(selectedCategory);
  };

  // Apply professional sales optimization
  const handleApplyOptimization = () => {
    if (customPrompt.trim() === '') {
      // If empty, fully populate
      setCustomPrompt(PROFESSIONAL_SALES_OPTIMIZATION);
    } else {
      // If has content, append with proper spacing
      setCustomPrompt(customPrompt + '\n\n' + PROFESSIONAL_SALES_OPTIMIZATION);
    }
  };

  // Clear custom instructions
  const handleClearInstructions = () => {
    if (customPrompt.trim() !== '') {
      if (Platform.OS === 'web') {
        if (window.confirm('Are you sure you want to clear all custom instructions?')) {
          setCustomPrompt('');
        }
      } else {
        Alert.alert(
          'Clear Instructions',
          'Are you sure you want to clear all custom instructions?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => setCustomPrompt('') },
          ]
        );
      }
    }
  };

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
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content>
          <View style={styles.header}>
            <Text
              variant="titleLarge"
              style={{
                flex: 1,
                fontWeight: '700',
                fontSize: 17,
                lineHeight: 24,
                color: theme.colors.onSurface,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Chip
              mode="flat"
              style={{
                backgroundColor: theme.dark
                  ? 'rgba(10, 132, 255, 0.15)'
                  : theme.colors.primaryContainer,
                height: 28,
              }}
              textStyle={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 0.5,
              }}
              icon={() => (
                <Icon
                  name="robot"
                  size={14}
                  color={theme.dark ? theme.colors.primary : theme.colors.onPrimaryContainer}
                />
              )}
            >
              {item.generatedBy.toUpperCase()}
            </Chip>
          </View>

          <Text variant="labelSmall" style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
            {item.category.replace(/_/g, ' ')}
          </Text>

          {item.subject && (
            <Text variant="titleSmall" style={[styles.subject, { color: theme.colors.onSurface }]} numberOfLines={2}>
              {item.subject}
            </Text>
          )}

          <Text
            variant="bodyMedium"
            numberOfLines={3}
            style={[styles.body, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.body}
          </Text>

          <View style={[styles.footer, theme.dark && { borderTopColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="chart-line" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                Used {item.timesUsed} {item.timesUsed === 1 ? 'time' : 'times'}
              </Text>
            </View>
            {item.lastUsedAt && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  {new Date(item.lastUsedAt).toLocaleDateString()}
                </Text>
              </View>
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
                  mode="outlined"
                  style={{ marginTop: spacing.md, minHeight: 180, maxHeight: 400 }}
                  placeholder="E.g., Make it more formal, include pricing info, etc."
                  contentStyle={{ paddingTop: 8 }}
                />

                {/* Optimization Buttons - Only show for specific categories */}
                {shouldShowOptimizationButtons() && (
                  <View style={styles.optimizationButtons}>
                    <Button
                      mode="contained"
                      icon="auto-fix"
                      onPress={handleApplyOptimization}
                      style={styles.optimizationButton}
                      contentStyle={styles.optimizationButtonContent}
                    >
                      Apply Professional Sales Optimization
                    </Button>
                    <Button
                      mode="outlined"
                      icon="close-circle-outline"
                      onPress={handleClearInstructions}
                      style={styles.clearButton}
                      disabled={customPrompt.trim() === ''}
                    >
                      Clear Instructions
                    </Button>
                  </View>
                )}

                {/* Template Variables Guide - CRITICAL FOR UX */}
                <InfoPanel
                  icon="code-braces"
                  title="Available Variables"
                  subtitle="The AI will use these variables in your template"
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
                        { label: '{city}', isVariable: true },
                        { label: '{state}', isVariable: true },
                      ],
                    },
                    {
                      title: 'Permit',
                      items: [
                        { label: '{permitType}', isVariable: true },
                        { label: '{permitNumber}', isVariable: true },
                      ],
                    },
                  ]}
                  style={{ marginTop: spacing.xl }}
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
    marginBottom: spacing.xl,          // More space between cards
    borderRadius: borderRadius.xl,    // More rounded
    ...Platform.select({
      web: {
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        ':hover': {
          transform: 'translateY(-2px)',
        },
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',         // Align to top for better layout
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  category: {
    color: '#86868B',                 // Better contrast
    marginBottom: spacing.md,         // More space
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subject: {
    fontWeight: '700',                // Bolder
    marginBottom: spacing.md,         // More space
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    marginBottom: spacing.lg,         // More space
    lineHeight: 22,                   // Better readability
    fontSize: 14,
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,            // More generous padding
    marginTop: spacing.xxxl,
  },
  dialog: {
    maxHeight: '85%',                 // More room
    borderRadius: borderRadius.xl,    // Rounded dialog
  },
  dialogContent: {
    paddingHorizontal: spacing.lg,    // More padding
    paddingBottom: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.md,         // More space
    fontWeight: '700',                // Bolder
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#86868B',
  },
  templateInfo: {
    padding: spacing.lg,              // More padding
    borderRadius: borderRadius.lg,    // More rounded
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  variablesGuide: {
    backgroundColor: '#e3f2fd',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  optimizationButtons: {
    marginTop: spacing.lg,            // More space
    gap: spacing.md,                  // More gap
  },
  optimizationButton: {
    borderRadius: borderRadius.lg,    // More rounded
  },
  optimizationButtonContent: {
    paddingVertical: spacing.sm,      // More padding
  },
  clearButton: {
    borderRadius: borderRadius.lg,    // More rounded
  },
});
