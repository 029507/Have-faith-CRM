# Backend Authorization - Quick Reference Guide

## Overview
The Have Faith CRM uses role-based access control (RBAC) to protect all API mutations. Every create, update, and delete operation requires authorization validation.

---

## For Developers

### Using Authorization in a New Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function MyPage() {
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    try {
      const result = await myApi.create(data, currentUser);
      toast.success('Created successfully');
      // Update UI
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to create');
      }
    }
  };

  // ... rest of component
}
```

### Adding Authorization to an API Method

```typescript
// In lib/api.ts
export const myApi = {
  create: async (data: MyData, user: AuthContext): Promise<MyData> => {
    // Check authorization (example: manager+ only)
    requireManagerOrAbove(user);
    
    // Create record
    const newRecord = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      created_by: user.userId,
    };
    
    dataStore.myData.push(newRecord);
    return newRecord;
  },

  update: async (
    id: string,
    updates: Partial<MyData>,
    user: AuthContext
  ): Promise<MyData | null> => {
    const record = dataStore.myData.find(r => r.id === id);
    if (!record) return null;

    // Check: user can only update own records (unless admin)
    if (user.role !== 'admin' && record.created_by !== user.userId) {
      throw new AuthorizationError(403, 'Can only update your own records');
    }

    // Update record
    const updated = { ...record, ...updates };
    const index = dataStore.myData.findIndex(r => r.id === id);
    dataStore.myData[index] = updated;
    return updated;
  },

  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    const record = dataStore.myData.find(r => r.id === id);
    if (!record) return false;

    // Check: only owner or admin can delete
    if (!canDeleteRecord(user, record.created_by)) {
      throw new AuthorizationError(403, 'Cannot delete this record');
    }

    // Soft delete
    record.deleted_at = new Date().toISOString();
    return true;
  },
};
```

---

## Role Hierarchy

```
Admin
├─ Can do everything
├─ Create/update/delete users
├─ Permanently delete records
└─ Manage bank accounts

Manager
├─ Can create campaigns
├─ Can create invoices
├─ Can assign leads
├─ Can restore deleted bookings
└─ Cannot create users

User
├─ Can create bookings
├─ Can create leads
├─ Can assign leads
├─ Can only delete own records
└─ Cannot create campaigns/invoices

Employee
├─ Can view all data
├─ Cannot create or modify anything
└─ Cannot assign leads
```

---

## Common Authorization Patterns

### Pattern 1: Admin-Only Operation
```typescript
export const banksApi = {
  create: async (bank: Bank, user: AuthContext): Promise<Bank> => {
    requireAdmin(user); // Throws 403 if not admin
    // ... rest of implementation
  },
};
```

### Pattern 2: Manager+ Operation
```typescript
export const campaignsApi = {
  create: async (campaign: Campaign, user: AuthContext): Promise<Campaign> => {
    requireManagerOrAbove(user); // Throws 403 if not manager/admin
    // ... rest of implementation
  },
};
```

### Pattern 3: Ownership-Based
```typescript
export const bookingsApi = {
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    const booking = dataStore.bookings.find(b => b.id === id);
    
    if (!canDeleteRecord(user, booking.created_by)) {
      throw new AuthorizationError(403, 'Can only delete your own bookings');
    }
    // ... rest of implementation
  },
};
```

### Pattern 4: Role-Specific Operation
```typescript
export const leadsApi = {
  assign: async (
    leadId: string,
    assigneeId: string,
    user: AuthContext,
    notes?: string
  ): Promise<LeadAssignmentLog | null> => {
    if (!canAssignLead(user)) {
      throw new AuthorizationError(403, 'Lead assignment not authorized for this role');
    }
    // ... rest of implementation
  },
};
```

### Pattern 5: Custom Permission Check
```typescript
export const usersApi = {
  update: async (
    id: string,
    updates: Partial<User>,
    user: AuthContext
  ): Promise<User | null> => {
    // Custom: user can only update self, admin can update anyone
    if (!canModifyUser(user, id)) {
      throw new AuthorizationError(403, 'Cannot modify this user');
    }
    // ... rest of implementation
  },
};
```

---

## Permission Functions

### Available Functions (from `lib/auth.ts`)

```typescript
// Require specific roles
requireRole(user: AuthContext, ...roles: User['role'][]): void
// Throws 403 if user.role not in roles

// Shorthand for common patterns
requireAdmin(user: AuthContext): void
// Throws 403 if user.role !== 'admin'

requireManagerOrAbove(user: AuthContext): void
// Throws 403 if user.role not in ['admin', 'manager']

// Permission checks (return boolean)
canModifyUser(user: AuthContext, targetUserId: string): boolean
// Returns true if user is admin OR userId matches

canAssignLead(user: AuthContext): boolean
// Returns true if user role is admin, manager, or user

canDeleteRecord(user: AuthContext, createdByUserId?: string): boolean
// Returns true if user is admin OR userId matches createdBy
```

---

## Error Handling Pattern

```typescript
const handleSubmit = async () => {
  if (!currentUser) {
    toast.error('User not loaded');
    return;
  }

  try {
    const result = await api.create(data, currentUser);
    toast.success('Created successfully');
    // Success handling
  } catch (error) {
    if (error instanceof AuthorizationError) {
      // Authorization failed
      if (error.code === 403) {
        toast.error(`Permission denied: ${error.message}`);
      } else if (error.code === 401) {
        toast.error('Please log in');
      }
    } else {
      // Other errors (validation, network, etc)
      toast.error('Operation failed');
    }
  }
};
```

---

## Testing Different Roles

### Locally (Demo Mode)

Edit `lib/mockAuth.ts`:
```typescript
export const getCurrentUser = (): AuthContext => {
  return {
    userId: 'test-user-123',
    role: 'admin', // Change to test different roles
  };
};

// Or create multiple test functions
export const getAdminUser = (): AuthContext => ({
  userId: 'admin-1',
  role: 'admin',
});

export const getManagerUser = (): AuthContext => ({
  userId: 'manager-1',
  role: 'manager',
});

export const getEmployeeUser = (): AuthContext => ({
  userId: 'employee-1',
  role: 'employee',
});
```

Then in pages, temporarily use:
```typescript
// Instead of getCurrentUser()
const user = getAdminUser(); // for testing admin permissions
setCurrentUser(user);
```

---

## Migration to Real Auth

### Step 1: Replace `lib/mockAuth.ts`

With NextAuth:
```typescript
import { getServerSession } from 'next-auth';

export const getCurrentUser = async (): Promise<AuthContext> => {
  const session = await getServerSession();
  if (!session?.user) {
    throw new AuthorizationError(401, 'Not authenticated');
  }
  return {
    userId: session.user.id,
    role: session.user.role as User['role'],
  };
};
```

### Step 2: Update Components (if needed)

If using server-side auth, wrap pages with auth middleware:
```typescript
import { withAuth } from 'next-auth/middleware';

export const middleware = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/api/:path*', '/:path*'],
};
```

### Step 3: Add Database Tables

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR CHECK(role IN ('admin', 'manager', 'user', 'employee')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable row-level security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_bookings" ON bookings
  FOR SELECT USING (
    auth.role() = 'admin' OR 
    created_by = auth.uid()
  );
```

---

## Debugging Authorization

### Enable Logging

Add to any component:
```typescript
useEffect(() => {
  console.log('Current User:', currentUser);
}, [currentUser]);

// Or in API method
const handleCreate = async () => {
  console.log('Creating with user:', currentUser);
  console.log('User role:', currentUser?.role);
  
  try {
    const result = await api.create(data, currentUser!);
    console.log('Success:', result);
  } catch (error) {
    console.error('Authorization error:', error);
  }
};
```

### Check Authorization Matrix

Refer to `/README_AUTHORIZATION.md` for complete matrix of who can do what.

### Test Auth Error Response

In browser console:
```javascript
// Simulate authorization error
const error = new Error('Lead assignment not authorized for this role');
error.code = 403;
throw error;
```

---

## Troubleshooting

### Error: "User context not available"
- ✅ Make sure `useEffect` loads user before operations
- ✅ Check `getCurrentUser()` is called
- ✅ Verify `setCurrentUser()` is called

### Error: "Lead assignment not authorized for this role"
- ✅ Employee role cannot assign leads
- ✅ Only admin, manager, user can assign
- ✅ Change role in `mockAuth.ts` for testing

### Error: "Can only delete your own records"
- ✅ Non-admin users can only delete records they created
- ✅ Check `created_by` field matches `user.userId`
- ✅ Admin role can delete any record

### Build Failed: "Type 'AuthContext' not found"
- ✅ Import: `import { AuthContext } from '@/lib/auth';`
- ✅ Make sure `lib/auth.ts` exists
- ✅ Run `npm install` to ensure dependencies installed

---

## Best Practices

✅ **Always** import and handle `AuthorizationError`  
✅ **Always** check `currentUser` exists before API calls  
✅ **Always** show user-friendly error messages  
✅ **Never** expose authorization details to frontend  
✅ **Never** trust client-side auth checks alone  
✅ **Always** validate at API level (server-side)  
✅ **Document** custom authorization rules  
✅ **Test** with all user roles before deployment  

---

## Quick Links

- Authorization Core: `lib/auth.ts`
- Mock Auth: `lib/mockAuth.ts`
- API Methods: `lib/api.ts`
- Full Documentation: `README_AUTHORIZATION.md`
- Implementation Summary: `AUTHORIZATION_COMPLETION_SUMMARY.md`

---

**Last Updated**: October 15, 2026, 11:08 AM  
**Version**: 1.0
