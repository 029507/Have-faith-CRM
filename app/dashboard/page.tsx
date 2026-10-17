// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { DashboardMetrics } from '@/lib/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadMetrics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await dashboardApi.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        <div className="animate-pulse-slow rounded-lg bg-gray-200 w-32 h-32 mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
        <button
          onClick={handleRefresh}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = [
    { name: 'Pending', value: metrics.pending_bookings, fill: '#f59e0b' },
    { name: 'Completed', value: metrics.completed_bookings, fill: '#10b981' },
  ];

  const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  return (
    <div className="p-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            Have Faith Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time insights for your business
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-outline flex items-center gap-2"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 6v6m0 0l3-3m-3 3l-3-3" strokeLinecap="round" />
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4 4h5v.582m11.318 0a9.001 9.001 0 01-2.827 8.37M4 4h5v.582m11.318 0a9.001 9.001 0 009.001 9V4h-5z" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 mb-8">
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Bookings */}
          <div className="card-interactive hover-scale focus-ring animate-fade-in delay-100">
            <div className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold text-primary">
                  {metrics.total_bookings}
                </p>
                <p className="text-xs text-gray-400">
                  {metrics.total_bookings > 0 ? '▲ 12% from last month' : 'No data'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary/80" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="card-interactive hover-scale focus-ring animate-fade-in delay-200">
            <div className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-secondary">
                  ₹{metrics.total_revenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  ▲ 8% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-secondary/80" />
            </div>
          </div>

          {/* Total Customers */}
          <div className="card-interactive hover-scale focus-ring animate-fade-in delay-300">
            <div className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-3xl font-bold text-info">
                  {metrics.total_customers}
                </p>
                <p className="text-xs text-gray-400">
                  ▲ 5% from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-info/80" />
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="card-interactive hover-scale focus-ring animate-fade-in delay-400">
            <div className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                <p className="text-3xl font-bold text-accent">
                  {metrics.conversion_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">
                  ▲ 3% from last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8">
        <div className="grid-cols-1 lg:grid-cols-2">
          {/* Booking Status Chart */}
          <div className="chart-container animate-fade-in delay-100">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Booking Status Overview
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, value, percentage }) =>
                        `${name}: ${percentage}%`
                      }
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ borderRadius: '4px', padding: '8px' }}
                      contentStyle={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                      labelStyle={{ fontWeight: 600 }}
                      formatter={(value) => value}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{}}
                      formatter={(entry) => `${entry.name}: ${entry.value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="chart-container animate-fade-in delay-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Revenue Trend (Last 3 Months)
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Aug', revenue: metrics.total_revenue * 0.7 },
                    { month: 'Sep', revenue: metrics.total_revenue * 0.85 },
                    { month: 'Oct', revenue: metrics.total_revenue },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickSize={5} />
                    <YAxis tickLine={false} axisLine={false} tickSize={5} domain={['dataMin', 'dataMax']} />
                    <Tooltip
                      wrapperStyle={{ borderRadius: '4px', padding: '8px' }}
                      contentStyle={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                      labelStyle={{ fontWeight: 600 }}
                      formatter={(value) => `₹${value}`}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{}}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 6, strokeWidth: 2, stroke: 'var(--primary)' }}
                    >
                      {/* Gradient fill */}
                      <defs>
                        <linearGradient id="coloru1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <area type="monotone" dataKey="revenue" fill="url(#coloru1)" />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-8 animate-fade-in delay-300">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Key Metrics Summary
          </h2>
          <div className="grid gap-4">
            <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Pending Bookings */}
              <div className="glass p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Pending Bookings
                    </p>
                    <p className="text-2xl font-bold text-orange-500">
                      {metrics.pending_bookings}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-full">
                    <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Completed Bookings */}
              <div className="glass p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Completed Bookings
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      {metrics.completed_bookings}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-5.618 5.04" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Leads */}
              <div className="glass p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Leads
                    </p>
                    <p className="text-2xl font-bold text-info">
                      {metrics.total_leads}
                    </p>
                  </div>
                  <div className="p-2 bg-info/10 rounded-full">
                    <svg className="h-5 w-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Won Deals */}
              <div className="glass p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Won Deals
                    </p>
                    <p className="text-2xl font-bold text-purple-500">
                      {Math.round((metrics.total_leads * metrics.conversion_rate) / 100)}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-5.618 5.04" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
