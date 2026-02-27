/**
 * Lead Health Scoring System
 * Determines the health/engagement level of a lead
 */

import { Lead } from '../types';
import { getDaysSince } from './formatRelativeTime';

export type LeadHealth = 'hot' | 'warm' | 'cold' | 'risk';

export interface LeadHealthInfo {
  health: LeadHealth;
  color: string;
  label: string;
  description: string;
}

/**
 * Calculate lead health based on activity and status
 */
export function getLeadHealth(lead: Lead): LeadHealth {
  const lastActivityDate = lead.lastContactedAt || lead.createdDate;
  const daysSinceActivity = getDaysSince(lastActivityDate);

  // Hot leads: Recently responded or active
  if (lead.status === 'responded' && daysSinceActivity < 2) {
    return 'hot';
  }

  if (lead.status === 'qualified' && daysSinceActivity < 3) {
    return 'hot';
  }

  // Warm leads: Contacted recently
  if (lead.status === 'contacted' && daysSinceActivity < 5) {
    return 'warm';
  }

  if (lead.status === 'new' && daysSinceActivity < 3) {
    return 'warm';
  }

  if (daysSinceActivity < 7) {
    return 'warm';
  }

  // Cold leads: No recent activity
  if (daysSinceActivity < 14) {
    return 'cold';
  }

  // Risk leads: Old leads that need attention
  return 'risk';
}

/**
 * Get lead health information with color and labels
 */
export function getLeadHealthInfo(health: LeadHealth): LeadHealthInfo {
  const healthMap: Record<LeadHealth, LeadHealthInfo> = {
    hot: {
      health: 'hot',
      color: '#10B981',
      label: 'Hot Lead',
      description: 'Active and engaged',
    },
    warm: {
      health: 'warm',
      color: '#F59E0B',
      label: 'Warm Lead',
      description: 'Recently contacted',
    },
    cold: {
      health: 'cold',
      color: '#6B7280',
      label: 'Cold Lead',
      description: 'Low recent activity',
    },
    risk: {
      health: 'risk',
      color: '#EF4444',
      label: 'At Risk',
      description: 'Needs immediate attention',
    },
  };

  return healthMap[health];
}

/**
 * Calculate a numerical health score (0-100)
 * Higher score = healthier lead
 */
export function calculateLeadScore(lead: Lead): number {
  let score = 50; // Base score

  const lastActivityDate = lead.lastContactedAt || lead.createdDate;
  const daysSinceActivity = getDaysSince(lastActivityDate);

  // Recency scoring (0-30 points)
  if (daysSinceActivity === 0) {
    score += 30;
  } else if (daysSinceActivity < 3) {
    score += 25;
  } else if (daysSinceActivity < 7) {
    score += 15;
  } else if (daysSinceActivity < 14) {
    score += 5;
  } else {
    score -= 10;
  }

  // Status scoring (0-30 points)
  switch (lead.status) {
    case 'responded':
      score += 30;
      break;
    case 'qualified':
      score += 25;
      break;
    case 'contacted':
      score += 15;
      break;
    case 'new':
      score += 10;
      break;
    case 'disqualified':
    case 'invalid':
      score -= 20;
      break;
  }

  // Communication frequency scoring (0-20 points)
  const communicationCount = lead.communications?.length || 0;
  if (communicationCount > 5) {
    score += 20;
  } else if (communicationCount > 3) {
    score += 15;
  } else if (communicationCount > 1) {
    score += 10;
  } else if (communicationCount > 0) {
    score += 5;
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}
