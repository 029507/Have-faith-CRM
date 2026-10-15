// app/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usersApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { User } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<User['role'], string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const data = await usersApi.getAll();
        setUsers(data);
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (user: User) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(user.id, currentUser!);
        setUsers(users.filter(u => u.id !== user.id));
        toast.success('User deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete user');
        }
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updated = await usersApi.update(user.id, { is_active: !user.is_active }, currentUser!);
      if (updated) {
        setUsers(users.map(u => (u.id === user.id ? updated : u)));
        toast.success('User updated');
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to update user');
      }
    }
  };

  const columns = [
    { key: 'full_name' as const, label: 'Full Name' },
    { key: 'email' as const, label: 'Email' },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: User['role']) => (
        <span className={`px-3 py-1 rounded-full text-sm capitalize ${ROLE_COLORS[value]}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'is_active' as const,
      label: 'Status',
      render: (value: boolean, user: User) => (
        <button
          onClick={() => handleToggleActive(user)}
          className={`px-3 py-1 rounded-full text-sm ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          href="/users/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New User
        </Link>
      </div>

      <DataTable columns={columns} data={users} onDelete={handleDelete} />
    </div>
  );
}
