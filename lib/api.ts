// lib/api.ts
import * as mockData from './mockData';
import {
  User, Employee, Lead, LeadAssignmentLog, Campaign, Service, Booking, Customer, Invoice, PaymentLink, Bank,
  DashboardMetrics, BookingDocument, EmployeeDocument
} from './types';
import { AuthContext, requireRole, requireAdmin, requireManagerOrAbove, canDeleteRecord, canCreateRecord, canAssignLead, AuthorizationError } from './auth';

// In-memory storage for demo (resets on page refresh)
let dataStore = {
  users: [...mockData.mockUsers],
  employees: [...mockData.mockEmployees],
  services: [...mockData.mockServices],
  customers: [...mockData.mockCustomers],
  bookings: [...mockData.mockBookings],
  leads: [...mockData.mockLeads],
  campaigns: [...mockData.mockCampaigns],
  invoices: [...mockData.mockInvoices],
  paymentLinks: [...mockData.mockPaymentLinks],
  banks: [...mockData.mockBanks],
  bookingDocuments: [] as BookingDocument[],
  employeeDocuments: [] as EmployeeDocument[],
  leadAssignmentLogs: [] as LeadAssignmentLog[],
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => dataStore.users,
  getById: async (id: string): Promise<User | null> =>
    dataStore.users.find(u => u.id === id) || null,
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>, currentUser: AuthContext): Promise<User> => {
    requireAdmin(currentUser);

    const newUser: User = {
      ...user,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.users.push(newUser);
    return newUser;
  },
  update: async (id: string, updates: Partial<User>, currentUser: AuthContext): Promise<User | null> => {
    requireAdmin(currentUser);

    const idx = dataStore.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.users[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.users[idx] = updated;
    return updated;
  },
  delete: async (id: string, currentUser: AuthContext): Promise<boolean> => {
    requireAdmin(currentUser);

    const idx = dataStore.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    dataStore.users.splice(idx, 1);
    return true;
  },
};

// Employees API
export const employeesApi = {
  getAll: async (): Promise<Employee[]> => dataStore.employees,
  getById: async (id: string): Promise<Employee | null> =>
    dataStore.employees.find(e => e.id === id) || null,
  create: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Employee> => {
    requireManagerOrAbove(user);

    const newEmployee: Employee = {
      ...employee,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.employees.push(newEmployee);
    return newEmployee;
  },
  update: async (id: string, updates: Partial<Employee>, user: AuthContext): Promise<Employee | null> => {
    requireManagerOrAbove(user);

    const idx = dataStore.employees.findIndex(e => e.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.employees[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.employees[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    requireManagerOrAbove(user);

    const idx = dataStore.employees.findIndex(e => e.id === id);
    if (idx === -1) return false;
    dataStore.employees.splice(idx, 1);
    return true;
  },
};

// Services API
export const servicesApi = {
  getAll: async (): Promise<Service[]> => dataStore.services,
  getById: async (id: string): Promise<Service | null> =>
    dataStore.services.find(s => s.id === id) || null,
  create: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Service> => {
    requireManagerOrAbove(user);

    const newService: Service = {
      ...service,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.services.push(newService);
    return newService;
  },
  update: async (id: string, updates: Partial<Service>, user: AuthContext): Promise<Service | null> => {
    requireManagerOrAbove(user);

    const idx = dataStore.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.services[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.services[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    requireManagerOrAbove(user);

    const idx = dataStore.services.findIndex(s => s.id === id);
    if (idx === -1) return false;
    dataStore.services.splice(idx, 1);
    return true;
  },
};

// Customers API
export const customersApi = {
  getAll: async (): Promise<Customer[]> => dataStore.customers,
  getById: async (id: string): Promise<Customer | null> =>
    dataStore.customers.find(c => c.id === id) || null,
  create: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Customer> => {
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Customer creation not authorized for this role');
    }

    const newCustomer: Customer = {
      ...customer,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.customers.push(newCustomer);
    return newCustomer;
  },
  update: async (id: string, updates: Partial<Customer>, user: AuthContext): Promise<Customer | null> => {
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Customer update not authorized for this role');
    }

    const idx = dataStore.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.customers[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.customers[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    if (!canDeleteRecord(user)) {
      throw new AuthorizationError(403, 'Customer deletion not authorized for this role');
    }

    const idx = dataStore.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    dataStore.customers.splice(idx, 1);
    return true;
  },
};

// Bookings API
export const bookingsApi = {
  getAll: async (): Promise<Booking[]> =>
    dataStore.bookings.filter(b => !b.is_deleted),
  getAllDeleted: async (): Promise<Booking[]> =>
    dataStore.bookings.filter(b => b.is_deleted),
  getById: async (id: string): Promise<Booking | null> =>
    dataStore.bookings.find(b => b.id === id && !b.is_deleted) || null,
  create: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>, user: AuthContext): Promise<Booking> => {
    // Check authorization
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Booking creation not authorized for this role');
    }

    const newBooking: Booking = {
      ...booking,
      id: String(Date.now()),
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.bookings.push(newBooking);
    return newBooking;
  },
  update: async (id: string, updates: Partial<Booking>, user: AuthContext): Promise<Booking | null> => {
    // Check authorization
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Booking update not authorized for this role');
    }

    const idx = dataStore.bookings.findIndex(b => b.id === id && !b.is_deleted);
    if (idx === -1) return null;
    const updated = { ...dataStore.bookings[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.bookings[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    // Check authorization
    if (!canDeleteRecord(user)) {
      throw new AuthorizationError(403, 'Booking deletion not authorized for this role');
    }

    const idx = dataStore.bookings.findIndex(b => b.id === id && !b.is_deleted);
    if (idx === -1) return false;
    // Soft delete
    dataStore.bookings[idx].is_deleted = true;
    dataStore.bookings[idx].deleted_at = new Date().toISOString();
    dataStore.bookings[idx].updated_at = new Date().toISOString();
    return true;
  },
  restore: async (id: string, user: AuthContext): Promise<Booking | null> => {
    // Check authorization
    requireManagerOrAbove(user);

    const idx = dataStore.bookings.findIndex(b => b.id === id && b.is_deleted);
    if (idx === -1) return null;
    dataStore.bookings[idx].is_deleted = false;
    dataStore.bookings[idx].deleted_at = undefined;
    dataStore.bookings[idx].updated_at = new Date().toISOString();
    return dataStore.bookings[idx];
  },
  permanentlyDelete: async (id: string, user: AuthContext): Promise<boolean> => {
    // Check authorization
    requireAdmin(user);

    const idx = dataStore.bookings.findIndex(b => b.id === id && b.is_deleted);
    if (idx === -1) return false;
    dataStore.bookings.splice(idx, 1);
    return true;
  },
};

// Leads API
export const leadsApi = {
  getAll: async (): Promise<Lead[]> => dataStore.leads,
  getById: async (id: string): Promise<Lead | null> =>
    dataStore.leads.find(l => l.id === id) || null,
  create: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Lead> => {
    // Check authorization
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Lead creation not authorized for this role');
    }

    const newLead: Lead = {
      ...lead,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.leads.push(newLead);
    return newLead;
  },
  update: async (id: string, updates: Partial<Lead>, user: AuthContext): Promise<Lead | null> => {
    // Check authorization
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Lead update not authorized for this role');
    }

    const idx = dataStore.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.leads[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.leads[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    // Check authorization
    if (!canDeleteRecord(user)) {
      throw new AuthorizationError(403, 'Lead deletion not authorized for this role');
    }

    const idx = dataStore.leads.findIndex(l => l.id === id);
    if (idx === -1) return false;
    dataStore.leads.splice(idx, 1);
    return true;
  },
  assign: async (leadId: string, assignedTo: string, user: AuthContext, notes?: string): Promise<LeadAssignmentLog | null> => {
    // Check authorization
    if (!canAssignLead(user)) {
      throw new AuthorizationError(403, 'Lead assignment not authorized for this role');
    }

    const lead = dataStore.leads.find(l => l.id === leadId);
    if (!lead) return null;

    const previousAssignment = lead.assigned_to;

    // Create assignment log
    const log: LeadAssignmentLog = {
      id: String(Date.now()),
      lead_id: leadId,
      assigned_by: user.userId,
      assigned_to: assignedTo,
      previous_assignment: previousAssignment,
      assignment_date: new Date().toISOString(),
      notes,
      created_at: new Date().toISOString(),
    };

    // Update lead assignment
    lead.assigned_to = assignedTo;
    lead.assigned_at = new Date().toISOString();
    lead.updated_at = new Date().toISOString();

    // Store log
    dataStore.leadAssignmentLogs.push(log);

    return log;
  },
  unassign: async (leadId: string, user: AuthContext): Promise<LeadAssignmentLog | null> => {
    // Check authorization
    if (!canAssignLead(user)) {
      throw new AuthorizationError(403, 'Lead unassignment not authorized for this role');
    }

    const lead = dataStore.leads.find(l => l.id === leadId);
    if (!lead || !lead.assigned_to) return null;

    const previousAssignment = lead.assigned_to;

    // Create unassignment log
    const log: LeadAssignmentLog = {
      id: String(Date.now()),
      lead_id: leadId,
      assigned_by: user.userId,
      assigned_to: '',
      previous_assignment: previousAssignment,
      assignment_date: new Date().toISOString(),
      notes: 'Unassigned',
      created_at: new Date().toISOString(),
    };

    // Update lead
    lead.assigned_to = undefined;
    lead.assigned_at = undefined;
    lead.updated_at = new Date().toISOString();

    // Store log
    dataStore.leadAssignmentLogs.push(log);

    return log;
  },
  bulkCreate: async (leads: Partial<Lead>[], user: AuthContext): Promise<Lead[]> => {
    // Check authorization
    if (!canCreateRecord(user)) {
      throw new AuthorizationError(403, 'Lead creation not authorized for this role');
    }

    const validLeads = leads.filter(l => l.first_name && l.email && l.company);
    const newLeads: Lead[] = validLeads.map(lead => ({
      ...lead,
      id: String(Date.now() + Math.random() * 10000),
      status: lead.status || 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    dataStore.leads.push(...newLeads);
    return newLeads;
  },
};

// Lead Assignment Logs API
export const leadAssignmentLogsApi = {
  getByLeadId: async (leadId: string): Promise<LeadAssignmentLog[]> =>
    dataStore.leadAssignmentLogs.filter(log => log.lead_id === leadId).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  getAll: async (): Promise<LeadAssignmentLog[]> =>
    dataStore.leadAssignmentLogs.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  getByAssignee: async (assigneeId: string): Promise<LeadAssignmentLog[]> =>
    dataStore.leadAssignmentLogs.filter(log => log.assigned_to === assigneeId).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  getByAssigner: async (assignerId: string): Promise<LeadAssignmentLog[]> =>
    dataStore.leadAssignmentLogs.filter(log => log.assigned_by === assignerId).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
};

// Campaigns API
export const campaignsApi = {
  getAll: async (): Promise<Campaign[]> => dataStore.campaigns,
  getById: async (id: string): Promise<Campaign | null> =>
    dataStore.campaigns.find(c => c.id === id) || null,
  create: async (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Campaign> => {
    requireManagerOrAbove(user);

    const newCampaign: Campaign = {
      ...campaign,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.campaigns.push(newCampaign);
    return newCampaign;
  },
  update: async (id: string, updates: Partial<Campaign>, user: AuthContext): Promise<Campaign | null> => {
    requireManagerOrAbove(user);

    const idx = dataStore.campaigns.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.campaigns[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.campaigns[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    requireManagerOrAbove(user);

    const idx = dataStore.campaigns.findIndex(c => c.id === id);
    if (idx === -1) return false;
    dataStore.campaigns.splice(idx, 1);
    return true;
  },
};

// Invoices API
export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => dataStore.invoices,
  getById: async (id: string): Promise<Invoice | null> =>
    dataStore.invoices.find(i => i.id === id) || null,
  create: async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Invoice> => {
    requireManagerOrAbove(user);

    const newInvoice: Invoice = {
      ...invoice,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.invoices.push(newInvoice);
    return newInvoice;
  },
  update: async (id: string, updates: Partial<Invoice>, user: AuthContext): Promise<Invoice | null> => {
    requireManagerOrAbove(user);

    const idx = dataStore.invoices.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.invoices[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.invoices[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    requireManagerOrAbove(user);

    const idx = dataStore.invoices.findIndex(i => i.id === id);
    if (idx === -1) return false;
    dataStore.invoices.splice(idx, 1);
    return true;
  },
};

// Payment Links API
export const paymentLinksApi = {
  getAll: async (): Promise<PaymentLink[]> => dataStore.paymentLinks,
  getById: async (id: string): Promise<PaymentLink | null> =>
    dataStore.paymentLinks.find(pl => pl.id === id) || null,
  create: async (link: Omit<PaymentLink, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentLink> => {
    const newLink: PaymentLink = {
      ...link,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.paymentLinks.push(newLink);
    return newLink;
  },
};

// Banks API
export const banksApi = {
  getAll: async (): Promise<Bank[]> => dataStore.banks,
  getById: async (id: string): Promise<Bank | null> =>
    dataStore.banks.find(b => b.id === id) || null,
  create: async (bank: Omit<Bank, 'id' | 'created_at' | 'updated_at'>, user: AuthContext): Promise<Bank> => {
    requireAdmin(user);

    const newBank: Bank = {
      ...bank,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataStore.banks.push(newBank);
    return newBank;
  },
  update: async (id: string, updates: Partial<Bank>, user: AuthContext): Promise<Bank | null> => {
    requireAdmin(user);

    const idx = dataStore.banks.findIndex(b => b.id === id);
    if (idx === -1) return null;
    const updated = { ...dataStore.banks[idx], ...updates, updated_at: new Date().toISOString() };
    dataStore.banks[idx] = updated;
    return updated;
  },
  delete: async (id: string, user: AuthContext): Promise<boolean> => {
    requireAdmin(user);

    const idx = dataStore.banks.findIndex(b => b.id === id);
    if (idx === -1) return false;
    dataStore.banks.splice(idx, 1);
    return true;
  },
};

// Dashboard API
export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const bookings = dataStore.bookings;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const invoices = dataStore.invoices;
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    const wonLeads = dataStore.leads.filter(l => l.status === 'won').length;
    const totalLeads = dataStore.leads.length;

    return {
      total_bookings: bookings.length,
      pending_bookings: pending,
      completed_bookings: completed,
      total_revenue: totalRevenue,
      total_customers: dataStore.customers.length,
      total_leads: totalLeads,
      conversion_rate: totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0,
    };
  },
};

// Booking Documents API
export const bookingDocumentsApi = {
  getByBookingId: async (booking_id: string): Promise<BookingDocument[]> =>
    dataStore.bookingDocuments.filter(d => d.booking_id === booking_id),

  create: async (doc: Omit<BookingDocument, 'id'>): Promise<BookingDocument> => {
    const newDoc: BookingDocument = {
      ...doc,
      id: String(Date.now()),
    };
    dataStore.bookingDocuments.push(newDoc);
    return newDoc;
  },

  delete: async (id: string): Promise<boolean> => {
    const idx = dataStore.bookingDocuments.findIndex(d => d.id === id);
    if (idx === -1) return false;
    dataStore.bookingDocuments.splice(idx, 1);
    return true;
  },

  deleteByBookingId: async (booking_id: string): Promise<boolean> => {
    const initialLength = dataStore.bookingDocuments.length;
    dataStore.bookingDocuments = dataStore.bookingDocuments.filter(d => d.booking_id !== booking_id);
    return dataStore.bookingDocuments.length < initialLength;
  },
};

// Employee Documents API
export const employeeDocumentsApi = {
  getByEmployeeId: async (employee_id: string): Promise<EmployeeDocument[]> =>
    dataStore.employeeDocuments.filter(d => d.employee_id === employee_id),

  create: async (doc: Omit<EmployeeDocument, 'id'>): Promise<EmployeeDocument> => {
    const newDoc: EmployeeDocument = {
      ...doc,
      id: String(Date.now()),
    };
    dataStore.employeeDocuments.push(newDoc);
    return newDoc;
  },

  delete: async (id: string): Promise<boolean> => {
    const idx = dataStore.employeeDocuments.findIndex(d => d.id === id);
    if (idx === -1) return false;
    dataStore.employeeDocuments.splice(idx, 1);
    return true;
  },

  deleteByEmployeeId: async (employee_id: string): Promise<boolean> => {
    const initialLength = dataStore.employeeDocuments.length;
    dataStore.employeeDocuments = dataStore.employeeDocuments.filter(d => d.employee_id !== employee_id);
    return dataStore.employeeDocuments.length < initialLength;
  },
};
