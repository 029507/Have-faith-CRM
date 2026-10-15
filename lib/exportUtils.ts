// lib/exportUtils.ts
import { Booking, Invoice, Customer, Service } from './types';

export interface ExportOptions {
  fields: string[];
  format: 'pdf' | 'excel' | 'word';
  filename: string;
}

// Generate CSV content for Excel
export const generateCSV = (
  data: any[],
  fields: string[],
  headers: Record<string, string>
): string => {
  if (data.length === 0) return '';

  // Header row
  const headerRow = fields.map(field => `"${headers[field] || field}"`).join(',');

  // Data rows
  const dataRows = data.map(item =>
    fields.map(field => {
      const value = item[field];
      if (value === undefined || value === null) return '';

      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

// Download file helper
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export bookings to Excel
export const exportBookingsToExcel = (
  bookings: Booking[],
  customers: Map<string, Customer>,
  services: Map<string, Service>,
  selectedFields: string[]
) => {
  const enrichedData = bookings.map(booking => ({
    id: booking.id,
    customerName: `${customers.get(booking.customer_id)?.first_name} ${customers.get(booking.customer_id)?.last_name}`,
    serviceName: services.get(booking.service_id)?.name,
    bookingDate: booking.booking_date,
    bookingTime: booking.booking_time,
    status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    createdAt: new Date(booking.created_at).toLocaleDateString(),
  }));

  const headers: Record<string, string> = {
    id: 'Booking ID',
    customerName: 'Customer',
    serviceName: 'Service',
    bookingDate: 'Date',
    bookingTime: 'Time',
    status: 'Status',
    createdAt: 'Created',
  };

  const fieldsToExport = selectedFields.length > 0 ? selectedFields : Object.keys(headers);
  const csv = generateCSV(enrichedData, fieldsToExport, headers);

  downloadFile(
    csv,
    `bookings-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
};

// Export invoices to Excel
export const exportInvoicesToExcel = (
  invoices: Invoice[],
  customers: Map<string, Customer>,
  selectedFields: string[]
) => {
  const enrichedData = invoices.map(invoice => ({
    invoiceNumber: invoice.invoice_number,
    customerName: `${customers.get(invoice.customer_id)?.first_name} ${customers.get(invoice.customer_id)?.last_name}`,
    amount: `₹${invoice.amount.toFixed(2)}`,
    tax: `₹${invoice.tax.toFixed(2)}`,
    total: `₹${invoice.total.toFixed(2)}`,
    status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
    dueDate: invoice.due_date,
    issuedDate: invoice.issued_date,
  }));

  const headers: Record<string, string> = {
    invoiceNumber: 'Invoice #',
    customerName: 'Customer',
    amount: 'Amount',
    tax: 'Tax',
    total: 'Total',
    status: 'Status',
    dueDate: 'Due Date',
    issuedDate: 'Issued Date',
  };

  const fieldsToExport = selectedFields.length > 0 ? selectedFields : Object.keys(headers);
  const csv = generateCSV(enrichedData, fieldsToExport, headers);

  downloadFile(
    csv,
    `invoices-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
};

// Generate simple HTML for PDF/Word
export const generateHTML = (
  title: string,
  data: any[],
  columns: Array<{ key: string; label: string }>
): string => {
  const rows = data.map(item =>
    columns
      .map(col => `<td style="padding: 10px; border: 1px solid #ddd;">${item[col.key] || ''}</td>`)
      .join('')
  ).join('');

  const headerRow = columns
    .map(col => `<th style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">${col.label}</th>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { text-align: left; }
        .timestamp { color: #666; font-size: 0.9em; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${data.map(item => `<tr>${columns.map(col => `<td style="padding: 10px; border: 1px solid #ddd;">${item[col.key] || ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="timestamp">
        <p>End of Report</p>
      </div>
    </body>
    </html>
  `;
};

// Export to Word (as HTML file with .doc extension)
export const exportToWord = (
  title: string,
  data: any[],
  columns: Array<{ key: string; label: string }>
) => {
  const html = generateHTML(title, data, columns);
  downloadFile(
    html,
    `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.doc`,
    'application/msword'
  );
};

// Export to PDF (simple text-based approach)
export const exportToPDF = (
  title: string,
  data: any[],
  columns: Array<{ key: string; label: string }>
) => {
  let content = `${title}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += '='.repeat(80) + '\n\n';

  // Header row
  const columnWidths = columns.map(col => Math.max(col.label.length, 15));
  const headerLine = columns
    .map((col, i) => col.label.padEnd(columnWidths[i]))
    .join(' | ');

  content += headerLine + '\n';
  content += '-'.repeat(headerLine.length) + '\n';

  // Data rows
  data.forEach(item => {
    const row = columns
      .map((col, i) => String(item[col.key] || '').padEnd(columnWidths[i]))
      .join(' | ');
    content += row + '\n';
  });

  content += '\n' + '='.repeat(80) + '\n';
  content += 'End of Report\n';

  downloadFile(
    content,
    `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`,
    'text/plain'
  );
};
