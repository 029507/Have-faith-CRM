// lib/mockAuth.ts
import { AuthContext } from './auth';

/**
 * Get current user for demo mode
 * In production, this would get from auth provider (NextAuth, Supabase, etc.)
 *
 * For demo, returns a mock manager user
 * You can change the role to test different authorization scenarios:
 * - 'admin': Full access to everything
 * - 'manager': Can create/assign/delete own records
 * - 'user': Can create/assign/delete own records
 * - 'employee': Read-only access
 */
export const getCurrentUser = (): AuthContext => {
  // Demo user with manager role
  return {
    userId: 'demo_user_123',
    role: 'manager',
  };
};

/**
 * Get current user for testing different roles
 * @param role - Role to test: 'admin' | 'manager' | 'user' | 'employee'
 */
export const getCurrentUserWithRole = (role: 'admin' | 'manager' | 'user' | 'employee'): AuthContext => {
  return {
    userId: `demo_user_${role}`,
    role,
  };
};
