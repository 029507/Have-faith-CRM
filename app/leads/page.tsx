// app/leads/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { leadsApi, leadAssignmentLogsApi } from '@/lib/api';
import { Lead, LeadAssignmentLog } from '@/lib/types';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import DataTable from '@/components/DataTable';
import LeadAssignmentModal from '@/components/LeadAssignmentModal';
import { Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-green-100 text-green-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Lead['status'] | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);

      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (lead: Lead) => {
    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsApi.delete(lead.id, currentUser);
        setLeads(leads.filter(l => l.id !== lead.id));
        toast.success('Lead deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete lead');
        }
      }
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: Lead['status']) => {
    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    try {
      const updated = await leadsApi.update(lead.id, { status: newStatus }, currentUser);
      if (updated) {
        setLeads(leads.map(l => (l.id === lead.id ? updated : l)));
        if (selectedLead?.id === lead.id) {
          setSelectedLead(updated);
        }
        toast.success('Lead updated');
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to update lead');
      }
    }
  };

  const handleAssignmentClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowAssignmentModal(true);
  };

  const handleAssignmentComplete = (log: LeadAssignmentLog) => {
    // Reload leads to get updated assignment info
    loadData();
    setShowAssignmentModal(false);
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const columns = [
    { key: 'first_name' as const, label: 'First Name' },
    { key: 'last_name' as const, label: 'Last Name' },
    { key: 'email' as const, label: 'Email' },
    { key: 'company' as const, label: 'Company' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (_: string, lead: Lead) => (
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(lead, e.target.value as Lead['status'])}
          className={`px-2 py-1 rounded text-sm font-medium ${STATUS_COLORS[lead.status]}`}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      ),
    },
    {
      key: 'assigned_to' as const,
      label: 'Assigned To',
      render: (value: string | undefined) => (
        <span className={value ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
          {value ? 'Assigned' : 'Unassigned'}
        </span>
      ),
    },
    { key: 'source' as const, label: 'Source' },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Link
          href="/leads/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'new', 'contacted', 'qualified', 'won', 'lost'] as const).map((status) => (
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

      {/* Assignment Modal */}
      {showAssignmentModal && selectedLead && (
        <LeadAssignmentModal
          lead={selectedLead}
          onClose={() => setShowAssignmentModal(false)}
          onAssigned={handleAssignmentComplete}
        />
      )}

      <DataTable
        columns={columns}
        data={filteredLeads}
        onView={handleAssignmentClick}
        onDelete={handleDelete}
      />
    </div>
  );
}
