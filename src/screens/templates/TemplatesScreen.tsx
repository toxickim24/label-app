/**
 * Templates Screen
 * Manage email and SMS templates
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, useTheme, Chip, Dialog, Portal, RadioButton, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTemplatesStore } from '../../store';
import { Template, PermitType, TemplateCategory } from '../../types';
import { spacing, borderRadius, darkTheme, lightTheme, shadows } from '../../theme';
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
import { showToast } from '../../utils/toast';
import { haptics } from '../../utils/haptics';

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
  const currentTheme = theme.dark ? darkTheme : lightTheme;
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
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

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
      setShowClearConfirmDialog(true);
    }
  };

  const confirmClearInstructions = () => {
    haptics.light();
    setCustomPrompt('');
    setShowClearConfirmDialog(false);
    showToast.info('Instructions cleared');
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
      haptics.success();
      showToast.success('Template generated successfully!', 'Your AI template is ready to use');
    } catch (error) {
      console.error('Failed to generate template:', error);
      haptics.error();
      showToast.error('Failed to generate template', 'Please try again');
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

      haptics.success();
      showToast.success('Template updated successfully!');
    } catch (error) {
      console.error('Failed to update template:', error);
      haptics.error();
      showToast.error('Failed to update template', 'Please try again');
    }
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return;
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      setShowDeleteConfirmDialog(false);
      setShowEditDialog(false);
      setSelectedTemplate(null);

      haptics.success();
      showToast.success('Template deleted successfully!');
    } catch (error) {
      console.error('Failed to delete template:', error);
      haptics.error();
      showToast.error('Failed to delete template', 'Please try again');
    }
  };

  const renderTemplate = ({ item }: { item: Template }) => (
    <TouchableOpacity onPress={() => handleTemplateClick(item)} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]} mode="elevated" elevation={1}>
        <Card.Content>
          <View style={styles.header}>
            <Text
              style={{
                flex: 1,
                fontFamily: 'DMSans_700Bold',
                fontSize: 15,
                lineHeight: 20,
                color: currentTheme.text,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Chip
              mode="flat"
              style={{
                backgroundColor: currentTheme.primary + '15',
                height: 24,
              }}
              textStyle={{
                fontFamily: 'DMSans_700Bold',
                fontSize: 10,
                letterSpacing: 0.5,
                color: currentTheme.primary,
              }}
              icon={() => (
                <Icon
                  name="robot"
                  size={12}
                  color={currentTheme.primary}
                />
              )}
            >
              {item.generatedBy.toUpperCase()}
            </Chip>
          </View>

          <Text style={[styles.category, { color: currentTheme.textSecondary }]}>
            {item.category.replace(/_/g, ' ')}
          </Text>

          {item.subject && (
            <Text style={[styles.subject, { color: currentTheme.text }]} numberOfLines={2}>
              {item.subject}
            </Text>
          )}

          <Text
            numberOfLines={3}
            style={[styles.body, { color: currentTheme.textSecondary }]}
          >
            {item.body}
          </Text>

          <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="chart-line" size={12} color={currentTheme.textSecondary} />
              <Text style={{ fontFamily: 'DMSans_400Regular', color: currentTheme.textSecondary, fontSize: 11 }}>
                Used {item.timesUsed} {item.timesUsed === 1 ? 'time' : 'times'}
              </Text>
            </View>
            {item.lastUsedAt && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="clock-outline" size={12} color={currentTheme.textSecondary} />
                <Text style={{ fontFamily: 'DMSans_400Regular', color: currentTheme.textSecondary, fontSize: 11 }}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <WebContainer maxWidth="xl">
        <View style={[styles.headerContainer, { padding: containerPadding, paddingBottom: spacing.sm }]}>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 24, color: currentTheme.text }}>Templates</Text>
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
            <EmptyState
              icon="robot-outline"
              title="No Templates Yet"
              description="Generate professional email and SMS templates powered by AI. Customize them with lead-specific variables for personalized outreach."
              variant="educational"
              tips={[
                'AI templates use dynamic variables like {firstName} and {permitType}',
                'Templates are automatically populated with lead data when you use them',
                'Apply sales optimization to create high-converting messages',
              ]}
              sampleItems={['Pool Email', 'Kitchen & Bath SMS', 'Roof Follow-up']}
              helpText="Each template can be customized and edited after generation"
              primaryAction={{
                label: 'Generate with AI',
                onPress: () => setShowDialog(true),
                icon: 'auto-fix',
              }}
            />
          }
        />
      </WebContainer>

      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={[
            styles.dialog,
            {
              backgroundColor: currentTheme.surface,
              maxWidth: isMobile ? '95%' : 600,
              alignSelf: 'center',
            },
          ]}
        >
          <Dialog.Title
            style={{
              fontFamily: 'DMSans_700Bold',
              fontSize: isMobile ? 18 : 20,
              color: currentTheme.text,
              paddingHorizontal: isMobile ? spacing.md : spacing.lg,
              paddingTop: isMobile ? spacing.md : spacing.lg,
              paddingBottom: isMobile ? spacing.sm : spacing.md,
            }}
          >
            Generate AI Template
          </Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView>
              <View style={[styles.dialogContent, { paddingHorizontal: isMobile ? spacing.md : spacing.lg }]}>
                <Text
                  style={{
                    fontFamily: 'DMSans_700Bold',
                    fontSize: isMobile ? 11 : 12,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    color: currentTheme.textSecondary,
                    marginBottom: spacing.sm,
                  }}
                >
                  Permit Type
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => setSelectedPermitType(value as PermitType)}
                  value={selectedPermitType}
                >
                  <RadioButton.Item
                    label="Pool Permits"
                    value="pool_permits"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                  <RadioButton.Item
                    label="Kitchen & Bath Permits"
                    value="kitchen_bath_permits"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                  <RadioButton.Item
                    label="Roof Permits"
                    value="roof_permits"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                </RadioButton.Group>

                <Text
                  style={{
                    fontFamily: 'DMSans_700Bold',
                    fontSize: isMobile ? 11 : 12,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    color: currentTheme.textSecondary,
                    marginTop: isMobile ? spacing.sm : spacing.md,
                    marginBottom: spacing.sm,
                  }}
                >
                  Template Category
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => setSelectedCategory(value as TemplateCategory)}
                  value={selectedCategory}
                >
                  <RadioButton.Item
                    label="Homeowner Email"
                    value="homeowner_email"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                  <RadioButton.Item
                    label="Homeowner Text (SMS)"
                    value="homeowner_text"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                  <RadioButton.Item
                    label="Contractor Email"
                    value="contractor_email"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                  <RadioButton.Item
                    label="Contractor Text (SMS)"
                    value="contractor_text"
                    labelStyle={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: isMobile ? 14 : 15,
                      color: currentTheme.text,
                    }}
                  />
                </RadioButton.Group>

                <TextInput
                  label="Custom Instructions (Optional)"
                  value={customPrompt}
                  onChangeText={setCustomPrompt}
                  multiline
                  mode="outlined"
                  style={{
                    marginTop: isMobile ? spacing.sm : spacing.md,
                    minHeight: isMobile ? 140 : 180,
                    maxHeight: isMobile ? 300 : 400,
                  }}
                  placeholder="E.g., Make it more formal, include pricing info, etc."
                  contentStyle={{ paddingTop: 8 }}
                  theme={{
                    colors: {
                      text: currentTheme.text,
                      placeholder: currentTheme.textSecondary,
                      primary: currentTheme.primary,
                    },
                  }}
                />

                {/* Optimization Buttons - Only show for specific categories */}
                {shouldShowOptimizationButtons() && (
                  <View style={{ marginTop: isMobile ? spacing.sm : spacing.md, gap: spacing.sm }}>
                    <Button
                      mode="contained"
                      icon="auto-fix"
                      onPress={handleApplyOptimization}
                      buttonColor={currentTheme.primary}
                      labelStyle={{
                        fontFamily: 'DMSans_600SemiBold',
                        fontSize: isMobile ? 12 : 14,
                      }}
                      contentStyle={{ paddingVertical: isMobile ? 6 : spacing.xs }}
                      style={{ borderRadius: borderRadius.md }}
                      compact={isMobile}
                    >
                      Apply Professional Sales Optimization
                    </Button>
                    <Button
                      mode="outlined"
                      icon="close-circle-outline"
                      onPress={handleClearInstructions}
                      disabled={customPrompt.trim() === ''}
                      textColor={currentTheme.textSecondary}
                      labelStyle={{
                        fontFamily: 'DMSans_600SemiBold',
                        fontSize: isMobile ? 12 : 14,
                      }}
                      style={{ borderRadius: borderRadius.md, borderColor: currentTheme.border }}
                      compact={isMobile}
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
                  style={{ marginTop: isMobile ? spacing.md : spacing.xl }}
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions
            style={{
              paddingHorizontal: isMobile ? spacing.md : spacing.lg,
              paddingTop: isMobile ? spacing.sm : spacing.md,
              paddingBottom: isMobile ? spacing.md : spacing.lg,
            }}
          >
            <Button
              onPress={() => setShowDialog(false)}
              disabled={isGenerating}
              labelStyle={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: isMobile ? 13 : 14,
                color: currentTheme.textSecondary,
              }}
              compact={isMobile}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleGenerateTemplate}
              disabled={isGenerating}
              loading={isGenerating}
              buttonColor={currentTheme.primary}
              labelStyle={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: isMobile ? 13 : 14,
              }}
              compact={isMobile}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showEditDialog}
          onDismiss={() => setShowEditDialog(false)}
          style={[
            styles.dialog,
            {
              backgroundColor: currentTheme.surface,
              maxWidth: isMobile ? '95%' : 600,
              alignSelf: 'center',
            },
          ]}
        >
          <Dialog.Title
            style={{
              fontFamily: 'DMSans_700Bold',
              fontSize: isMobile ? 18 : 20,
              color: currentTheme.text,
              paddingHorizontal: isMobile ? spacing.md : spacing.lg,
              paddingTop: isMobile ? spacing.md : spacing.lg,
              paddingBottom: isMobile ? spacing.sm : spacing.md,
            }}
          >
            Edit Template
          </Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView>
              <View style={[styles.dialogContent, { paddingHorizontal: isMobile ? spacing.md : spacing.lg }]}>
                <TextInput
                  label="Template Name"
                  value={editedName}
                  onChangeText={setEditedName}
                  mode="outlined"
                  dense={isMobile}
                  style={{ marginBottom: isMobile ? spacing.sm : spacing.md }}
                  theme={{
                    colors: {
                      text: currentTheme.text,
                      placeholder: currentTheme.textSecondary,
                      primary: currentTheme.primary,
                    },
                  }}
                />

                {selectedTemplate?.category.includes('email') && (
                  <TextInput
                    label="Email Subject"
                    value={editedSubject}
                    onChangeText={setEditedSubject}
                    mode="outlined"
                    dense={isMobile}
                    style={{ marginBottom: isMobile ? spacing.sm : spacing.md }}
                    theme={{
                      colors: {
                        text: currentTheme.text,
                        placeholder: currentTheme.textSecondary,
                        primary: currentTheme.primary,
                      },
                    }}
                  />
                )}

                <TextInput
                  label="Template Body"
                  value={editedBody}
                  onChangeText={setEditedBody}
                  multiline
                  numberOfLines={isMobile ? 8 : 10}
                  mode="outlined"
                  style={{
                    marginBottom: isMobile ? spacing.sm : spacing.md,
                    minHeight: isMobile ? 160 : 200,
                  }}
                  placeholder="Use variables like {firstName}, {fullAddress}, {permitType}..."
                  theme={{
                    colors: {
                      text: currentTheme.text,
                      placeholder: currentTheme.textSecondary,
                      primary: currentTheme.primary,
                    },
                  }}
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
                  <View
                    style={[
                      styles.templateInfo,
                      {
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans_500Medium',
                        fontSize: isMobile ? 11 : 12,
                        color: currentTheme.textSecondary,
                      }}
                    >
                      Category: {selectedTemplate.category.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'DMSans_500Medium',
                        fontSize: isMobile ? 11 : 12,
                        color: currentTheme.textSecondary,
                      }}
                    >
                      Generated by: {selectedTemplate.generatedBy.toUpperCase()}
                    </Text>
                    {selectedTemplate.aiModel && (
                      <Text
                        style={{
                          fontFamily: 'DMSans_500Medium',
                          fontSize: isMobile ? 11 : 12,
                          color: currentTheme.textSecondary,
                        }}
                      >
                        Model: {selectedTemplate.aiModel}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions
            style={{
              paddingHorizontal: isMobile ? spacing.md : spacing.lg,
              paddingTop: isMobile ? spacing.sm : spacing.md,
              paddingBottom: isMobile ? spacing.md : spacing.lg,
            }}
          >
            <Button
              onPress={handleDeleteTemplate}
              textColor={currentTheme.coral}
              labelStyle={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: isMobile ? 13 : 14,
              }}
              compact={isMobile}
            >
              Delete
            </Button>
            <View style={{ flex: 1 }} />
            <Button
              onPress={() => setShowEditDialog(false)}
              labelStyle={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: isMobile ? 13 : 14,
                color: currentTheme.textSecondary,
              }}
              compact={isMobile}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveTemplate}
              buttonColor={currentTheme.primary}
              labelStyle={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: isMobile ? 13 : 14,
              }}
              compact={isMobile}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Clear Instructions Confirmation Dialog */}
        <Dialog
          visible={showClearConfirmDialog}
          onDismiss={() => setShowClearConfirmDialog(false)}
          style={[
            {
              backgroundColor: currentTheme.surface,
              maxWidth: isMobile ? '90%' : 400,
              alignSelf: 'center',
            },
          ]}
        >
          <Dialog.Title style={{ fontFamily: 'DMSans_700Bold', fontSize: isMobile ? 16 : 18 }}>
            Clear Instructions
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: isMobile ? 13 : 14, color: currentTheme.text }}>
              Are you sure you want to clear all custom instructions?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowClearConfirmDialog(false)}
              labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: isMobile ? 13 : 14 }}
              compact={isMobile}
            >
              Cancel
            </Button>
            <Button
              onPress={confirmClearInstructions}
              mode="contained"
              buttonColor={currentTheme.error || '#ef4444'}
              labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: isMobile ? 13 : 14 }}
              compact={isMobile}
            >
              Clear
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete Template Confirmation Dialog */}
        <Dialog
          visible={showDeleteConfirmDialog}
          onDismiss={() => setShowDeleteConfirmDialog(false)}
          style={[
            {
              backgroundColor: currentTheme.surface,
              maxWidth: isMobile ? '90%' : 400,
              alignSelf: 'center',
            },
          ]}
        >
          <Dialog.Title style={{ fontFamily: 'DMSans_700Bold', fontSize: isMobile ? 16 : 18 }}>
            Delete Template
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: isMobile ? 13 : 14, color: currentTheme.text }}>
              Are you sure you want to delete this template?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteConfirmDialog(false)}
              labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: isMobile ? 13 : 14 }}
              compact={isMobile}
            >
              Cancel
            </Button>
            <Button
              onPress={confirmDeleteTemplate}
              mode="contained"
              buttonColor={currentTheme.error || '#ef4444'}
              labelStyle={{ fontFamily: 'DMSans_600SemiBold', fontSize: isMobile ? 13 : 14 }}
              compact={isMobile}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
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
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadows.sm,
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  category: {
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: spacing.sm,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subject: {
    fontFamily: 'DMSans_700Bold',
    marginBottom: spacing.sm,
    fontSize: 15,
    lineHeight: 20,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    marginBottom: spacing.md,
    lineHeight: 20,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dialog: {
    maxHeight: '85%',
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  dialogContent: {
    paddingBottom: spacing.sm,
  },
  templateInfo: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    ...shadows.sm,
  },
});
