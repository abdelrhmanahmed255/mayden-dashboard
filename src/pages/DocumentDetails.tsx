import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { LoadingSpinner, Alert } from '../components/UI';
import type { Document } from '../types';

const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
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
      
      // Fetch related documents if this is a split document
      if (doc.parent_uuid || doc.document_type === 'merged') {
        await fetchRelatedDocuments(doc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedDocuments = async (doc: Document) => {
    try {
      // Fetch all documents and filter for related ones
      const response = await documentsApi.list(1, 100);
      const related: Document[] = [];

      if (doc.document_type === 'merged') {
        // If this is a merged document, find its children
        related.push(...response.documents.filter(d => d.parent_uuid === doc.uuid));
      } else if (doc.parent_uuid) {
        // If this is a child, find the parent and siblings
        const parent = response.documents.find(d => d.uuid === doc.parent_uuid);
        if (parent) related.push(parent);
        related.push(...response.documents.filter(d => 
          d.parent_uuid === doc.parent_uuid && d.id !== doc.id
        ));
      }

      setRelatedDocuments(related);
    } catch (err) {
      console.error('Failed to fetch related documents:', err);
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
      navigate('/admin/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      setIsDeleting(false);
    }
  };

  const copyShareLink = () => {
    if (!document) return;
    
    const shareUrl = document.storage_url || `${window.location.origin}/uploads/portal/user_documents/${document.uuid}`;
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
          to="/sys-admin-portal/documents"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700"
        >
          ← Back to Documents
        </Link>
      </div>
    );
  }

  const embedUrl = document.storage_url || `/uploads/portal/user_documents/${document.uuid}`;
  const downloadUrl = document.storage_url || `/uploads/portal/user_documents/${document.uuid}`;
  const shareUrl = document.storage_url || `${window.location.origin}/uploads/portal/user_documents/${document.uuid}`;

  const getDocumentTypeLabel = (type?: string) => {
    if (type === 'first_page') return { label: 'First Page', color: 'bg-blue-100 text-blue-800', icon: '📄' };
    if (type === 'remaining_pages') return { label: 'Remaining Pages', color: 'bg-blue-100 text-blue-800', icon: '📑' };
    if (type === 'merged') return { label: 'Merged Document', color: 'bg-green-100 text-green-800', icon: '📋' };
    return { label: 'Document', color: 'bg-gray-100 text-gray-800', icon: '📄' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 sm:mb-6">
        <Link to="/sys-admin-portal/documents" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
          ← Back to Documents
        </Link>
      </nav>

      {/* Copy Success Alert */}
      {copySuccess && (
        <div className="mb-4 sm:mb-6">
          <Alert type="success" message="Share link copied to clipboard!" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* PDF Viewer */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-3 sm:px-4 py-3 border-b flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {document.original_filename || document.name}
                </h2>
                {document.document_type && (
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${getDocumentTypeLabel(document.document_type).color}`}>
                    {getDocumentTypeLabel(document.document_type).icon} {getDocumentTypeLabel(document.document_type).label}
                  </span>
                )}
              </div>
            </div>
            <div className="aspect-[8.5/11] bg-gray-200">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                title={document.original_filename || document.name || 'PDF Document'}
              />
            </div>
          </div>

          {/* Related Documents */}
          {relatedDocuments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedDocuments.map((relDoc) => {
                  const typeInfo = getDocumentTypeLabel(relDoc.document_type);
                  return (
                    <Link
                      key={relDoc.id}
                      to={`/sys-admin-portal/documents/${relDoc.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{typeInfo.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {relDoc.original_filename}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            ID: {relDoc.id}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Document Info Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Document Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
            <dl className="space-y-3 sm:space-y-4">
              <div>
                <dt className="text-xs sm:text-sm text-gray-500">Filename</dt>
                <dd className="text-sm font-medium text-gray-900 break-all mt-1">{document.original_filename || document.name}</dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm text-gray-500">UUID</dt>
                <dd className="text-xs sm:text-sm font-mono text-gray-900 break-all mt-1">{document.uuid}</dd>
              </div>
              {document.document_type && (
                <div>
                  <dt className="text-xs sm:text-sm text-gray-500">Document Type</dt>
                  <dd className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${getDocumentTypeLabel(document.document_type).color}`}>
                      {getDocumentTypeLabel(document.document_type).label}
                    </span>
                  </dd>
                </div>
              )}
              {document.parent_uuid && (
                <div>
                  <dt className="text-xs sm:text-sm text-gray-500">Parent UUID</dt>
                  <dd className="text-xs sm:text-sm font-mono text-gray-900 break-all mt-1">{document.parent_uuid}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs sm:text-sm text-gray-500">Upload Date</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(document.upload_timestamp || document.upload_date || Date.now()).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm text-gray-500">Hit Count</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{document.hit_count || 0}</dd>
              </div>
            </dl>
          </div>

          {/* Share Link */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Share Link</h3>
            <p className="text-xs text-gray-500 mb-2">
              Public URL to access this document
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <code className="text-xs text-gray-700 break-all">{shareUrl}</code>
            </div>
            <button
              onClick={copyShareLink}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Share Link</span>
            </button>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <a
                href={downloadUrl}
                download
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
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
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open in New Tab</span>
              </a>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
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
