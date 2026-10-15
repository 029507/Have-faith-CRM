// app/banks/new/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { banksApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBankPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    branch: '',
    swift_code: '',
    iban: '',
  });

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bank_name || !formData.account_number || !formData.account_holder) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      await banksApi.create({
        ...formData,
        is_primary: false,
      }, currentUser!);
      toast.success('Bank account added successfully');
      router.push('/banks');
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to add bank account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <Link href="/banks" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
        <ArrowLeft size={20} />
        Back to Banks
      </Link>

      <div className="bg-white rounded-lg shadow p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Add Bank Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number *
            </label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder *
            </label>
            <input
              type="text"
              value={formData.account_holder}
              onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SWIFT Code
            </label>
            <input
              type="text"
              value={formData.swift_code}
              onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IBAN
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Bank Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
