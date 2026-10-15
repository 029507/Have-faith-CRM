'use client';

import { useCallback, useState } from 'react';
import { BookingDocument } from '@/lib/types';
import { Upload, X, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateFile, formatFileSize, getFileIcon, downloadFile, createBookingDocument } from '@/lib/documentUtils';

interface BookingDocumentsProps {
  booking_id: string;
  documents: BookingDocument[];
  onDocumentAdded: (doc: BookingDocument) => void;
  onDocumentDeleted: (docId: string) => void;
  readOnly?: boolean;
}

export default function BookingDocuments({
  booking_id,
  documents,
  onDocumentAdded,
  onDocumentDeleted,
  readOnly = false,
}: BookingDocumentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'File validation failed');
        return;
      }

      try {
        setIsUploading(true);

        // Create document
        const doc = await createBookingDocument(
          file,
          booking_id,
          'current_user', // In real app, get from auth
          description
        );

        if (doc) {
          onDocumentAdded(doc);
          toast.success(`${file.name} uploaded successfully`);
          setDescription('');
          // Reset input
          e.target.value = '';
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    },
    [booking_id, description, onDocumentAdded]
  );

  const handleDelete = (docId: string, filename: string) => {
    if (confirm(`Delete ${filename}?`)) {
      onDocumentDeleted(docId);
      toast.success('Document deleted');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Documents
        </h3>
        {documents.length > 0 && (
          <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            {documents.length} file{documents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Upload Section */}
      {!readOnly && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Booking confirmation, Proof of payment"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                disabled={isUploading}
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className={`w-8 h-8 ${isUploading ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, images, Word, Excel up to 10MB
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No documents attached</p>
          {!readOnly && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add documents to this booking
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
            >
              <span className="text-xl">{getFileIcon(doc.file_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {doc.filename}
                </p>
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  {doc.description && (
                    <>
                      <span>•</span>
                      <span className="text-gray-600 dark:text-gray-300">{doc.description}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(doc.file_url, doc.filename)}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
