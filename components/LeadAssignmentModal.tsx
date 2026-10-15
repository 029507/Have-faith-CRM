'use client';

import { useEffect, useState } from 'react';
import { User, Employee, Lead, LeadAssignmentLog } from '@/lib/types';
import { leadsApi, leadAssignmentLogsApi, usersApi, employeesApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { X, History } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadAssignmentModalProps {
  lead: Lead;
  onClose: () => void;
  onAssigned: (log: LeadAssignmentLog) => void;
}

export default function LeadAssignmentModal({
  lead,
  onClose,
  onAssigned,
}: LeadAssignmentModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>(lead.assigned_to || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentLogs, setAssignmentLogs] = useState<LeadAssignmentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);

      const [usersData, employeesData, logsData] = await Promise.all([
        usersApi.getAll(),
        employeesApi.getAll(),
        leadAssignmentLogsApi.getByLeadId(lead.id),
      ]);
      setUsers(usersData);
      setEmployees(employeesData);
      setAssignmentLogs(logsData);
    } catch (error) {
      toast.error('Failed to load assignment data');
    }
  };

  const getAssigneeName = (id: string): string => {
    const user = users.find(u => u.id === id);
    if (user) return user.full_name;
    const employee = employees.find(e => e.id === id);
    if (employee) return `${employee.first_name} ${employee.last_name}`;
    return 'Unknown';
  };

  const handleAssign = async () => {
    if (!selectedAssignee) {
      toast.error('Please select an assignee');
      return;
    }

    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    try {
      setLoading(true);

      const log = await leadsApi.assign(
        lead.id,
        selectedAssignee,
        currentUser,
        assignmentNotes
      );

      if (log) {
        toast.success(`Lead assigned to ${getAssigneeName(selectedAssignee)}`);
        onAssigned(log);
        onClose();
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to assign lead');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!lead.assigned_to) {
      toast.error('Lead is not assigned');
      return;
    }

    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    if (confirm('Are you sure you want to unassign this lead?')) {
      try {
        setLoading(true);

        const log = await leadsApi.unassign(lead.id, currentUser);

        if (log) {
          toast.success('Lead unassigned');
          setSelectedAssignee('');
          onAssigned(log);
          onClose();
        }
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to unassign lead');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const formatLogDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl my-8 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Assign Lead</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Lead Info */}
        <div className="mb-6 pb-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3">
            {lead.first_name} {lead.last_name}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email</p>
              <p>{lead.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Company</p>
              <p>{lead.company}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Status</p>
              <p className="capitalize">{lead.status}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current Assignment</p>
              <p>{lead.assigned_to ? getAssigneeName(lead.assigned_to) : 'Unassigned'}</p>
            </div>
          </div>
        </div>

        {!showHistory ? (
          <>
            {/* Assignment Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assign To
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="">-- Select assignee --</option>
                  <optgroup label="Users">
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.role})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Employees">
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.position})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  disabled={loading}
                  placeholder="e.g., Follow up within 24 hours, High priority client"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                >
                  <History size={18} />
                  History
                </button>
                {lead.assigned_to && (
                  <button
                    onClick={handleUnassign}
                    disabled={loading}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700"
                  >
                    Unassign
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={loading || !selectedAssignee}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Assignment History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Assignment History</h3>
              {assignmentLogs.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No assignment history
                </p>
              ) : (
                <div className="space-y-3">
                  {assignmentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">
                          {log.assigned_to ? (
                            <>
                              Assigned to{' '}
                              <span className="text-blue-600 dark:text-blue-400">
                                {getAssigneeName(log.assigned_to)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">Unassigned</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatLogDate(log.assignment_date)}
                        </span>
                      </div>
                      {log.previous_assignment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Previous: {getAssigneeName(log.previous_assignment)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By: {getAssigneeName(log.assigned_by)}
                      </p>
                      {log.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
