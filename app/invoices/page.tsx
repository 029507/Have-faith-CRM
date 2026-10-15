// app/invoices/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { invoicesApi, customersApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Invoice, Customer } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<Invoice['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-black bg-opacity-10 text-gray-800',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Map<string, Customer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);
  const [filter, setFilter] = useState<Invoice['status'] | 'all'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const [invoicesData, customersData] = await Promise.all([
          invoicesApi.getAll(),
          customersApi.getAll(),
        ]);
        setInvoices(invoicesData);
        setCustomers(new Map(customersData.map(c => [c.id, c])));
      } catch (error) {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (invoice: Invoice) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesApi.delete(invoice.id, currentUser!);
        setInvoices(invoices.filter(i => i.id !== invoice.id));
        toast.success('Invoice deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete invoice');
        }
      }
    }
  };

  const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const columns = [
    { key: 'invoice_number' as const, label: 'Invoice #' },
    {
      key: 'customer_id' as const,
      label: 'Customer',
      render: (_: string, invoice: Invoice) => {
        const customer = customers.get(invoice.customer_id);
        return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
      },
    },
    {
      key: 'total' as const,
      label: 'Amount',
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: Invoice['status']) => (
        <span className={`px-3 py-1 rounded-full text-sm capitalize ${STATUS_COLORS[value]}`}>
          {value}
        </span>
      ),
    },
    { key: 'due_date' as const, label: 'Due Date' },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filteredInvoices} onDelete={handleDelete} />
    </div>
  );
}
