// app/leads/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadsApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/mockAuth';
import { AuthContext } from '@/lib/auth';
import { AuthorizationError } from '@/lib/auth';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, FileText, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Lead } from '@/lib/types';

interface ParsedLead {
 first_name: string;
 last_name: string;
 email: string;
 phone: string;
 company: string;
 source: string;
 status: string;
}

interface CSVUploadResult {
  success: boolean;
 message: string;
 created: number;
  errors: string[];
}

const ALLOWED_SOURCES = [
 'LinkedIn',
 'Email Campaign',
 'Referral',
 'Website',
 'Cold Call',
 '',
];
const ALLOWED_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'];

export default function NewLeadPage() {
 const router = useRouter();
 const [currentUser, setCurrentUser] = useState<AuthContext | null>(null);
 const [uploading, setUploading] = useState(false);
 const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
 const [previewLeads, setPreviewLeads] = useState<ParsedLead[]>([]);
 const [showPreview, setShowPreview] = useState(false);
 const [uploadError, setUploadError] = useState<string | null>(null);
 const [showForm, setShowForm] = useState(false); // toggle tabs const [formData, setFormData] = useState({
 first_name: '',
 last_name: '',
 email: '',
 phone: '',
 company: '',
 source: '',
 });

 const [submitting, setSubmitting] = useState(false);

 // -----------------------------
 // Individual lead creation // -----------------------------
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (!formData.first_name || !formData.email || !formData.company) {
 toast.error('Please fill in required fields (First Name, Email, Company)');
 return;
 }

 setSubmitting(true);
 try {
 if (!currentUser) {
 toast.error('User context not available');
 return;
 }

 await leadsApi.create({ ...formData, status: 'new' }, currentUser);
 toast.success('Lead created successfully');
 setFormData({
 first_name: '',
 last_name: '',
 email: '',
 phone: '',
 company: '',
 source: '',
 });
 } catch (error) {
 if (error instanceof AuthorizationError) {
 toast.error(`Unauthorized: ${error.message}`);
 } else {
 toast.error('Failed to create lead');
      }
 } finally {
 setSubmitting(false);
 }
 };

 // -----------------------------
 // CSV parsing // -----------------------------
 const parseCSV = (csvContent: string): ParsedLead[] => {
 const lines = csvContent.trim().split('\n');
 if (lines.length === 0) return [];

 const headers = lines[0]
 .split(',')
 .map((h) => h.trim().toLowerCase());

 const leads: ParsedLead[] = [];
 for (let i = 1; i < lines.length; i++) {
 const values = lines[i].split(',').map((v) => v.trim());
 const lead: Partial<ParsedLead> = {};

 headers.forEach((header, index) => {
 if (index < values.length) {
 switch (header) {
 case 'first_name':
 lead.first_name = values[index];
 break;
 case 'last_name':
 lead.last_name = values[index];
 break;
 case 'email':
 lead.email = values[index];
 break;
 case 'phone':
 lead.phone = values[index];
 break;
 case 'company':
 lead.company = values[index];
 break;
 case 'source':
 lead.source = values[index];
 break;
 case 'status':
 lead.status = values[index].toLowerCase();
 break;
 }
 }
 });

 if (lead.email) {
 leads.push({
 first_name: lead.first_name ?? '',
 last_name: lead.last_name ?? '',
 email: lead.email,
 phone: lead.phone ?? '',
 company: lead.company ?? '',
 source: lead.source ?? '',
 status: lead.status ?? 'new',
 });
 }
 }

 return leads;
 };

 // -----------------------------
 // File upload // -----------------------------
 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setUploadError(null);
 setUploadResult(null);
 setUploading(true);

 try {
 if (!currentUser) {
 setCurrentUser(getCurrentUser());
 }

 const text = await file.text();
 const leads = parseCSV(text);

 if (leads.length === 0) {
 setUploadError('No valid leads found in CSV file');
 setUploading(false);
 return;
 }

 setPreviewLeads(leads);
 setShowPreview(true);
 } catch (error) {
 setUploadError(
 "Failed to read CSV file. Please ensure it's a valid CSV format."
 );
 console.error(error);
 } finally {
 setUploading(false);
 e.target.value = ''; // reset input }
 };

 // -----------------------------
 // CSV import confirmation  // -----------------------------
 const handleBulkUpload = async () => {
 if (!currentUser) {
 toast.error('User context not available');
 return;
 }

 setUploading(true);
 const errors: string[] = [];
 const validLeads: Partial<Lead>[] = [];

 previewLeads.forEach((lead, index) => {
 const rowErrors: string[] = [];

 if (!lead.email) rowErrors.push(`Row ${index +2}: Email is required`);
 if (!lead.first_name) rowErrors.push(`Row ${index +2}: First Name is required`);
 if (!lead.company) rowErrors.push(`Row ${index +2}: Company is required`);
 if (lead.source && !ALLOWED_SOURCES.includes(lead.source))
 rowErrors.push(`Row ${index +2}: Invalid source "${lead.source}"`);
 if (lead.status && !ALLOWED_STATUSES.includes(lead.status))
 rowErrors.push(`Row ${index +2}: Invalid status "${lead.status}"`);

 if (rowErrors.length > 0) {
 errors.push(...rowErrors);
 } else if (lead.email) {
 validLeads.push(lead);
 }
 });

 if (validLeads.length === 0) {
 setUploadResult({
 success: false,
 message: 'No valid leads to import',
 created: 0,
 errors,
 });
 setUploading(false);
 return;
 }

 try {
 const created = await leadsApi.bulkCreate(validLeads, currentUser);
 setUploadResult({
 success: true,
 message: `Successfully imported ${created.length} leads`,
 created: created.length,
 errors,
 });
 toast.success(`${created.length} leads imported successfully`);
 router.push('/leads');
 } catch (error) {
 if (error instanceof AuthorizationError) {
 toast.error(`Unauthorized: ${error.message}`);
 } else {
 toast.error('Failed to import leads');
 }
 setUploadResult({
 success: false,
 message: 'Import failed',
 created: 0,
 errors: error instanceof Error ? [error.message] : ['Unknown error'],
 });
 } finally {
 setUploading(false);
 }
 };

 // -----------------------------
 // Input change // -----------------------------
 const handleInputChange = (
 e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
 ) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
 <Link href="/leads" className="flex items-center gap-2 text-primary hover:text-primary-dark mb-8">
 <ArrowLeft size={20} />
 Back to Leads </Link>

 <div className="max-w-4xl mx-auto">
 {/* Header */}
 <div className="mb-8 animate-fade-in delay-100">
 <h1 className="text-3xl font-bold gradient-text mb-2">
 Import New Leads </h1>
 <p className="text-gray-600 dark:text-gray-300">
 Bulk import leads from CSV file or add them individually </p>
 </div>

 {/* Tabs */}
 <div className="mb-8">
 <div className="flex border-b border-gray-200 dark:border-gray-700">
 <button onClick={() => setShowForm(false)}
 className={`px-6 py-3 text-lg font-medium ${
 !showForm ? 'text-primary border-b-2 border-primary'
 : 'text-gray-500 hover:text-gray-400'
 } transition-all`}
 >
 CSV Upload </button>
 <button onClick={() => setShowForm(true)}
 className={`px-6 py-3 text-lg font-medium ${
 showForm ? 'text-primary border-b-2 border-primary'
 : 'text-gray-500 hover:text-gray-400'
 } transition-all`}
 >
 Add Lead Manually </button>
 </div>
 </div>

 {/* CSV Upload Section */}
 {!showForm && (
 <div className="glass p-8 rounded-lg border border-gray-200 dark:border-gray-700 mb-8 animate-fade-in delay-200">
 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
 <Upload size={24} />
 Bulk Import Leads (CSV)
 </h2>

 <div className="mb-6">
 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 CSV Format Requirements:
 </h3>
 <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
 <li>• <strong>Required columns:</strong> first_name, email, company</li>
 <li>• <strong>Optional columns:</strong> last_name, phone, source, status</li>
 <li>• <strong>Valid sources:</strong> LinkedIn, Email Campaign, Referral, Website, Cold Call</li>
 <li>• <strong>Valid statuses:</strong> new, contacted, qualified, won, lost (default: new)</li>
 </ul>
 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm text-gray-600 dark:text-gray-300">
 first_name,last_name,email,phone,company,source,status&#10;
                John,Doe,john@example.com,555-1234,Acme Corp,LinkedIn,new&#10;
 Jane,Smith,jane@example.com,,Tech Inc,Website,contacted </div>
 </div>

 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-all duration-300 hover:bg-primary/5">
 <input type="file"
 accept=".csv,text/csv"
 onChange={handleFileUpload}
 className="hidden"
 id="csv-upload"
 />
 <label htmlFor="csv-upload"
 className="cursor-pointer flex flex-col items-center justify-center py-6"
 >
 <FileText className="h-16 w-16 text-primary/80 mb-4" />
 <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
 {uploading ? 'Processing...' : 'Click to upload CSV file'}
 </span>
 <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
 or drag and drop (not supported in this browser)
 </span>
 </label>
 </div>

 {uploadError && (
 <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 rounded-lg">
 <p className="text-red-800 dark:text-red-200 text-sm">{uploadError}</p>
 </div>
 )}

 {/* Preview and Confirmation */}
 {showPreview && previewLeads.length > 0 && !uploadResult && (
 <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
 <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-4">
 Preview {previewLeads.length} leads to import </h3>
 <div className="overflow-x-auto">
 <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
 <thead>
 <tr className="bg-gray-100 dark:bg-gray-700">
 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
 First Name </th>
 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
 Last Name </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
 Email </th>
 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
 Company
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
 Source </th>
 <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
 Status </th>
                      </tr>
 </thead>
 <tbody>
 {previewLeads.slice(0,10).map((lead, idx) => (
 <tr key={idx}
 className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
 >
 <td className="px-4 py-3 text-sm">{lead.first_name}</td>
 <td className="px-4 py-3 text-sm">{lead.last_name}</td>
 <td className="px-4 py-3 text-sm">{lead.email}</td>
 <td className="px-4 py-3 text-sm">{lead.company}</td>
 <td className="px-4 py-3 text-sm">{lead.source ?? '-'}</td>
 <td className="px-4 py-3 text-sm">{lead.status}</td>
 </tr>
 ))}
 {previewLeads.length >10 && (
 <tr>
 <td colSpan={6}
 className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
 >
 …and {previewLeads.length -10} more rows </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 <div className="mt-6 flex justify-end gap-4">
 <button onClick={() => {
 setShowPreview(false);
 setPreviewLeads([]);
 }}
 className="px-5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
 disabled={uploading}
 className={`px-5 py-2.5 text-sm ${
 uploading ? 'bg-gray-400' : 'bg-primary'
 } text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-all`}
 >
 {uploading ? 'Importing...' : `Import ${previewLeads.length} Leads`}
 </button>
 </div>
 </div>
 )}

 {/* Upload Result */}
 {uploadResult && (
 <div className={`mt-8 p-6 rounded-xl ${
 uploadResult.success ? 'bg-green-50 dark:bg-green-900/20'
 : 'bg-red-50 dark:bg-red-900/20'
 } border ${
 uploadResult.success ? 'border-green-200' : 'border-red-200'
 } dark:border-${uploadResult.success ? 'green-500' : 'red-500'}/20`}
 >
 <div className="flex items-center">
 {uploadResult.success ? (
 <Check className="h-6 w-6 text-green-500 mr-3" />
 ) : (
 <X className="h-6 w-6 text-red-500 mr-3" />
 )}
 <div>
 <h3 className="font-medium text-lg">
 {uploadResult.message}
 </h3>
 {uploadResult.created > 0 && (
 <p className="text-gray-600 dark:text-gray-300 mt-1">
 Successfully processed {uploadResult.created} leads </p>
 )}
 </div>
 </div>
 {uploadResult.errors.length > 0 && (
 <div className="mt-5">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
 Issues found:
 </p>
 <ul className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
 {uploadResult.errors.slice(0, 5).map((err, idx) => (
 <li key={idx}>• {err}</li>
 ))}
 {uploadResult.errors.length > 5 && (
 <li className="mt-2">
 …and {uploadResult.errors.length - 5} more issues </li>
 )}
 </ul>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {/* Manual Form Section */}
 {showForm && (
 <div className="glass p-8 rounded-lg border border-gray-200 dark:border-gray-700 mb-8 animate-fade-in delay-200">
 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
 <FileText size={24} />
 Add Lead Manually </h2>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid gap-4 md:grid-cols-2">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
 First Name *
 </label>
 <input type="text"
 name="first_name"
 value={formData.first_name}
 onChange={handleInputChange}
 className="input-enhanced w-full"
 placeholder="Enter first name"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
 Last Name </label>
 <input type="text"
 name="last_name"
 value={formData.last_name}
 onChange={handleInputChange}
 className="input-enhanced w-full"
 placeholder="Enter last name"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
 Email *
 </label>
 <input type="email"
 name="email"
 value={formData.email}
 onChange={handleInputChange}
 className="input-enhanced w-full"
 placeholder="Enter email address"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
 Phone </label>
 <input type="tel"
 name="phone"
 value={formData.phone}
 onChange={handleInputChange}
 className="input-enhanced w-full"
 placeholder="Enter phone number"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
 Company *
 </label>
 <input type="text"
 name="company"
 value={formData.company}
 onChange={handleInputChange}
 className="input-enhanced w-full"
 placeholder="Enter company name"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
 Source </label>
 <select name="source"
 value={formData.source}
 onChange={handleInputChange}
 className="input-enhanced w-full"
 >
 <option value="">Select source (optional)</option>
                    {ALLOWED_SOURCES.filter((s) => s !== '').map((s) => (
 <option key={s} value={s}>
 {s}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <button type="submit"
 disabled={submitting}
 className="btn-primary px-8 py-3 flex items-center gap-2"
 >
 {submitting ? (
 <>
 <svg className="animate-spin h-4 w-4"
 viewBox="002424"
 fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
 <path d="M12 6v6m0 0l3-3m-3 3l-3-3" strokeLinecap="round" />
 </svg>
 Adding lead...
 </>
 ) : (
 <>
 <Check size={20} />
 Add Lead </>
 )}
 </button>

 <button type="button"
 onClick={() => {
 setFormData({
 first_name: '',
 last_name: '',
                      email: '',
                      phone: '',
                      company: '',
 source: '',
 });
 }}
 className="btn-outline px-8 py-3 flex items-center gap-2"
 >
 <X size={20} />
 Clear Form                </button>
              </div>
 </form>
 </div>
 )}
 </div>
 </div>
 );
}