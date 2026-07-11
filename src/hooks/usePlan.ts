import { useAuth } from '../contexts/AuthContext';
import { PlanTier } from '../types';

export const TIER_LIMITS = {
  'Free-Trial':     { maxRequests: Infinity, maxCategories: Infinity, teamMembers: 0,  analytics: true,  reports: true,  branches: 1 },
  'Basic':          { maxRequests: 200,      maxCategories: 3,         teamMembers: 0,  analytics: false, reports: false, branches: 1 },
  'Professional':   { maxRequests: Infinity, maxCategories: Infinity, teamMembers: Infinity, analytics: true, reports: true, branches: 5 },
  'Enterprise':     { maxRequests: Infinity, maxCategories: Infinity, teamMembers: Infinity, analytics: true, reports: true, branches: Infinity },
} as const;

export interface PlanInfo {
  tier: PlanTier;
  isFreeTrial: boolean;
  isBasic: boolean;
  isProfessional: boolean;
  isEnterprise: boolean;
  isExpired: boolean;
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
  hasAnalytics: boolean;
  hasReports: boolean;
  hasTeam: boolean;
  maxTeamMembers: number;
  maxCategories: number;
  maxBranches: number;
  isLockedOut: boolean;
  lockoutReason: 'expired' | 'request_limit' | null;
}

export function usePlan(): PlanInfo {
  const { office } = useAuth();

  const tier: PlanTier = office?.plan_tier ?? 'Free-Trial';
  const limits = TIER_LIMITS[tier];
  const requestsUsed = office?.monthly_request_counter ?? 0;
  const expiry = office?.subscription_expires_at;
  const isExpired = expiry ? new Date(expiry) < new Date() : false;
  const isBasicOverlimit = tier === 'Basic' && requestsUsed >= limits.maxRequests;
  const isLockedOut = isExpired || isBasicOverlimit;
  const lockoutReason: PlanInfo['lockoutReason'] = isBasicOverlimit
    ? 'request_limit'
    : isExpired ? 'expired' : null;

  return {
    tier,
    isFreeTrial: tier === 'Free-Trial',
    isBasic: tier === 'Basic',
    isProfessional: tier === 'Professional',
    isEnterprise: tier === 'Enterprise',
    isExpired,
    requestsUsed,
    requestsLimit: limits.maxRequests,
    requestsRemaining: Math.max(0, limits.maxRequests - requestsUsed),
    hasAnalytics: limits.analytics,
    hasReports: limits.reports,
    hasTeam: limits.teamMembers > 0,
    maxTeamMembers: limits.teamMembers,
    maxCategories: limits.maxCategories,
    maxBranches: limits.branches,
    isLockedOut,
    lockoutReason,
  };
}
