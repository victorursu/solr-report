'use client';

import { useState } from 'react';
import { Download, BarChart3, Table } from 'lucide-react';
import { SolrResponse } from '@/lib/solr-client';

interface QueryResultsProps {
  results: SolrResponse | null;
  isLoading: boolean;
  error: string | null;
  queryTime?: number | null;
}

export default function QueryResults({ results, isLoading, error, queryTime }: QueryResultsProps) {
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Executing query...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg font-medium mb-2">Query Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8 text-gray-500">
          Execute a query to see results
        </div>
      </div>
    );
  }

  const { response, facet_counts } = results;
  
  // Use the actual start and rows from the Solr response instead of client-side pagination
  const actualStart = response?.start || 0;
  const actualRows = response?.docs?.length || 0;
  const totalFound = response?.numFound || 0;
  
  // Use the actual documents from Solr response
  const currentDocs = response?.docs || [];

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solr-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFieldValue = (doc: Record<string, unknown>, field: string) => {
    const value = doc[field];
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value?.toString() || '';
  };

  const getAllFields = () => {
    const fields = new Set<string>();
    response?.docs?.forEach(doc => {
      Object.keys(doc).forEach(key => fields.add(key));
    });
    return Array.from(fields).sort();
  };

  const fields = getAllFields();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
            <p className="text-sm text-gray-600">
              Found {(response?.numFound || 0).toLocaleString()} documents in {queryTime !== null ? `${queryTime}ms` : 'N/A'}ms
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Use the Start and Rows parameters in the query form to navigate through results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Table className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                viewMode === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportResults}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm flex items-center space-x-1 hover:bg-green-600"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {fields.map(field => (
                    <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDocs.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actualStart + index + 1}
                    </td>
                    {fields.map(field => (
                      <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={getFieldValue(doc, field)}>
                          {getFieldValue(doc, field)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        )}

        {/* Pagination Info */}
        {totalFound > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {actualStart + 1} to {actualStart + actualRows} of {totalFound.toLocaleString()} results
            </div>
            <div className="text-sm text-gray-500">
              Start: {actualStart}, Rows: {actualRows}
            </div>
          </div>
        )}

        {/* Facets */}
        {facet_counts && facet_counts.facet_fields && (
          <div className="mt-8 border-t pt-6">
            <h4 className="text-lg font-medium mb-4">Facets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(facet_counts.facet_fields).map(([field, values]) => (
                <div key={field} className="bg-gray-50 p-4 rounded">
                  <h5 className="font-medium text-gray-900 mb-2">{field}</h5>
                  <div className="space-y-1">
                    {Array.isArray(values) && values.map((value, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{value}</span>
                        <span className="text-gray-500">{values[index + 1]}</span>
                      </div>
                    )).filter((_, index) => index % 2 === 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






