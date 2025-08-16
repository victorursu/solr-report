'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Hash } from 'lucide-react';

interface DeleteDocumentFormProps {
  isConnected: boolean;
  onDeleteSuccess?: () => void;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  deletedId?: string;
  deletedCount?: number;
}

export default function DeleteDocumentForm({ isConnected, onDeleteSuccess }: DeleteDocumentFormProps) {
  const [documentId, setDocumentId] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<DeleteResponse | null>(null);
  
  // Hash deletion state
  const [hashValue, setHashValue] = useState('');
  const [isHashConfirmed, setIsHashConfirmed] = useState(false);
  const [isHashDeleting, setIsHashDeleting] = useState(false);
  const [hashResult, setHashResult] = useState<DeleteResponse | null>(null);
  const [documentCount, setDocumentCount] = useState<number | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId.trim()) {
      setResult({ success: false, message: 'Please enter a document ID' });
      return;
    }

    if (!isConfirmed) {
      setResult({ success: false, message: 'Please confirm deletion by checking the checkbox' });
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const response = await fetch('/api/solr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: documentId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Document "${documentId}" deleted successfully`, 
          deletedId: documentId 
        });
        setDocumentId('');
        setIsConfirmed(false);
        onDeleteSuccess?.();
      } else {
        setResult({ 
          success: false, 
          message: data.error || 'Failed to delete document' 
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setResult({ 
        success: false, 
        message: 'Network error occurred while deleting document' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHashDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hashValue.trim()) {
      setHashResult({ success: false, message: 'Please enter a hash value' });
      return;
    }

    if (!isHashConfirmed) {
      setHashResult({ success: false, message: 'Please confirm deletion by checking the checkbox' });
      return;
    }

    setIsHashDeleting(true);
    setHashResult(null);

    try {
      const response = await fetch('/api/solr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash: hashValue.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setHashResult({ 
          success: true, 
          message: `Successfully deleted ${data.deletedCount || 0} documents with hash "${hashValue}"`, 
          deletedCount: data.deletedCount 
        });
        setHashValue('');
        setIsHashConfirmed(false);
        setDocumentCount(null);
        onDeleteSuccess?.();
      } else {
        setHashResult({ 
          success: false, 
          message: data.error || 'Failed to delete documents by hash' 
        });
      }
    } catch (error) {
      console.error('Hash delete error:', error);
      setHashResult({ 
        success: false, 
        message: 'Network error occurred while deleting documents by hash' 
      });
    } finally {
      setIsHashDeleting(false);
    }
  };

  const handleCheckDocumentCount = async () => {
    if (!hashValue.trim()) {
      setHashResult({ success: false, message: 'Please enter a hash value first' });
      return;
    }

    try {
      const response = await fetch('/api/solr/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          q: `hash:${JSON.stringify(hashValue.trim())}`,
          rows: 0 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const count = data.response?.numFound || 0;
        setDocumentCount(count);
        setHashResult({ 
          success: true, 
          message: `Found ${count} document(s) with hash "${hashValue}"` 
        });
      } else {
        setHashResult({ 
          success: false, 
          message: data.error || 'Failed to check document count' 
        });
      }
    } catch (error) {
      console.error('Check count error:', error);
      setHashResult({ 
        success: false, 
        message: 'Network error occurred while checking document count' 
      });
    }
  };

  const handleReset = () => {
    setDocumentId('');
    setIsConfirmed(false);
    setResult(null);
  };

  const handleHashReset = () => {
    setHashValue('');
    setIsHashConfirmed(false);
    setHashResult(null);
    setDocumentCount(null);
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">Delete Document</span>
        </div>
        <p className="text-sm text-gray-500">Connect to Solr to delete documents</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Trash2 className="h-5 w-5 text-red-500" />
        <span className="font-medium text-gray-900">Delete Documents</span>
      </div>

      {/* Delete by Document ID Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete by Document ID</h3>
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document ID
            </label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
              placeholder="Enter document ID to delete"
              disabled={isDeleting}
            />
          </div>

          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <input
              type="checkbox"
              id="confirm-delete"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 rounded border-red-300 text-red-600 focus:ring-red-500"
              disabled={isDeleting}
            />
            <label htmlFor="confirm-delete" className="text-sm text-red-800">
              <strong>I understand that this action cannot be undone.</strong> 
              <br />
              This will permanently delete the document with ID "{documentId || '[ID]'}" from the Solr index.
            </label>
          </div>

          {result && (
            <div className={`p-3 rounded-md border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{result.message}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isDeleting || !documentId.trim() || !isConfirmed}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Document'}</span>
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-8"></div>

      {/* Delete by Hash Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete All Documents by Hash</h3>
        <form onSubmit={handleHashDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash Value
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={hashValue}
                onChange={(e) => setHashValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                placeholder="Enter hash value to delete all matching documents"
                disabled={isHashDeleting}
              />
              <button
                type="button"
                onClick={handleCheckDocumentCount}
                disabled={isHashDeleting || !hashValue.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Hash className="h-4 w-4" />
                <span>Count</span>
              </button>
            </div>
          </div>

          {documentCount !== null && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Found {documentCount} document(s) with hash "{hashValue}"
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <input
              type="checkbox"
              id="confirm-hash-delete"
              checked={isHashConfirmed}
              onChange={(e) => setIsHashConfirmed(e.target.checked)}
              className="mt-1 rounded border-red-300 text-red-600 focus:ring-red-500"
              disabled={isHashDeleting}
            />
            <label htmlFor="confirm-hash-delete" className="text-sm text-red-800">
              <strong>I understand that this action cannot be undone.</strong> 
              <br />
              This will permanently delete {documentCount !== null ? `${documentCount} document(s)` : 'all documents'} with hash "{hashValue || '[HASH]'}" from the Solr index.
            </label>
          </div>

          {hashResult && (
            <div className={`p-3 rounded-md border ${
              hashResult.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {hashResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{hashResult.message}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isHashDeleting || !hashValue.trim() || !isHashConfirmed}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isHashDeleting ? 'Deleting...' : 'Delete All by Hash'}</span>
            </button>
            
            <button
              type="button"
              onClick={handleHashReset}
              disabled={isHashDeleting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Warning Note */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Warning:</strong> Document deletion is permanent and cannot be undone. 
            Make sure you have the correct document ID or hash value before proceeding.
            Use the "Count" button to verify the number of documents that will be deleted.
          </div>
        </div>
      </div>
    </div>
  );
}
