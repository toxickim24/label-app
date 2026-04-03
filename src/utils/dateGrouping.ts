/**
 * Date Grouping Utilities
 * Group leads by time periods
 */

import { Lead } from '../types';

export type TimeGroup = 'today' | 'this_week' | 'this_month' | 'older';

export interface GroupedLeads {
  today: Lead[];
  this_week: Lead[];
  this_month: Lead[];
  older: Lead[];
}

export interface LeadSection {
  title: string;
  data: Lead[];
  key: TimeGroup | 'all';
}

/**
 * Get the time group for a lead based on its creation date
 */
export const getTimeGroup = (lead: Lead): TimeGroup => {
  const now = new Date();
  const leadDate = new Date(lead.createdDate);

  // Reset hours for accurate day comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const leadDateStart = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

  // Check if today
  if (leadDateStart.getTime() === todayStart.getTime()) {
    return 'today';
  }

  // Check if this week (last 7 days)
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (leadDate >= weekAgo) {
    return 'this_week';
  }

  // Check if this month (last 30 days)
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  if (leadDate >= monthAgo) {
    return 'this_month';
  }

  // Older than 30 days
  return 'older';
};

/**
 * Group leads by time period
 */
export const groupLeadsByTime = (leads: Lead[]): GroupedLeads => {
  const grouped: GroupedLeads = {
    today: [],
    this_week: [],
    this_month: [],
    older: [],
  };

  leads.forEach(lead => {
    const group = getTimeGroup(lead);
    grouped[group].push(lead);
  });

  return grouped;
};

/**
 * Convert grouped leads to sections for SectionList
 */
export const getLeadSections = (leads: Lead[]): LeadSection[] => {
  const grouped = groupLeadsByTime(leads);
  const sections: LeadSection[] = [];

  if (grouped.today.length > 0) {
    sections.push({
      title: `Today (${grouped.today.length})`,
      data: grouped.today,
      key: 'today',
    });
  }

  if (grouped.this_week.length > 0) {
    sections.push({
      title: `This Week (${grouped.this_week.length})`,
      data: grouped.this_week,
      key: 'this_week',
    });
  }

  if (grouped.this_month.length > 0) {
    sections.push({
      title: `This Month (${grouped.this_month.length})`,
      data: grouped.this_month,
      key: 'this_month',
    });
  }

  if (grouped.older.length > 0) {
    sections.push({
      title: `Older (${grouped.older.length})`,
      data: grouped.older,
      key: 'older',
    });
  }

  return sections;
};

/**
 * Get friendly time group label
 */
export const getTimeGroupLabel = (group: TimeGroup): string => {
  switch (group) {
    case 'today':
      return 'Today';
    case 'this_week':
      return 'This Week';
    case 'this_month':
      return 'This Month';
    case 'older':
      return 'Older';
    default:
      return 'Unknown';
  }
};
