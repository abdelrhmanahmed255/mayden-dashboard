import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { LoadingSpinner, Alert } from '../components/UI';
import type { Document } from '../types';

const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument(parseInt(id, 10));
    }
  }, [id]);

  const fetchDocument = async (documentId: number) => {
    try {
      setIsLoading(true);
      const doc = await documentsApi.getById(documentId);
      setDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    
    if (!window.confirm(`Are you sure you want to delete "${document.original_filename || document.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await documentsApi.delete(document.id);
      navigate('/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      setIsDeleting(false);
    }
  };

  const copyShareLink = () => {
    if (!document) return;
    
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/uploads/portal/user_documents/${document.uuid}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message={error || 'Document not found'} />
        <Link
          to="/documents"
          className="mt-4 inline-block text-gov-primary hover:text-gov-dark"
        >
          ← Back to Documents
        </Link>
      </div>
    );
  }

  const baseUrl = window.location.origin;
  const pdfPath = `/uploads/portal/user_documents/${document.uuid}`;
  const embedUrl = pdfPath;
  const downloadUrl = pdfPath;
  const shareUrl = `${baseUrl}${pdfPath}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link to="/documents" className="text-gov-primary hover:text-gov-dark">
          ← Back to Documents
        </Link>
      </nav>

      {/* Copy Success Alert */}
      {copySuccess && (
        <div className="mb-6">
          <Alert type="success" message="Share link copied to clipboard!" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 truncate flex-1">
                {document.original_filename || document.name}
              </h2>
            </div>
            <div className="aspect-[8.5/11] bg-gray-200">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                title={document.original_filename || document.name || 'PDF Document'}
              />
            </div>
          </div>
        </div>

        {/* Document Info Sidebar */}
        <div className="space-y-6">
          {/* Document Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Filename</dt>
                <dd className="text-sm font-medium text-gray-900 break-all">{document.original_filename || document.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">UUID</dt>
                <dd className="text-sm font-mono text-gray-900 break-all">{document.uuid}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">File Size</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {document.file_size ? `${(document.file_size / 1024).toFixed(2)} KB` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Upload Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(document.upload_timestamp || document.upload_date || Date.now()).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Hit Count</dt>
                <dd className="text-sm font-medium text-gray-900">{document.hit_count || 0}</dd>
              </div>
            </dl>
          </div>

          {/* Share Link */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Link</h3>
            <p className="text-xs text-gray-500 mb-2">
              Public URL following the structure: /uploads/portal/user_documents/{'{'}uuid{'}'}/{'{'}filename{'}'}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <code className="text-xs text-gray-700 break-all">{shareUrl}</code>
            </div>
            <button
              onClick={copyShareLink}
              className="w-full px-4 py-2 bg-gov-primary hover:bg-gov-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Share Link</span>
            </button>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
              </a>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open in New Tab</span>
              </a>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
