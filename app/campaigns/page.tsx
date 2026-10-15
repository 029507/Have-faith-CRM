// app/campaigns/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { campaignsApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Campaign } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<Campaign['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const data = await campaignsApi.getAll();
        setCampaigns(data);
      } catch (error) {
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (campaign: Campaign) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignsApi.delete(campaign.id, currentUser!);
        setCampaigns(campaigns.filter(c => c.id !== campaign.id));
        toast.success('Campaign deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete campaign');
        }
      }
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Campaign Name' },
    {
      key: 'type' as const,
      label: 'Type',
      render: (value: string) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: Campaign['status']) => (
        <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[value]} capitalize`}>
          {value}
        </span>
      ),
    },
    {
      key: 'start_date' as const,
      label: 'Start Date',
    },
    {
      key: 'end_date' as const,
      label: 'End Date',
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lead Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Campaign
        </Link>
      </div>

      <DataTable columns={columns} data={campaigns} onDelete={handleDelete} />
    </div>
  );
}
