/**
 * Dashboard Screen
 * Main screen showing leads
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Text, Card, Chip, Searchbar, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useLeadsStore } from '../../store';
import { subscribeToLeads } from '../../services/leadsService';
import { Lead, PermitType } from '../../types';
import { getStatusColor } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme';
import WebContainer from '../../components/WebContainer';
import EmptyState from '../../components/EmptyState';
import { getLeadHealth, getLeadHealthInfo } from '../../utils/leadHealth';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { useResponsive } from '../../hooks/useResponsive';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  console.log('📊 DashboardScreen rendering...');

  const theme = useTheme();
  const { isMobile, isTablet, containerPadding } = useResponsive();
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
  const [selectedPermitType, setSelectedPermitType] = React.useState<PermitType | 'all'>('all');

  // Subscribe to Firestore leads in real-time
  // Note: We fetch ALL leads and filter locally for better UX (instant filtering)
  useEffect(() => {
    console.log('📡 Setting up Firestore subscription...');
    const unsubscribe = subscribeToLeads('all', 'all', (fetchedLeads) => {
      console.log(`✅ Received ${fetchedLeads.length} leads from Firestore`);
      setLeads(fetchedLeads);
    });

    return () => {
      console.log('🔌 Cleaning up Firestore subscription');
      unsubscribe();
    };
  }, [setLeads]);

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

    // Sort by newest first
    return filtered.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }, [leads, selectedPermitType, statusFilter, searchQuery]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Data is already synced via real-time subscription
    // Just show refresh animation for user feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const renderLeadCard = ({ item }: { item: Lead }) => {
    const leadHealth = getLeadHealth(item);
    const healthInfo = getLeadHealthInfo(leadHealth);
    const lastActivityDate = item.lastContactedAt || item.createdDate;

    return (
      <TouchableOpacity
        onPress={() => {
          if (item.id) {
            navigation.navigate('LeadDetail', { leadId: item.id });
          }
        }}
        activeOpacity={0.8}
      >
        <Surface
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: healthInfo.color,
            },
            shadows.sm,
          ]}
        >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Icon
              name={
                item.permitType === 'pool_permits'
                  ? 'pool'
                  : item.permitType === 'kitchen_bath_permits'
                  ? 'silverware-fork-knife'
                  : 'home-roof'
              }
              size={20}
              color={theme.colors.primary}
              style={styles.cardIcon}
            />
            <Text
              variant="labelLarge"
              style={[styles.recordId, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.recordId}
            </Text>
          </View>
          <Chip
            mode="flat"
            compact
            style={{
              backgroundColor: getStatusColor(item.status, theme.dark),
              height: 28,
            }}
            textStyle={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
          {item.fullName}
        </Text>

        <View style={styles.addressRow}>
          <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
          <Text
            variant="bodyMedium"
            style={[styles.address, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.fullAddress}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.footerBadge}>
              <Text
                variant="labelSmall"
                style={[styles.footerBadgeText, { color: theme.colors.primary }]}
              >
                {item.permitType.replace(/_/g, ' ').replace('permits', '').trim().toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.footerRight}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatRelativeTime(lastActivityDate)}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
    );
  };

  const statusFilters = ['all', 'new', 'contacted', 'responded', 'qualified', 'disqualified', 'converted', 'invalid'];

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
              borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebContainer>
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
          <View style={[styles.permitTypesContainer, { padding: containerPadding, paddingBottom: spacing.lg }]}>
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
              marginBottom: isMobile ? spacing.sm : spacing.lg,
            },
          ]}
          iconColor={theme.colors.primary}
          elevation={1}
          inputStyle={isMobile ? styles.searchInputMobile : undefined}
        />

        {/* Status Filters */}
        <View style={[styles.filtersContainer, { paddingHorizontal: isMobile ? 0 : containerPadding }]}>
          {!isMobile && (
            <Text
              variant="labelMedium"
              style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Status:
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
                style={styles.filterChip}
                mode={statusFilter === status ? 'flat' : 'outlined'}
                compact={isMobile}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Lead Count */}
        <View style={[styles.countContainer, { paddingHorizontal: containerPadding }]}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
            {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
          </Text>
        </View>

        {/* Leads List */}
        <FlatList
          data={filteredLeads}
          renderItem={renderLeadCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { padding: containerPadding, paddingTop: 0 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="folder-open-outline"
              title="No Leads Found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Get started by importing leads or creating new ones'
              }
            />
          }
        />
      </WebContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permitTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  permitTypesScrollContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  permitTypesScrollView: {
    paddingVertical: spacing.sm,
    flexShrink: 0,
  },
  permitTypeCard: {
    minWidth: 80,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    position: 'relative',
    ...Platform.select({
      web: {
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
    }),
  },
  permitTypeCardMobile: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 80,
    maxWidth: 85,
    minHeight: 70,
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    zIndex: 1,
  },
  countBadgeMobile: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    top: 4,
    right: 4,
  },
  searchBar: {
    borderRadius: borderRadius.lg,
  },
  searchBarMobile: {
    height: 40,
    borderRadius: borderRadius.md,
  },
  searchInputMobile: {
    fontSize: 14,
    minHeight: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterLabel: {
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  countContainer: {
    paddingBottom: spacing.md,
  },
  list: {
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      web: {
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: spacing.sm,
  },
  recordId: {
    fontWeight: '600',
  },
  name: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  address: {
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  footerBadgeText: {
    fontWeight: '600',
    fontSize: 11,
  },
});
