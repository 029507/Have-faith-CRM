// lib/types.ts
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user' | 'employee';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Employee {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'on_leave';
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  source: string;
  campaign_id?: string;
  assigned_to?: string; // User ID or Employee ID of assigned person
  assigned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadAssignmentLog {
  id: string;
  lead_id: string;
  assigned_by: string; // User ID of person making assignment
  assigned_to: string; // User ID or Employee ID of assigned person
  previous_assignment?: string; // Previous assignee
  assignment_date: string;
  notes?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'call' | 'meeting';
  status: 'draft' | 'active' | 'completed' | 'paused';
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  booking_id?: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issued_date: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentLink {
  id: string;
  invoice_id: string;
  payment_url: string;
  status: 'active' | 'completed' | 'expired';
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  branch: string;
  swift_code: string;
  iban?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  total_customers: number;
  total_leads: number;
  conversion_rate: number;
}

export interface TrashItem {
  id: string;
  booking_id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  deleted_at: string;
  deleted_by?: string;
  created_at: string;
}

export interface BookingDocument {
  id: string;
  booking_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  file_url: string;
  document_type: 'resume' | 'certificate' | 'identification' | 'contract' | 'other';
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}
