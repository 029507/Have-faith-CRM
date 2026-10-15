// lib/documentUtils.ts
import { BookingDocument, EmployeeDocument } from './types';

// File upload configuration
export const DOCUMENT_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'],
};

// Validate file before upload
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > DOCUMENT_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${DOCUMENT_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
  if (!DOCUMENT_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Supported: PDF, images, Word, Excel`,
    };
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!DOCUMENT_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension not allowed. Supported: ${DOCUMENT_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Return only the base64 part
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Create booking document
export const createBookingDocument = async (
  file: File,
  booking_id: string,
  uploaded_by: string,
  description?: string
): Promise<BookingDocument | null> => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64 = await fileToBase64(file);
  const fileUrl = `data:${file.type};base64,${base64}`;

  const doc: BookingDocument = {
    id: String(Date.now()),
    booking_id,
    filename: file.name,
    file_size: file.size,
    file_type: file.type,
    file_url: fileUrl,
    uploaded_by,
    uploaded_at: new Date().toISOString(),
    description,
  };

  return doc;
};

// Create employee document
export const createEmployeeDocument = async (
  file: File,
  employee_id: string,
  document_type: EmployeeDocument['document_type'],
  uploaded_by: string,
  description?: string
): Promise<EmployeeDocument | null> => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64 = await fileToBase64(file);
  const fileUrl = `data:${file.type};base64,${base64}`;

  const doc: EmployeeDocument = {
    id: String(Date.now()),
    employee_id,
    filename: file.name,
    file_size: file.size,
    file_type: file.type,
    file_url: fileUrl,
    document_type,
    uploaded_by,
    uploaded_at: new Date().toISOString(),
    description,
  };

  return doc;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Get file icon based on type
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
  return '📎';
};

// Download file
export const downloadFile = (fileUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
