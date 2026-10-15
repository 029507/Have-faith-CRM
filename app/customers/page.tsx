// app/customers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customersApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Customer } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const data = await customersApi.getAll();
        setCustomers(data);
      } catch (error) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (customer: Customer) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersApi.delete(customer.id, currentUser!);
        setCustomers(customers.filter(c => c.id !== customer.id));
        toast.success('Customer deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete customer');
        }
      }
    }
  };

  const columns = [
    {
      key: 'first_name' as const,
      label: 'Name',
      render: (_: string, customer: Customer) => `${customer.first_name} ${customer.last_name}`,
    },
    { key: 'email' as const, label: 'Email' },
    { key: 'phone' as const, label: 'Phone' },
    { key: 'city' as const, label: 'City' },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Customer
        </Link>
      </div>

      <DataTable columns={columns} data={customers} onDelete={handleDelete} />
    </div>
  );
}
