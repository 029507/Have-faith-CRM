// app/b2b-productivity/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { leadsApi, campaignsApi } from '@/lib/api';
import { Lead, Campaign } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function B2BProductivityPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leadsData, campaignsData] = await Promise.all([
          leadsApi.getAll(),
          campaignsApi.getAll(),
        ]);
        setLeads(leadsData);
        setCampaigns(campaignsData);
      } catch (error) {
        toast.error('Failed to load B2B data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const statusDistribution = [
    { status: 'New', count: leads.filter(l => l.status === 'new').length },
    { status: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { status: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
    { status: 'Won', count: leads.filter(l => l.status === 'won').length },
    { status: 'Lost', count: leads.filter(l => l.status === 'lost').length },
  ];

  const campaignStats = campaigns.map(c => ({
    name: c.name,
    active: c.status === 'active' ? 1 : 0,
    completed: c.status === 'completed' ? 1 : 0,
  }));

  const topCompanies = leads
    .reduce((acc: { company: string; count: number }[], lead) => {
      const existing = acc.find(a => a.company === lead.company);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ company: lead.company, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const leadsPerSource = leads
    .reduce((acc: { source: string; count: number }[], lead) => {
      const existing = acc.find(a => a.source === lead.source);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ source: lead.source, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">B2B Lead Productivity</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Leads</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Campaigns</p>
              <p className="text-3xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
            </div>
            <Target className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Won Deals</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.status === 'won').length}</p>
            </div>
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold">
                {leads.length > 0 ? ((leads.filter(l => l.status === 'won').length / leads.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <TrendingUp className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lead Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Leads by Source</h2>
          <div className="space-y-3">
            {leadsPerSource.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="text-gray-700">{source.source}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-blue-800">{source.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Top Companies</h2>
        <div className="space-y-2">
          {topCompanies.map((company, idx) => (
            <div key={company.company} className="flex items-center justify-between p-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-gray-400">#{idx + 1}</div>
                <span className="text-gray-800">{company.company}</span>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {company.count} leads
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
