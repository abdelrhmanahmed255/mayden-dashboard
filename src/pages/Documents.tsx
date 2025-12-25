import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../services/api';
import { LoadingSpinner, Alert, EmptyState, FileUpload, SplitUpload } from '../components/UI';
import type { Document, SplitUploadResponse } from '../types';

type UploadMode = 'simple' | 'split' | null;

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState<UploadMode>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentsApi.list();
      setDocuments(response.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      await documentsApi.upload(file);
      setUploadSuccess(`${t('alerts.uploadSuccess')}: ${file.name}`);
      setShowUpload(null);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSplitUploadSuccess = async (_response: SplitUploadResponse) => {
    setUploadSuccess(t('alerts.splitUploadSuccess'));
    setShowUpload(null);
    await fetchDocuments();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`${t('documents.delete.confirm')} "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setUploadSuccess(`${t('documents.delete.success')}: ${name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('documents.delete.error'));
    } finally {
      setDeletingId(null);
    }
  };

  const copyShareLink = (doc: Document) => {
    const shareUrl = doc.storage_url || `${window.location.origin}/uploads/portal/user_documents/${doc.uuid}`;
    navigator.clipboard.writeText(shareUrl);
    setUploadSuccess(t('alerts.linkCopied'));
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const getDocumentIcon = (docType?: string) => {
    if (docType === 'first_page') return '📄';
    if (docType === 'remaining_pages') return '📑';
    if (docType === 'merged') return '📋';
    return '📄';
  };

  const getDocumentBadge = (doc: Document) => {
    if (doc.document_type === 'first_page') {
      return <span className="ltr:ml-2 rtl:mr-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">{t('documents.types.firstPage')}</span>;
    }
    if (doc.document_type === 'remaining_pages') {
      return <span className="ltr:ml-2 rtl:mr-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">{t('documents.types.remainingPages')}</span>;
    }
    if (doc.document_type === 'merged') {
      return <span className="ltr:ml-2 rtl:mr-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded">{t('documents.types.merged')}</span>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('documents.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {documents.length} {documents.length === 1 ? t('documents.count') : t('documents.count_plural')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(showUpload ? null : 'simple')}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
            </svg>
            <span>{t('documents.simpleUpload')}</span>
          </button>
          <button
            onClick={() => setShowUpload(showUpload ? null : 'split')}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t('documents.splitUpload')}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      {uploadSuccess && (
        <div className="mb-6">
          <Alert type="success" message={uploadSuccess} onClose={() => setUploadSuccess(null)} />
        </div>
      )}

      {/* Upload Section */}
      {showUpload === 'simple' && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('documents.upload.simple.title')}</h2>
            <button
              onClick={() => setShowUpload(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FileUpload
            onFileSelect={handleFileUpload}
            isUploading={isUploading}
            disabled={isUploading}
          />
        </div>
      )}

      {showUpload === 'split' && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <SplitUpload
            onSuccess={handleSplitUploadSuccess}
            onCancel={() => setShowUpload(null)}
          />
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <EmptyState
          title={t('documents.empty.title')}
          description={t('documents.empty.description')}
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          action={{
            label: t('documents.empty.action'),
            onClick: () => setShowUpload('simple'),
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('documents.table.document')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('documents.table.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('documents.table.uploaded')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('documents.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getDocumentIcon(doc.document_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/sys-admin-portal/documents/${doc.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
                          >
                            {doc.original_filename || doc.name}
                          </Link>
                          <p className="text-xs text-gray-500 truncate">UUID: {doc.uuid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDocumentBadge(doc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.upload_timestamp || doc.upload_date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => copyShareLink(doc)}
                          className="text-blue-600 hover:text-blue-700 p-2"
                          title="Copy share link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <Link
                          to={`/sys-admin-portal/documents/${doc.id}`}
                          className="text-blue-600 hover:text-blue-700 p-2"
                          title="View document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <a
                          href={doc.storage_url || `/uploads/portal/user_documents/${doc.uuid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 p-2"
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id, doc.original_filename || doc.name || 'document')}
                          disabled={deletingId === doc.id}
                          className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingId === doc.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl flex-shrink-0">
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/sys-admin-portal/documents/${doc.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 block"
                      >
                        {doc.original_filename || doc.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {getDocumentBadge(doc)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        {doc.uuid}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>{new Date(doc.upload_timestamp || doc.upload_date || Date.now()).toLocaleDateString()}</span>
                    <span className="text-gray-400">•</span>
                    <span>ID: {doc.id}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <button
                      onClick={() => copyShareLink(doc)}
                      className="flex flex-col items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="text-xs mt-1">{t('documents.actions.share')}</span>
                    </button>
                    <Link
                      to={`/sys-admin-portal/documents/${doc.id}`}
                      className="flex flex-col items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs mt-1">{t('documents.actions.view')}</span>
                    </Link>
                    <a
                      href={doc.storage_url || `/uploads/portal/user_documents/${doc.uuid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="text-xs mt-1">{t('documents.actions.download')}</span>
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id, doc.original_filename || doc.name || 'document')}
                      disabled={deletingId === doc.id}
                      className="flex flex-col items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === doc.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-xs mt-1">{t('documents.actions.delete')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Documents;
