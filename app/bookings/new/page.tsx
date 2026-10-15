// app/bookings/new/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingsApi, customersApi, servicesApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import { Customer, Service } from '@/lib/types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBookingPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    booking_date: '',
    booking_time: '',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentUser(getCurrentUser());
        const [customersData, servicesData] = await Promise.all([
          customersApi.getAll(),
          servicesApi.getAll(),
        ]);
        setCustomers(customersData);
        setServices(servicesData);
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.service_id || !formData.booking_date || !formData.booking_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const service = services.find(s => s.id === formData.service_id);
      await bookingsApi.create({
        customer_id: formData.customer_id,
        service_id: formData.service_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        duration_minutes: service?.duration_minutes || 30,
        status: 'pending',
        notes: formData.notes,
      }, currentUser!);
      toast.success('Booking created successfully');
      router.push('/bookings');
    } catch (error) {
      if (error instanceof AuthorizationError) {
        toast.error(`Unauthorized: ${error.message}`);
      } else {
        toast.error('Failed to create booking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Link href="/bookings" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
        <ArrowLeft size={20} />
        Back to Bookings
      </Link>

      <div className="bg-white rounded-lg shadow p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create New Booking</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time *
            </label>
            <input
              type="time"
              value={formData.booking_time}
              onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-24"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
