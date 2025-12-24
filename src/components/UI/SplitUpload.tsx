import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../services/api';
import { Alert, LoadingSpinner } from './';
import type { SplitUploadParams, SplitUploadResponse, Document } from '../../types';

interface SplitUploadProps {
  onSuccess?: (response: SplitUploadResponse) => void;
  onCancel?: () => void;
}

const SplitUpload: React.FC<SplitUploadProps> = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<SplitUploadResponse | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // QR Code parameters with defaults
  const [qrParams, setQrParams] = useState<SplitUploadParams>({
    remaining_qr_page: 2,
    remaining_qr_x: 28,
    remaining_qr_y: 703,
    remaining_qr_size: 70,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError(t('errors.selectPdfFile'));
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
        setUploadResult(null);
      } else {
        setError(t('errors.selectPdfFile'));
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t('errors.noFileSelected'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await documentsApi.uploadSplit(file, qrParams);
      setUploadResult(response);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleParamChange = (key: keyof SplitUploadParams, value: number) => {
    setQrParams(prev => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} ${t('common.copied')}!`);
  };

  const renderDocumentCard = (doc: Document, title: string, icon: string, bgColor: string) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`${bgColor} px-4 py-3 flex items-center space-x-2`}>
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="p-4 space-y-3">
        {/* Filename */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</label>
          <p className="text-sm text-gray-900 mt-1 break-all">{doc.original_filename}</p>
        </div>

        {/* UUID */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">UUID</label>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-gray-600 font-mono break-all flex-1">{doc.uuid}</p>
            <button
              onClick={() => copyToClipboard(doc.uuid, 'UUID')}
              className="p-1.5 text-gray-400 hover:text-gov-primary transition-colors flex-shrink-0"
              title="Copy UUID"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Storage URL */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Storage URL</label>
          <div className="flex items-center space-x-2 mt-1">
            <a
              href={doc.storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline break-all flex-1"
            >
              View PDF
            </a>
            <button
              onClick={() => copyToClipboard(doc.storage_url, 'URL')}
              className="p-1.5 text-gray-400 hover:text-gov-primary transition-colors flex-shrink-0"
              title="Copy URL"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <a
            href={doc.storage_url}
            download
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Split Upload</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload a PDF to split, add QR codes, and merge automatically
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* File Upload Section */}
      {!uploadResult && (
        <div
          className={`relative border-3 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-100 scale-[1.02]'
              : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={isUploading ? undefined : handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-blue-600 font-semibold text-lg">Uploading...</p>
            </div>
          ) : file ? (
            <div className="space-y-4">
              <svg
                className="w-20 h-20 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-gray-900 font-semibold text-lg">{file.name}</p>
                <p className="text-gray-600 text-base mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove File
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative">
                <svg
                  className="w-24 h-24 mx-auto text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {dragActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 border-4 border-blue-500 border-dashed rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl mb-2">
                  {dragActive ? 'Drop your file here!' : 'Upload PDF for Split Processing'}
                </p>
                <p className="text-blue-600 font-semibold text-base mb-1">
                  Click anywhere or drag & drop
                </p>
                <p className="text-gray-500 text-sm">
                  Will be split, add QR codes, and merged automatically
                </p>
              </div>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold shadow-md hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Browse Files
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Options - QR Code Settings */}
      {!uploadResult && file && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-semibold text-gray-700">QR Code Settings</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Number
                      </label>
                      <input
                        type="number"
                        value={qrParams.remaining_qr_page}
                        onChange={(e) => handleParamChange('remaining_qr_page', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">QR code page position</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        QR Size (px)
                      </label>
                      <input
                        type="number"
                        value={qrParams.remaining_qr_size}
                        onChange={(e) => handleParamChange('remaining_qr_size', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="20"
                        max="200"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Size of QR code</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={qrParams.remaining_qr_x}
                        onChange={(e) => handleParamChange('remaining_qr_x', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Horizontal position</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={qrParams.remaining_qr_y}
                        onChange={(e) => handleParamChange('remaining_qr_y', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Vertical position</p>
                    </div>
                  </div>
                </div>
              )}
        </div>
      )}

      {/* Upload Button */}
      {!uploadResult && file && (
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
              </svg>
              <span>Upload & Process</span>
            </>
          )}
        </button>
      )}

      {/* Success Result */}
      {uploadResult && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900">Upload Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your PDF has been split, QR codes added, and merged successfully. Three documents were created:
                </p>
              </div>
            </div>
          </div>

          {/* Document Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {renderDocumentCard(
              uploadResult.first_page_document,
              'First Page',
              '📄',
              'bg-blue-50'
            )}
            {renderDocumentCard(
              uploadResult.remaining_pages_document,
              'Remaining Pages',
              '📑',
              'bg-blue-50'
            )}
            {renderDocumentCard(
              uploadResult.merged_document,
              'Merged Document',
              '📋',
              'bg-green-50'
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setUploadResult(null);
                setFile(null);
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Upload Another Document
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitUpload;
