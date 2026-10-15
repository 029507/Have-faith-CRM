'use client';

import { useEffect, useState } from 'react';
import { bookingsApi } from '@/lib/api';
import { customersApi } from '@/lib/api';
import { servicesApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Booking, Customer, Service } from '@/lib/types';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrashPage() {
  const [deletedBookings, setDeletedBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setCurrentUser(getCurrentUser());
      const [deleted, allCustomers, allServices] = await Promise.all([
        bookingsApi.getAllDeleted(),
        customersApi.getAll(),
        servicesApi.getAll(),
      ]);
      setDeletedBookings(deleted);
      setCustomers(allCustomers);
      setServices(allServices);
    } catch (error) {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
  };

  const getServiceName = (id: string) => {
    const service = services.find(s => s.id === id);
    return service?.name || 'Unknown';
  };

  const handleRestore = async (bookingId: string) => {
    try {
      const restored = await bookingsApi.restore(bookingId, currentUser!);
      if (restored) {
        toast.success('Booking restored successfully');
        loadData();
      } else {
        toast.error('Failed to restore booking');
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Error restoring booking');
      }
    }
  };

  const handlePermanentlyDelete = async (bookingId: string) => {
    if (confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      try {
        const deleted = await bookingsApi.permanentlyDelete(bookingId, currentUser!);
        if (deleted) {
          toast.success('Booking permanently deleted');
          loadData();
        } else {
          toast.error('Failed to permanently delete booking');
        }
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Error deleting booking');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading trash...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-8 h-8" />
          Trash
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Recover or permanently delete deleted bookings
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium">Deleted bookings can be restored within 30 days.</p>
          <p className="mt-1">After that, they will be permanently deleted automatically.</p>
        </div>
      </div>

      {deletedBookings.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">No deleted bookings</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Your trash is empty</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Deleted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {deletedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {getCustomerName(booking.customer_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {getServiceName(booking.service_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : booking.status === 'confirmed'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {booking.deleted_at && new Date(booking.deleted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(booking.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                          title="Restore this booking"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentlyDelete(booking.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                          title="Permanently delete this booking"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      {deletedBookings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Deleted</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {deletedBookings.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">By Status</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(deletedBookings.map(b => b.status)).size} types
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Oldest Deletion</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {deletedBookings.length > 0 && deletedBookings[deletedBookings.length - 1].deleted_at
                ? new Date(deletedBookings[deletedBookings.length - 1].deleted_at!).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
