// app/banks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { banksApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Bank } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const data = await banksApi.getAll();
        setBanks(data);
      } catch (error) {
        toast.error('Failed to load banks');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (bank: Bank) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      try {
        await banksApi.delete(bank.id, currentUser!);
        setBanks(banks.filter(b => b.id !== bank.id));
        toast.success('Bank account deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete bank account');
        }
      }
    }
  };

  const columns = [
    { key: 'bank_name' as const, label: 'Bank Name' },
    { key: 'account_holder' as const, label: 'Account Holder' },
    { key: 'account_number' as const, label: 'Account Number' },
    { key: 'branch' as const, label: 'Branch' },
    { key: 'swift_code' as const, label: 'SWIFT Code' },
    {
      key: 'is_primary' as const,
      label: 'Primary',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-sm ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Banks</h1>
        <Link
          href="/banks/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Bank
        </Link>
      </div>

      <DataTable columns={columns} data={banks} onDelete={handleDelete} />
    </div>
  );
}
