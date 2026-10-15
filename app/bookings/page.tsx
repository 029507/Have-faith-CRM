'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookingsApi, customersApi, servicesApi, bookingDocumentsApi } from '@/lib/api';
import { Booking, Customer, Service, BookingDocument } from '@/lib/types';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import DataTable from '@/components/DataTable';
import BookingDocuments from '@/components/BookingDocuments';
import { Plus, Download, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportBookingsToExcel, exportToPDF, exportToWord } from '@/lib/exportUtils';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Map<string, Customer>>(new Map());
  const [services, setServices] = useState<Map<string, Service>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'word'>('excel');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'id', 'customerName', 'serviceName', 'bookingDate', 'bookingTime', 'status', 'createdAt'
  ]);

  // Detail modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDocuments, setBookingDocuments] = useState<Map<string, BookingDocument[]>>(new Map());
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      setCurrentUser(user);

      const [bookingsData, customersData, servicesData] = await Promise.all([
        bookingsApi.getAll(),
        customersApi.getAll(),
        servicesApi.getAll(),
      ]);

      setBookings(bookingsData);
      setCustomers(new Map(customersData.map(c => [c.id, c])));
      setServices(new Map(servicesData.map(s => [s.id, s])));

      // Load documents for all bookings
      const docsMap = new Map<string, BookingDocument[]>();
      for (const booking of bookingsData) {
        const docs = await bookingDocumentsApi.getByBookingId(booking.id);
        docsMap.set(booking.id, docs);
      }
      setBookingDocuments(docsMap);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    if (confirm('Are you sure you want to delete this booking? You can recover it from Trash.')) {
      try {
        await bookingsApi.delete(booking.id, currentUser);
        setBookings(bookings.filter(b => b.id !== booking.id));
        toast.success('Booking deleted. You can recover it from Trash.');
      } catch (error) {
        if (error instanceof AuthorizationError) {
          toast.error(`Unauthorized: ${error.message}`);
        } else {
          toast.error('Failed to delete booking');
        }
      }
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: Booking['status']) => {
    if (!currentUser) {
      toast.error('User context not available');
      return;
    }

    try {
      const updated = await bookingsApi.update(booking.id, { status: newStatus }, currentUser);
      if (updated) {
        setBookings(bookings.map(b => (b.id === booking.id ? updated : b)));
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking(updated);
        }
        toast.success('Booking updated');
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to update booking');
      }
    }
  };

  const handleViewBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleDocumentAdded = async (doc: BookingDocument) => {
    if (!selectedBooking) return;
    const currentDocs = bookingDocuments.get(selectedBooking.id) || [];
    const updatedDocs = [...currentDocs, doc];
    setBookingDocuments(new Map(bookingDocuments.set(selectedBooking.id, updatedDocs)));
    toast.success('Document uploaded successfully');
  };

  const handleDocumentDeleted = async (docId: string) => {
    if (!selectedBooking) return;
    try {
      await bookingDocumentsApi.delete(docId);
      const currentDocs = bookingDocuments.get(selectedBooking.id) || [];
      const updatedDocs = currentDocs.filter(d => d.id !== docId);
      setBookingDocuments(new Map(bookingDocuments.set(selectedBooking.id, updatedDocs)));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleExport = () => {
    const filteredBookings = filter === 'all'
      ? bookings
      : bookings.filter(b => b.status === filter);

    const enrichedData = filteredBookings.map(booking => ({
      id: booking.id.slice(0, 8),
      customerName: `${customers.get(booking.customer_id)?.first_name} ${customers.get(booking.customer_id)?.last_name}`,
      serviceName: services.get(booking.service_id)?.name,
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      createdAt: new Date(booking.created_at).toLocaleDateString(),
    }));

    const columns = [
      { key: 'id', label: 'Booking ID' },
      { key: 'customerName', label: 'Customer' },
      { key: 'serviceName', label: 'Service' },
      { key: 'bookingDate', label: 'Date' },
      { key: 'bookingTime', label: 'Time' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created' },
    ];

    try {
      if (exportFormat === 'excel') {
        exportBookingsToExcel(bookings, customers, services, selectedFields);
        toast.success('Bookings exported to Excel');
      } else if (exportFormat === 'pdf') {
        exportToPDF('Bookings Report', enrichedData, columns);
        toast.success('Bookings exported to PDF');
      } else {
        exportToWord('Bookings Report', enrichedData, columns);
        toast.success('Bookings exported to Word');
      }
      setShowExportModal(false);
    } catch (error) {
      toast.error('Failed to export bookings');
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const columns = [
    {
      key: 'id' as const,
      label: 'Booking ID',
      render: (value: string) => value.slice(0, 8),
    },
    {
      key: 'customer_id' as const,
      label: 'Customer',
      render: (_: string, booking: Booking) => {
        const customer = customers.get(booking.customer_id);
        return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
      },
    },
    {
      key: 'service_id' as const,
      label: 'Service',
      render: (_: string, booking: Booking) => {
        const service = services.get(booking.service_id);
        return service?.name || 'Unknown';
      },
    },
    {
      key: 'booking_date' as const,
      label: 'Date',
    },
    {
      key: 'booking_time' as const,
      label: 'Time',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (_: string, booking: Booking) => (
        <select
          value={booking.status}
          onChange={(e) => handleStatusChange(booking, e.target.value as Booking['status'])}
          className="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Export
          </button>
          <Link
            href="/bookings/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Booking
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-gray-700'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Export Bookings</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="excel">Excel (.csv)</option>
                <option value="pdf">PDF</option>
                <option value="word">Word (.doc)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Filter</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exporting {filteredBookings.length} booking(s) with status: <strong>{filter}</strong>
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl my-8 dark:text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-600 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Booking ID</p>
                <p className="font-mono text-sm">{selectedBooking.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                <p className="text-sm">{selectedBooking.booking_date} at {selectedBooking.booking_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                <p className="text-sm">
                  {customers.get(selectedBooking.customer_id)?.first_name} {customers.get(selectedBooking.customer_id)?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Service</p>
                <p className="text-sm">{services.get(selectedBooking.service_id)?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="text-sm">{selectedBooking.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleStatusChange(selectedBooking, e.target.value as Booking['status'])}
                  className="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Documents */}
            <BookingDocuments
              booking_id={selectedBooking.id}
              documents={bookingDocuments.get(selectedBooking.id) || []}
              onDocumentAdded={handleDocumentAdded}
              onDocumentDeleted={handleDocumentDeleted}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedBooking);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredBookings}
        onView={handleViewBooking}
        onDelete={handleDelete}
      />
    </div>
  );
}
