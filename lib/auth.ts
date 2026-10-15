// lib/auth.ts
import { User } from './types';

export interface AuthContext {
  userId: string;
  role: User['role'];
}

export class AuthorizationError extends Error {
  constructor(public code: 401 | 403, message: string) {
    super(message);
  }
}

/**
 * Require user to have one of the specified roles
 * @throws AuthorizationError if user role not in allowed roles
 */
export const requireRole = (user: AuthContext, ...roles: User['role'][]): void => {
  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      403,
      `User role '${user.role}' not authorized. Required: ${roles.join(' or ')}`
    );
  }
};

/**
 * Require admin role
 * @throws AuthorizationError if user is not admin
 */
export const requireAdmin = (user: AuthContext): void => {
  if (user.role !== 'admin') {
    throw new AuthorizationError(403, 'Admin access required');
  }
};

/**
 * Require manager or admin role
 * @throws AuthorizationError if user is not manager/admin
 */
export const requireManagerOrAbove = (user: AuthContext): void => {
  if (!['admin', 'manager'].includes(user.role)) {
    throw new AuthorizationError(403, 'Manager access required');
  }
};

/**
 * Check if user can modify another user
 * Admin can modify anyone, users can only modify self
 */
export const canModifyUser = (user: AuthContext, targetUserId: string): boolean => {
  return user.role === 'admin' || user.userId === targetUserId;
};

/**
 * Check if user can assign leads
 * Only admin/manager/user can assign (employee cannot)
 */
export const canAssignLead = (user: AuthContext): boolean => {
  return ['admin', 'manager', 'user'].includes(user.role);
};

/**
 * Check if user can delete a record
 * Admin can delete anything, others need special permission
 */
export const canDeleteRecord = (user: AuthContext, createdByUserId?: string): boolean => {
  // Admin can always delete
  if (user.role === 'admin') return true;

  // Manager can delete their own
  if (user.role === 'manager' && user.userId === createdByUserId) return true;

  // User can delete their own
  if (user.role === 'user' && user.userId === createdByUserId) return true;

  // Employee cannot delete
  return false;
};

/**
 * Check if user can create a record
 * Employees can only view, others can create
 */
export const canCreateRecord = (user: AuthContext): boolean => {
  return ['admin', 'manager', 'user'].includes(user.role);
};
