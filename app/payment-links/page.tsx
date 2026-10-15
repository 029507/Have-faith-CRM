// app/payment-links/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { paymentLinksApi, invoicesApi } from '@/lib/api';
import { PaymentLink, Invoice } from '@/lib/types';
import DataTable from '@/components/DataTable';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<PaymentLink['status'], string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800',
};

export default function PaymentLinksPage() {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [invoices, setInvoices] = useState<Map<string, Invoice>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [linksData, invoicesData] = await Promise.all([
          paymentLinksApi.getAll(),
          invoicesApi.getAll(),
        ]);
        setPaymentLinks(linksData);
        setInvoices(new Map(invoicesData.map(i => [i.id, i])));
      } catch (error) {
        toast.error('Failed to load payment links');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const columns = [
    {
      key: 'id' as const,
      label: 'Link ID',
      render: (value: string) => value.slice(0, 8),
    },
    {
      key: 'invoice_id' as const,
      label: 'Invoice',
      render: (_: string, link: PaymentLink) => {
        const invoice = invoices.get(link.invoice_id);
        return invoice?.invoice_number || 'Unknown';
      },
    },
    {
      key: 'amount' as const,
      label: 'Amount',
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: PaymentLink['status']) => (
        <span className={`px-3 py-1 rounded-full text-sm capitalize ${STATUS_COLORS[value]}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'payment_url' as const,
      label: 'URL',
      render: (value: string) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
          View Link
        </a>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Payment Links</h1>
      <DataTable columns={columns} data={paymentLinks} />
    </div>
  );
}
