// app/employees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { employeesApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Employee } from '@/lib/types';
import DataTable from '@/components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<Employee['employment_status'], string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  on_leave: 'bg-yellow-100 text-yellow-800',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const data = await employeesApi.getAll();
        setEmployees(data);
      } catch (error) {
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (employee: Employee) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeesApi.delete(employee.id, currentUser!);
        setEmployees(employees.filter(e => e.id !== employee.id));
        toast.success('Employee deleted');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete employee');
        }
      }
    }
  };

  const columns = [
    {
      key: 'first_name' as const,
      label: 'Name',
      render: (_: string, employee: Employee) => `${employee.first_name} ${employee.last_name}`,
    },
    { key: 'email' as const, label: 'Email' },
    { key: 'position' as const, label: 'Position' },
    { key: 'department' as const, label: 'Department' },
    {
      key: 'employment_status' as const,
      label: 'Status',
      render: (value: Employee['employment_status']) => (
        <span className={`px-3 py-1 rounded-full text-sm capitalize ${STATUS_COLORS[value]}`}>
          {value.replace('_', ' ')}
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
        <h1 className="text-3xl font-bold">Employee Directory</h1>
        <Link
          href="/employees/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Employee
        </Link>
      </div>

      <DataTable columns={columns} data={employees} onDelete={handleDelete} />
    </div>
  );
}
