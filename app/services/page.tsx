// app/services/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { servicesApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Service } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const data = await servicesApi.getAll();
        setServices(data);
      } catch (error) {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (service: Service) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesApi.delete(service.id, currentUser!);
        setServices(services.filter(s => s.id !== service.id));
        toast.success('Service deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete service');
        }
      }
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Service Name' },
    { key: 'description' as const, label: 'Description' },
    {
      key: 'price' as const,
      label: 'Price',
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'duration_minutes' as const,
      label: 'Duration',
      render: (value: number) => `${value} min`,
    },
    {
      key: 'is_active' as const,
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-sm ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
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
        <h1 className="text-3xl font-bold">Services</h1>
        <Link
          href="/services/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Service
        </Link>
      </div>

      <DataTable columns={columns} data={services} onDelete={handleDelete} />
    </div>
  );
}
