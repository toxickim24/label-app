/**
 * Dashboard Screen
 * Main screen showing leads
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Searchbar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useLeadsStore } from '../../store';
import { subscribeToLeads } from '../../services/leadsService';
import { Lead, PermitType } from '../../types';
import { getStatusColor } from '../../theme';
import { spacing } from '../../theme';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  console.log('📊 DashboardScreen rendering...');

  const theme = useTheme();
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
    const unsubscribe = subscribeToLeads('all', statusFilter, (fetchedLeads) => {
      console.log(`✅ Received ${fetchedLeads.length} leads from Firestore`);
      setLeads(fetchedLeads);
    });

    return () => {
      console.log('🔌 Cleaning up Firestore subscription');
      unsubscribe();
    };
  }, [statusFilter, setLeads]);

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
          lead.recordId.toLowerCase().includes(query) ||
          lead.fullName.toLowerCase().includes(query) ||
          lead.city.toLowerCase().includes(query) ||
          lead.fullAddress.toLowerCase().includes(query) ||
          lead.phone1.includes(query) ||
          lead.email1.toLowerCase().includes(query)
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

  const renderLeadCard = ({ item }: { item: Lead }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('LeadDetail', { leadId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium">{item.recordId}</Text>
            <Chip
              mode="flat"
              style={{
                backgroundColor: getStatusColor(item.status, theme.dark),
              }}
              textStyle={{ color: '#fff', fontSize: 12 }}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>

          <Text variant="titleLarge" style={styles.name}>
            {item.fullName}
          </Text>

          <Text variant="bodyMedium" style={styles.address}>
            {item.fullAddress}
          </Text>

          <View style={styles.footer}>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              {item.permitType.replace('_', ' ').toUpperCase()}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              {new Date(item.createdDate).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const statusFilters = ['all', 'new', 'contacted', 'responded', 'qualified'];

  const permitTypes = [
    { id: 'all', label: 'All Permits', icon: 'view-grid' },
    { id: 'pool_permits', label: 'Pool', icon: 'pool' },
    { id: 'kitchen_permits', label: 'Kitchen', icon: 'silverware-fork-knife' },
    { id: 'bath_permits', label: 'Bath', icon: 'shower' },
    { id: 'roof_permits', label: 'Roof', icon: 'home-roof' },
  ];

  // Calculate lead counts per permit type
  const getPermitTypeCount = (permitType: string) => {
    if (permitType === 'all') {
      return leads.length;
    }
    return leads.filter((lead) => lead.permitType === permitType).length;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Permit Type Selector */}
      <View style={styles.permitTypesContainer}>
        {permitTypes.map((permit) => {
          const count = getPermitTypeCount(permit.id);
          return (
            <TouchableOpacity
              key={permit.id}
              style={[
                styles.permitTypeCard,
                {
                  backgroundColor: selectedPermitType === permit.id
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setSelectedPermitType(permit.id as PermitType | 'all')}
            >
              {/* Count Badge */}
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: selectedPermitType === permit.id
                      ? 'rgba(255, 255, 255, 0.9)'
                      : theme.colors.primaryContainer,
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: selectedPermitType === permit.id
                      ? theme.colors.primary
                      : theme.colors.onPrimaryContainer,
                    fontWeight: '700',
                    fontSize: 10,
                  }}
                >
                  {count}
                </Text>
              </View>
              <Icon
                name={permit.icon}
                size={28}
                color={selectedPermitType === permit.id ? '#fff' : theme.colors.primary}
              />
              <Text
                variant="labelSmall"
                style={{
                  color: selectedPermitType === permit.id ? '#fff' : theme.colors.onSurface,
                  marginTop: 4,
                  textAlign: 'center',
                  fontSize: 11,
                }}
              >
                {permit.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search leads..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Status Filters */}
      <View style={styles.filters}>
        {statusFilters.map((status) => (
          <Chip
            key={status}
            selected={statusFilter === status}
            onPress={() => setStatusFilter(status)}
            style={styles.filterChip}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chip>
        ))}
      </View>

      {/* Lead Count */}
      <View style={styles.countContainer}>
        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
          {filteredLeads.length} leads found
        </Text>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        renderItem={renderLeadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>
              No leads found
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: 8 }}>
              Try adjusting your filters or search query
            </Text>
          </View>
        }
      />
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
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  permitTypeCard: {
    width: '18%',
    minWidth: 70,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  searchBar: {
    margin: spacing.md,
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  countContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  address: {
    marginBottom: spacing.md,
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
  },
});
