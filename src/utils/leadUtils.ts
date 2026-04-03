/**
 * Lead Utilities
 * Helper functions for lead management
 */

import { Lead, LeadStatus } from '../types';

/**
 * Check if a lead is stale (not contacted in 48 hours)
 * A lead is considered stale if:
 * 1. Never contacted and created more than 48 hours ago
 * 2. Last contacted more than 48 hours ago
 */
export const isLeadStale = (lead: Lead): boolean => {
  const HOURS_THRESHOLD = 48;
  const now = Date.now();

  if (!lead.lastContactedAt) {
    // If never contacted, check if created more than 48 hours ago
    const hoursSinceCreation = (now - lead.createdDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation > HOURS_THRESHOLD;
  }

  // Check if last contacted more than 48 hours ago
  const hoursSinceContact = (now - lead.lastContactedAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceContact > HOURS_THRESHOLD;
};

/**
 * Get hours since last contact (or creation if never contacted)
 */
export const getHoursSinceContact = (lead: Lead): number => {
  const now = Date.now();

  if (!lead.lastContactedAt) {
    return (now - lead.createdDate.getTime()) / (1000 * 60 * 60);
  }

  return (now - lead.lastContactedAt.getTime()) / (1000 * 60 * 60);
};

/**
 * Get human-readable time since last contact
 */
export const getTimeSinceContact = (lead: Lead): string => {
  const hours = getHoursSinceContact(lead);

  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  if (hours < 24) {
    const roundedHours = Math.floor(hours);
    return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

/**
 * Check if lead is in active pipeline (not closing or disqualified)
 */
export const isLeadActive = (lead: Lead): boolean => {
  const inactiveStatuses: LeadStatus[] = ['closing', 'disqualified', 'invalid', 'converted'];
  return !inactiveStatuses.includes(lead.status);
};

/**
 * Check if lead is high priority (new and stale)
 */
export const isHighPriority = (lead: Lead): boolean => {
  return lead.status === 'new' && isLeadStale(lead);
};

/**
 * Get lead priority score (higher = more urgent)
 */
export const getLeadPriorityScore = (lead: Lead): number => {
  let score = 0;

  // High priority for stale leads
  if (isLeadStale(lead)) {
    score += 100;
  }

  // Priority by status (earlier stages are higher priority)
  const statusPriority: Record<LeadStatus, number> = {
    'new': 50,
    'contacted': 40,
    'engaged': 30,
    'est_sent': 20,
    'appointment': 10,
    'closing': 5,
    'responded': 35,
    'qualified': 25,
    'disqualified': 0,
    'converted': 0,
    'invalid': 0,
  };

  score += statusPriority[lead.status] || 0;

  // Bonus for recent leads
  const daysSinceCreation = (Date.now() - lead.createdDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 7) {
    score += 10;
  }

  return score;
};

/**
 * Sort leads by priority (high to low)
 */
export const sortByPriority = (leads: Lead[]): Lead[] => {
  return [...leads].sort((a, b) => {
    return getLeadPriorityScore(b) - getLeadPriorityScore(a);
  });
};

/**
 * Sort leads by newest first
 */
export const sortByNewest = (leads: Lead[]): Lead[] => {
  return [...leads].sort((a, b) => {
    return b.createdDate.getTime() - a.createdDate.getTime();
  });
};

/**
 * Sort leads by oldest first
 */
export const sortByOldest = (leads: Lead[]): Lead[] => {
  return [...leads].sort((a, b) => {
    return a.createdDate.getTime() - b.createdDate.getTime();
  });
};

/**
 * Filter leads by status
 */
export const filterByStatus = (leads: Lead[], status: LeadStatus | 'all'): Lead[] => {
  if (status === 'all') {
    return leads;
  }
  return leads.filter(lead => lead.status === status);
};

/**
 * Filter leads to show only stale ones
 */
export const filterStaleLeads = (leads: Lead[]): Lead[] => {
  return leads.filter(isLeadStale);
};

/**
 * Filter leads to show only active ones
 */
export const filterActiveLeads = (leads: Lead[]): Lead[] => {
  return leads.filter(isLeadActive);
};

/**
 * Get lead stats
 */
export interface LeadStats {
  total: number;
  active: number;
  stale: number;
  newToday: number;
  newThisWeek: number;
  closingSoon: number;
  byStatus: Record<LeadStatus, number>;
}

export const getLeadStats = (leads: Lead[]): LeadStats => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats: LeadStats = {
    total: leads.length,
    active: filterActiveLeads(leads).length,
    stale: filterStaleLeads(leads).length,
    newToday: leads.filter(l => l.createdDate >= todayStart).length,
    newThisWeek: leads.filter(l => l.createdDate >= weekAgo).length,
    closingSoon: leads.filter(l => l.status === 'est_sent' || l.status === 'appointment').length,
    byStatus: {} as Record<LeadStatus, number>,
  };

  // Count by status
  const allStatuses: LeadStatus[] = [
    'new', 'contacted', 'engaged', 'est_sent', 'appointment', 'closing',
    'responded', 'qualified', 'disqualified', 'converted', 'invalid'
  ];

  allStatuses.forEach(status => {
    stats.byStatus[status] = leads.filter(l => l.status === status).length;
  });

  return stats;
};
