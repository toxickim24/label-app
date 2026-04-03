/**
 * Dashboard Screen
 * Main screen showing leads
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, SectionList, RefreshControl, TouchableOpacity, Platform, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, Searchbar, useTheme, Surface, Dialog, Portal, Button } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import BottomSheetModal from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { useLeadsStore, useAuthStore } from '../../store';
import { subscribeToLeads } from '../../services/leadsService';
import { Lead, PermitType, Template } from '../../types';
import { subscribeToTemplates, incrementTemplateUsage } from '../../services/templatesService';
import { getStatusColor, lightTheme, darkTheme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme';
import WebContainer from '../../components/WebContainer';
import EmptyState from '../../components/EmptyState';
import { LeadCard } from '../../components/LeadCard';
import { DashboardSkeleton, BottomSheet } from '../../components';
import { getLeadHealth, getLeadHealthInfo } from '../../utils/leadHealth';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { useResponsive } from '../../hooks/useResponsive';
import { sortByPriority, sortByNewest, sortByOldest, filterStaleLeads } from '../../utils/leadUtils';
import { showToast } from '../../utils/toast';
import { haptics } from '../../utils/haptics';
import { getLeadSections } from '../../utils/dateGrouping';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  console.log('📊 DashboardScreen rendering...');

  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
  const { isMobile, isTablet, containerPadding } = useResponsive();
  const user = useAuthStore((state) => state.user);
  const {
    leads,
    setLeads,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useLeadsStore();

  console.log('📊 DashboardScreen - leads count:', leads.length);

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPermitType, setSelectedPermitType] = React.useState<PermitType | 'all'>('all');
  const [showStaleOnly, setShowStaleOnly] = React.useState(false);
  const [groupByTime, setGroupByTime] = React.useState(true); // Enable time-based grouping by default
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Bottom sheet ref for mobile template selection
  const templateBottomSheetRef = useRef<BottomSheetModal>(null);

  // Always use priority sorting (smart: stale leads + status-based priority)
  const sortBy = 'priority';

  // Subscribe to Firestore leads in real-time
  // Note: We fetch ALL leads and filter locally for better UX (instant filtering)
  useEffect(() => {
    console.log('📡 Setting up Firestore subscription...');
    setIsLoading(true);
    const unsubscribe = subscribeToLeads('all', 'all', (fetchedLeads) => {
      console.log(`✅ Received ${fetchedLeads.length} leads from Firestore`);
      setLeads(fetchedLeads);
      setIsLoading(false);
    });

    return () => {
      console.log('🔌 Cleaning up Firestore subscription');
      unsubscribe();
    };
  }, [setLeads]);

  // Subscribe to templates
  useEffect(() => {
    console.log('📡 Setting up templates Firestore subscription...');
    const unsubscribe = subscribeToTemplates('all', (fetchedTemplates) => {
      setTemplates(fetchedTemplates);
      console.log(`✅ Loaded ${fetchedTemplates.length} templates`);
    });

    return () => unsubscribe();
  }, []);

  // Filter leads based on local selectedPermitType, search, and status
  const filteredLeads = React.useMemo(() => {
    let filtered = leads;

    // Filter by permit type
    if (selectedPermitType !== 'all') {
      filtered = filtered.filter(lead => lead.permitType === selectedPermitType);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Filter by stale leads only
    if (showStaleOnly) {
      filtered = filterStaleLeads(filtered);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        lead =>
          lead.recordId?.toLowerCase().includes(query) ||
          lead.fullName?.toLowerCase().includes(query) ||
          lead.city?.toLowerCase().includes(query) ||
          lead.fullAddress?.toLowerCase().includes(query) ||
          lead.phoneNumbers?.some(phone => String(phone || '').includes(query)) ||
          lead.emails?.some(email => String(email || '').toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'priority':
        return sortByPriority(filtered);
      case 'oldest':
        return sortByOldest(filtered);
      case 'newest':
      default:
        return sortByNewest(filtered);
    }
  }, [leads, selectedPermitType, statusFilter, searchQuery, sortBy, showStaleOnly]);

  // Create sections for time-based grouping
  const leadSections = React.useMemo(() => {
    if (!groupByTime) {
      // Return all leads in a single section when grouping is disabled
      return [{ title: '', data: filteredLeads, key: 'all' as const }];
    }
    return getLeadSections(filteredLeads);
  }, [filteredLeads, groupByTime]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Data is already synced via real-time subscription
    // Just show refresh animation for user feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  // Calculate dashboard stats
  const stats = React.useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(
      (lead) => !['closing', 'disqualified', 'invalid'].includes(lead.status)
    ).length;

    // This week's leads (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekLeads = leads.filter(
      (lead) => lead.createdDate >= weekAgo
    ).length;

    // Closing soon (est_sent + appointment statuses)
    const closingSoonLeads = leads.filter(
      (lead) => lead.status === 'est_sent' || lead.status === 'appointment'
    ).length;

    return {
      total: totalLeads,
      active: activeLeads,
      thisWeek: thisWeekLeads,
      closingSoon: closingSoonLeads,
    };
  }, [leads]);

  const replaceTemplateVariables = (text: string, lead: Lead): string => {
    return text
      .replace(/\{firstName\}/g, lead.firstName || '')
      .replace(/\{lastName\}/g, lead.lastName || '')
      .replace(/\{fullName\}/g, lead.fullName || '')
      .replace(/\{address\}/g, lead.fullAddress || '')
      .replace(/\{fullAddress\}/g, lead.fullAddress || '')
      .replace(/\{street\}/g, lead.street || '')
      .replace(/\{city\}/g, lead.city || '')
      .replace(/\{state\}/g, lead.state || '')
      .replace(/\{zipCode\}/g, lead.zipCode || '')
      .replace(/\{zip\}/g, lead.zipCode || '')
      .replace(/\{county\}/g, lead.county || '')
      .replace(/\{phone\}/g, lead.phoneNumbers?.[0] || '')
      .replace(/\{phoneNumber\}/g, lead.phoneNumbers?.[0] || '')
      .replace(/\{email\}/g, lead.emails?.[0] || '')
      .replace(/\{emailAddress\}/g, lead.emails?.[0] || '')
      .replace(/\{permitType\}/g, lead.permitType.replace(/_/g, ' ').replace(/permits/i, '').trim() || '')
      .replace(/\{permitNumber\}/g, lead.permitNumber || '')
      .replace(/\{permitDate\}/g, lead.permitDate ? new Date(lead.permitDate).toLocaleDateString() : '')
      .replace(/\{description\}/g, lead.description || '')
      .replace(/\{contractorName\}/g, lead.licensedName || '')
      .replace(/\{licensedName\}/g, lead.licensedName || '')
      .replace(/\{contractorLicense\}/g, lead.licensedContractorNumber || '')
      .replace(/\{licenseNumber\}/g, lead.licensedContractorNumber || '')
      .replace(/\{contractorPhone\}/g, lead.licensedContact || '')
      .replace(/\{contractorContact\}/g, lead.licensedContact || '');
  };

  const handleCopyTemplate = async (template: Template) => {
    if (!selectedLead) return;

    try {
      haptics.light();
      const populatedBody = replaceTemplateVariables(template.body, selectedLead);
      const populatedSubject = template.subject ? replaceTemplateVariables(template.subject, selectedLead) : '';

      const textToCopy = template.subject
        ? `Subject: ${populatedSubject}\n\n${populatedBody}`
        : populatedBody;

      await Clipboard.setStringAsync(textToCopy);
      await incrementTemplateUsage(template.id);
      haptics.success();
      showToast.success('Template copied!', `"${template.name}" copied with lead data`);

      // Close bottom sheet or dialog depending on platform
      if (Platform.OS === 'web') {
        setShowTemplateDialog(false);
      } else {
        templateBottomSheetRef.current?.dismiss();
      }
    } catch (error) {
      console.error('Error copying template:', error);
      haptics.error();
      showToast.error('Failed to copy template', 'Please try again');
    }
  };

  const renderLeadCard = ({ item }: { item: Lead }) => (
    <LeadCard
      lead={item}
      onPress={() => {
        if (item.id) {
          navigation.navigate('LeadDetail', { leadId: item.id });
        }
      }}
      onQuickAction={(action, phone, email) => {
        if (action === 'template') {
          setSelectedLead(item);
          if (Platform.OS === 'web') {
            setShowTemplateDialog(true);
          } else {
            templateBottomSheetRef.current?.present();
          }
        }
      }}
    />
  );

  // Updated to 6-stage pipeline
  const statusFilters = ['all', 'new', 'contacted', 'engaged', 'est_sent', 'appointment', 'closing'];

  const permitTypes = [
    { id: 'all', label: 'All Permits', icon: 'view-grid' },
    { id: 'pool_permits', label: 'Pool', icon: 'pool' },
    { id: 'kitchen_bath_permits', label: 'Kitchen & Bath', icon: 'silverware-fork-knife' },
    { id: 'roof_permits', label: 'Roof', icon: 'home-roof' },
  ];

  // Calculate lead counts per permit type
  const getPermitTypeCount = (permitType: string) => {
    if (permitType === 'all') {
      return leads.length;
    }
    return leads.filter((lead) => lead.permitType === permitType).length;
  };

  // Responsive permit card width
  const permitCardWidth = isMobile ? 85 : isTablet ? '23%' : '22%';

  // Render permit type cards
  const renderPermitTypeCards = () => {
    const cards = permitTypes.map((permit) => {
      const count = getPermitTypeCount(permit.id);
      const isSelected = selectedPermitType === permit.id;
      return (
        <TouchableOpacity
          key={permit.id}
          style={[
            styles.permitTypeCard,
            isMobile && styles.permitTypeCardMobile,
            {
              width: permitCardWidth,
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.surface,
              borderColor: isSelected ? theme.colors.primary : currentTheme.border,
            },
            isSelected ? shadows.md : shadows.sm,
          ]}
          onPress={() => setSelectedPermitType(permit.id as PermitType | 'all')}
          activeOpacity={0.8}
        >
          {/* Count Badge */}
          <View
            style={[
              styles.countBadge,
              isMobile && styles.countBadgeMobile,
              {
                backgroundColor: isSelected
                  ? 'rgba(255, 255, 255, 0.95)'
                  : theme.colors.primaryContainer,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: isSelected
                  ? theme.colors.primary
                  : theme.colors.onPrimaryContainer,
                fontWeight: '700',
                fontSize: isMobile ? 9 : undefined,
              }}
            >
              {count}
            </Text>
          </View>
          <Icon
            name={permit.icon}
            size={isMobile ? 22 : 32}
            color={isSelected ? '#FFFFFF' : theme.colors.primary}
          />
          <Text
            variant={isMobile ? 'labelSmall' : 'labelMedium'}
            style={{
              color: isSelected ? '#FFFFFF' : theme.colors.onSurface,
              marginTop: isMobile ? 4 : spacing.sm,
              textAlign: 'center',
              fontWeight: '600',
              fontSize: isMobile ? 10 : undefined,
              lineHeight: isMobile ? 12 : undefined,
            }}
          >
            {permit.label}
          </Text>
        </TouchableOpacity>
      );
    });

    return cards;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <WebContainer noPadding>
        {/* Header with LABEL branding */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.surface, borderColor: currentTheme.border, marginHorizontal: containerPadding, marginTop: spacing.xs }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.brandLabel, { color: theme.colors.primary }]}>LABEL</Text>
              <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                {selectedPermitType === 'all'
                  ? 'All Leads'
                  : selectedPermitType === 'pool_permits'
                  ? 'Pool Leads'
                  : selectedPermitType === 'kitchen_bath_permits'
                  ? 'Kitchen & Bath Leads'
                  : 'Roof Leads'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: currentTheme.surface }]}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Icon name="bell" size={20} color={theme.colors.onSurface} />
                {(stats.thisWeek > 0) && (
                  <View style={[styles.notificationBadge, { backgroundColor: currentTheme.coral }]}>
                    <Text style={styles.notificationBadgeText}>{stats.thisWeek}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={[styles.summaryStatCard, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.summaryStatValue, { color: currentTheme.badgeNew }]}>{stats.thisWeek}</Text>
              <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>New today</Text>
            </View>
            <View style={[styles.summaryStatCard, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.summaryStatValue, { color: currentTheme.coral }]}>
                {leads.filter(l => {
                  const daysSinceCreated = Math.floor((new Date().getTime() - l.createdDate.getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceCreated > 2 && l.status !== 'new';
                }).length}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>Need follow-up</Text>
            </View>
            <View style={[styles.summaryStatCard, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.summaryStatValue, { color: currentTheme.badgeEstSent }]}>{stats.total}</Text>
              <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>Total pipeline</Text>
            </View>
          </View>
        </Surface>

        {/* Permit Type Selector */}
        {isMobile ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.permitTypesScrollContainer, { paddingHorizontal: containerPadding }]}
            style={styles.permitTypesScrollView}
          >
            {renderPermitTypeCards()}
          </ScrollView>
        ) : (
          <View style={[styles.permitTypesContainer, { padding: containerPadding, paddingBottom: spacing.xs, paddingTop: spacing.xs }]}>
            {renderPermitTypeCards()}
          </View>
        )}

        {/* Search Bar */}
        <Searchbar
          placeholder={isMobile ? "Search leads..." : "Search by name, address, phone, or email..."}
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={(e) => {
            // Prevent default form submission on web
            if (Platform.OS === 'web') {
              e.preventDefault?.();
            }
          }}
          returnKeyType="search"
          blurOnSubmit={false}
          style={[
            styles.searchBar,
            isMobile && styles.searchBarMobile,
            {
              backgroundColor: theme.colors.surface,
              marginHorizontal: containerPadding,
              marginBottom: isMobile ? 4 : spacing.xs,
              marginTop: isMobile ? 4 : spacing.xs,
            },
          ]}
          iconColor={theme.colors.primary}
          elevation={1}
          inputStyle={isMobile ? styles.searchInputMobile : undefined}
        />

        {/* Status Filters with Stale Toggle */}
        <View style={[styles.filtersContainer, { paddingHorizontal: isMobile ? 0 : containerPadding, paddingBottom: isMobile ? 4 : spacing.xs }]}>
          {!isMobile && (
            <Text
              variant="labelMedium"
              style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Filter:
            </Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.filters,
              isMobile && { paddingHorizontal: containerPadding },
            ]}
          >
            {statusFilters.map((status) => (
              <Chip
                key={status}
                selected={statusFilter === status}
                onPress={() => setStatusFilter(status)}
                style={[styles.filterChip, isMobile && styles.filterChipMobile]}
                mode={statusFilter === status ? 'flat' : 'outlined'}
                compact={isMobile}
                textStyle={isMobile ? styles.filterChipTextMobile : undefined}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            ))}

            {/* Stale Filter Toggle at end of status filters */}
            <Chip
              selected={showStaleOnly}
              onPress={() => setShowStaleOnly(!showStaleOnly)}
              compact={isMobile}
              icon={showStaleOnly ? 'clock-alert' : 'clock-outline'}
              style={[
                {
                  backgroundColor: showStaleOnly ? currentTheme.coral : theme.colors.surface,
                  borderColor: currentTheme.coral,
                  borderWidth: showStaleOnly ? 0 : 1,
                  marginLeft: isMobile ? 6 : spacing.sm,
                },
                isMobile && styles.filterChipMobile,
              ]}
              textStyle={[
                { color: showStaleOnly ? '#fff' : currentTheme.coral },
                isMobile && styles.filterChipTextMobile,
              ]}
            >
              Stale Only
            </Chip>
          </ScrollView>
        </View>

        {/* Lead Count with Grouping Toggle */}
        <View style={[styles.countContainer, { paddingHorizontal: containerPadding, paddingBottom: isMobile ? 4 : spacing.xs, paddingTop: isMobile ? 4 : spacing.xs }]}>
          <View style={styles.countRow}>
            <View style={{ flex: 1 }}>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: '700',
                  fontSize: isMobile ? 15 : 17,
                  letterSpacing: -0.3,
                }}
              >
                {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
              </Text>
              {searchQuery || statusFilter !== 'all' || selectedPermitType !== 'all' ? (
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginTop: isMobile ? 2 : spacing.xs,
                    fontSize: isMobile ? 11 : 13,
                  }}
                >
                  Filtered from {leads.length} total
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                setGroupByTime(!groupByTime);
              }}
              style={[
                styles.groupToggle,
                {
                  backgroundColor: groupByTime
                    ? currentTheme.primary + '15'
                    : currentTheme.surface,
                  borderColor: groupByTime
                    ? currentTheme.primary
                    : currentTheme.border,
                },
              ]}
            >
              <Icon
                name={groupByTime ? 'calendar-clock' : 'format-list-bulleted'}
                size={16}
                color={groupByTime ? currentTheme.primary : currentTheme.textSecondary}
              />
              <Text
                style={[
                  styles.groupToggleText,
                  {
                    color: groupByTime ? currentTheme.primary : currentTheme.textSecondary,
                  },
                ]}
              >
                {groupByTime ? 'Grouped' : 'List'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leads List */}
        {isLoading ? (
          <DashboardSkeleton count={isMobile ? 5 : 8} />
        ) : (
          <SectionList
            sections={leadSections}
            renderItem={renderLeadCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { padding: containerPadding, paddingTop: 0 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderSectionHeader={({ section }) => {
              // Don't render header if grouping is disabled or title is empty
              if (!groupByTime || !section.title) return null;

              return (
                <View
                  style={[
                    styles.sectionHeader,
                    {
                      backgroundColor: theme.dark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)',
                      borderBottomColor: currentTheme.border,
                      borderLeftColor: currentTheme.primary,
                    },
                  ]}
                >
                  <Icon
                    name="calendar-clock"
                    size={14}
                    color={currentTheme.primary}
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text
                    style={[
                      styles.sectionHeaderText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {section.title}
                  </Text>
                </View>
              );
            }}
            stickySectionHeadersEnabled={true}
            ListEmptyComponent={
              searchQuery || statusFilter !== 'all' || selectedPermitType !== 'all' ? (
                // Filtered results empty state
                <EmptyState
                  icon="filter-off-outline"
                  title="No Leads Match Your Filters"
                  description="Try adjusting your filters or search query to see more results"
                  variant="minimal"
                  primaryAction={{
                    label: 'Clear Filters',
                    onPress: () => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSelectedPermitType('all');
                      setShowStaleOnly(false);
                    },
                    icon: 'filter-remove',
                  }}
                  helpText="Tip: Use the 'All Permits' filter to see all your leads at once"
                />
              ) : (
                // Initial empty state (no leads at all)
                <EmptyState
                  icon="folder-open-outline"
                  title="No Leads Yet"
                  description="Your lead pipeline is empty. Get started by importing leads from your permit data source."
                  variant="educational"
                  tips={[
                    'Leads are automatically synced from your permit database',
                    'Filter by permit type to focus on specific opportunities',
                    'Use templates to quickly reach out to homeowners',
                  ]}
                  sampleItems={['Pool Permits', 'Kitchen & Bath', 'Roof Permits']}
                  helpText="Need help getting started? Check your data source connection in Settings"
                  primaryAction={{
                    label: 'Go to Settings',
                    onPress: () => navigation.navigate('Settings'),
                    icon: 'cog-outline',
                  }}
                />
              )
            }
          />
        )}
      </WebContainer>

      {/* Template Selection Dialog (Web only - Mobile uses BottomSheet) */}
      <Portal>
        <Dialog
          visible={showTemplateDialog}
          onDismiss={() => setShowTemplateDialog(false)}
          style={{ backgroundColor: theme.colors.surface, maxHeight: '80%' }}
        >
          <Dialog.Title style={{ fontFamily: 'DMSans_700Bold', fontSize: 18, color: currentTheme.text }}>
            Select Template
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 400 }}>
              {/* Homeowner Email Templates */}
              {templates.filter(t => t.category === 'homeowner_email').length > 0 && (
                <>
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.8, color: currentTheme.textSecondary, marginBottom: spacing.xs }}>
                    HOMEOWNER EMAIL
                  </Text>
                  {templates
                    .filter(t => t.category === 'homeowner_email')
                    .map(template => (
                      <View
                        key={template.id}
                        style={[
                          styles.templateItem,
                          {
                            backgroundColor: currentTheme.surface,
                            borderColor: currentTheme.border,
                          },
                        ]}
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
                            {template.body}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                          <TouchableOpacity
                            style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                            onPress={() => {
                              if (!selectedLead) return;
                              const populatedBody = replaceTemplateVariables(template.body, selectedLead);
                              const populatedSubject = template.subject ? replaceTemplateVariables(template.subject, selectedLead) : '';
                              const primaryEmail = selectedLead.emails?.[0] || '';
                              const encodedSubject = encodeURIComponent(populatedSubject);
                              const encodedBody = encodeURIComponent(populatedBody);
                              const mailtoURL = `mailto:${primaryEmail}?subject=${encodedSubject}&body=${encodedBody}`;
                              Linking.openURL(mailtoURL);
                              if (Platform.OS === 'web') {
                                setShowTemplateDialog(false);
                              } else {
                                templateBottomSheetRef.current?.dismiss();
                              }
                            }}
                          >
                            <Icon name="email-open-outline" size={18} color={currentTheme.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                            onPress={() => handleCopyTemplate(template)}
                          >
                            <Icon name="content-copy" size={18} color={currentTheme.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </>
              )}

              {/* Homeowner SMS Templates */}
              {templates.filter(t => t.category === 'homeowner_text').length > 0 && (
                <>
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.8, color: currentTheme.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }}>
                    HOMEOWNER TEXT MESSAGE
                  </Text>
                  {templates
                    .filter(t => t.category === 'homeowner_text')
                    .map(template => (
                      <View
                        key={template.id}
                        style={[
                          styles.templateItem,
                          {
                            backgroundColor: currentTheme.surface,
                            borderColor: currentTheme.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: currentTheme.text }}>
                            {template.name}
                          </Text>
                          <Text
                            style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: currentTheme.textTertiary, marginTop: spacing.xs }}
                            numberOfLines={2}
                          >
                            {template.body}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                          <TouchableOpacity
                            style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                            onPress={() => {
                              if (!selectedLead) return;
                              const populatedBody = replaceTemplateVariables(template.body, selectedLead);
                              const primaryPhone = selectedLead.phoneNumbers?.[0] || '';
                              const encodedBody = encodeURIComponent(populatedBody);
                              const smsURL = Platform.OS === 'ios'
                                ? `sms:${primaryPhone}&body=${encodedBody}`
                                : `sms:${primaryPhone}?body=${encodedBody}`;
                              Linking.openURL(smsURL);
                              if (Platform.OS === 'web') {
                                setShowTemplateDialog(false);
                              } else {
                                templateBottomSheetRef.current?.dismiss();
                              }
                            }}
                          >
                            <Icon name="message-text-outline" size={18} color={currentTheme.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                            onPress={() => handleCopyTemplate(template)}
                          >
                            <Icon name="content-copy" size={18} color={currentTheme.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </>
              )}

              {/* No templates message */}
              {templates.filter(t => t.category === 'homeowner_email' || t.category === 'homeowner_text').length === 0 && (
                <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                  <Icon name="text-box-off-outline" size={48} color={currentTheme.textTertiary} />
                  <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: currentTheme.textSecondary, marginTop: spacing.md, textAlign: 'center' }}>
                    No homeowner templates available
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: currentTheme.textTertiary, marginTop: spacing.xs, textAlign: 'center' }}>
                    Create templates in the Templates tab
                  </Text>
                </View>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTemplateDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Template Selection Bottom Sheet (Mobile only) */}
      {Platform.OS !== 'web' && (
        <BottomSheet
          ref={templateBottomSheetRef}
          title="Select Template"
          snapPoints={['65%', '90%']}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Homeowner Email Templates */}
            {templates.filter(t => t.category === 'homeowner_email').length > 0 && (
              <>
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.8, color: currentTheme.textSecondary, marginBottom: spacing.xs }}>
                  HOMEOWNER EMAIL
                </Text>
                {templates
                  .filter(t => t.category === 'homeowner_email')
                  .map(template => (
                    <View
                      key={template.id}
                      style={[
                        styles.templateItem,
                        {
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                        },
                      ]}
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
                          {template.body}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                        <TouchableOpacity
                          style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                          onPress={() => {
                            if (!selectedLead) return;
                            const populatedBody = replaceTemplateVariables(template.body, selectedLead);
                            const populatedSubject = template.subject ? replaceTemplateVariables(template.subject, selectedLead) : '';
                            const primaryEmail = selectedLead.emails?.[0] || '';
                            const encodedSubject = encodeURIComponent(populatedSubject);
                            const encodedBody = encodeURIComponent(populatedBody);
                            const mailtoURL = `mailto:${primaryEmail}?subject=${encodedSubject}&body=${encodedBody}`;
                            Linking.openURL(mailtoURL);
                            templateBottomSheetRef.current?.dismiss();
                          }}
                        >
                          <Icon name="email-open-outline" size={18} color={currentTheme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                          onPress={() => handleCopyTemplate(template)}
                        >
                          <Icon name="content-copy" size={18} color={currentTheme.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </>
            )}

            {/* Homeowner SMS Templates */}
            {templates.filter(t => t.category === 'homeowner_text').length > 0 && (
              <>
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.8, color: currentTheme.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }}>
                  HOMEOWNER TEXT MESSAGE
                </Text>
                {templates
                  .filter(t => t.category === 'homeowner_text')
                  .map(template => (
                    <View
                      key={template.id}
                      style={[
                        styles.templateItem,
                        {
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: currentTheme.text }}>
                          {template.name}
                        </Text>
                        <Text
                          style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: currentTheme.textTertiary, marginTop: spacing.xs }}
                          numberOfLines={2}
                        >
                          {template.body}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                        <TouchableOpacity
                          style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                          onPress={() => {
                            if (!selectedLead) return;
                            const populatedBody = replaceTemplateVariables(template.body, selectedLead);
                            const primaryPhone = selectedLead.phoneNumbers?.[0] || '';
                            const encodedBody = encodeURIComponent(populatedBody);
                            const smsURL = Platform.OS === 'ios'
                              ? `sms:${primaryPhone}&body=${encodedBody}`
                              : `sms:${primaryPhone}?body=${encodedBody}`;
                            Linking.openURL(smsURL);
                            templateBottomSheetRef.current?.dismiss();
                          }}
                        >
                          <Icon name="message-text-outline" size={18} color={currentTheme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.templateActionButton, { backgroundColor: currentTheme.primary + '15' }]}
                          onPress={() => handleCopyTemplate(template)}
                        >
                          <Icon name="content-copy" size={18} color={currentTheme.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </>
            )}

            {/* No templates message */}
            {templates.filter(t => t.category === 'homeowner_email' || t.category === 'homeowner_text').length === 0 && (
              <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                <Icon name="text-box-off-outline" size={48} color={currentTheme.textTertiary} />
                <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: currentTheme.textSecondary, marginTop: spacing.md, textAlign: 'center' }}>
                  No homeowner templates available
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: currentTheme.textTertiary, marginTop: spacing.xs, textAlign: 'center' }}>
                  Create templates in the Templates tab
                </Text>
              </View>
            )}
          </ScrollView>
        </BottomSheet>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    ...shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: 'DMSans_800ExtraBold',
    fontSize: 20,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  summaryStatCard: {
    flex: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontFamily: 'DMSans_800ExtraBold',
    fontSize: 18,
  },
  summaryStatLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...shadows.sm,
  },
  statValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  permitTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  permitTypesScrollContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  permitTypesScrollView: {
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
  permitTypeCard: {
    minWidth: 85,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    position: 'relative',
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
  permitTypeCardMobile: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 75,
    maxWidth: 80,
    minHeight: 70,
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    minWidth: 28,              // Slightly larger
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    zIndex: 1,
    ...shadows.sm,             // Add subtle shadow
  },
  countBadgeMobile: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    top: 6,
    right: 6,
  },
  searchBar: {
    borderRadius: borderRadius.xl, // More rounded
    elevation: 2,               // Slight elevation
  },
  searchBarMobile: {
    height: 38,                 // Compact for more space
    borderRadius: borderRadius.lg,
  },
  searchInputMobile: {
    fontSize: 14,               // Compact font size
    minHeight: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginRight: spacing.sm,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  filterChipMobile: {
    height: 28,                 // Compact height
    marginVertical: 0,
    marginRight: 6,             // Tighter spacing between chips
  },
  filterChipTextMobile: {
    fontSize: 12,               // Smaller text
    marginVertical: 0,
  },
  countContainer: {
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  groupToggleText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  list: {
    paddingTop: 0,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  templateActionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  sectionHeaderText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
