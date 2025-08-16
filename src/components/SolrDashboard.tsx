'use client';

import { useState, useEffect } from 'react';
import { SolrResponse } from '@/lib/solr-client';
import ConnectionStatus from './ConnectionStatus';
import HashList from './HashList';
import QueryForm from './QueryForm';
import QueryResults from './QueryResults';
import DynamicTitle from './DynamicTitle';

export default function SolrDashboard() {
  const [results, setResults] = useState<SolrResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [solrConfig, setSolrConfig] = useState<{ solrUrl: string; solrCore: string } | null>(null);

  // Fetch Solr configuration on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/solr/config');
        if (response.ok) {
          const config = await response.json();
          setSolrConfig(config);
        }
      } catch (error) {
        console.error('Failed to fetch Solr config:', error);
      }
    };
    
    fetchConfig();
  }, []);

  const handleHashSelect = (hash: string) => {
    console.log('Hash selected:', hash);
    setSelectedHash(hash);
  };

  const executeQuery = async (queryData: any) => {
    setIsLoading(true);
    setError(null);
    setQueryTime(null);
    
    const startTime = performance.now();
    
    // Add hash filter if a hash is selected
    const finalQueryData = { ...queryData };
    if (selectedHash) {
      console.log('Adding hash filter:', selectedHash);
      if (!finalQueryData.fq) {
        finalQueryData.fq = [];
      }
      // Add hash filter to existing filter queries
      finalQueryData.fq.push(`hash:${selectedHash}`);
      console.log('Final query data with hash filter:', finalQueryData);
    }
    
    try {
      const response = await fetch('/api/solr/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalQueryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute query');
      }

      const data = await response.json();
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      setResults(data);
      setQueryTime(executionTime);
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DynamicTitle solrConfig={solrConfig} />
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Solr Report Dashboard
            {solrConfig && (
              <span className="text-xl font-normal text-gray-600 ml-2">
                [{solrConfig.solrCore}] - [{solrConfig.solrUrl}]
              </span>
            )}
          </h1>
          <p className="mt-2 text-gray-600">
            Connect to your Solr server and run custom queries to generate reports
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <ConnectionStatus onConnectionChange={setIsConnected} />
        </div>

        {/* Hash List */}
        <div className="mb-6">
          <HashList 
            isConnected={isConnected || false} 
            onHashSelect={handleHashSelect}
            selectedHash={selectedHash}
          />
          {selectedHash && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <span className="text-blue-700">
                <strong>Filtered by hash:</strong> {selectedHash}
              </span>
              <button
                onClick={() => setSelectedHash(null)}
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query Form */}
          <div>
            <QueryForm 
              onExecuteQuery={executeQuery} 
              isLoading={isLoading}
              selectedHash={selectedHash}
            />
          </div>

          {/* Results */}
          <div>
            <QueryResults 
              results={results}
              isLoading={isLoading}
              error={error}
              queryTime={queryTime}
            />
          </div>
        </div>

        {/* Quick Stats */}
        {results && results.response && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-sm font-medium text-gray-500">Total Documents</div>
              <div className="text-2xl font-bold text-gray-900">
                {results.response.numFound?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-sm font-medium text-gray-500">Query Time</div>
              <div className="text-2xl font-bold text-gray-900">
                {queryTime !== null ? `${queryTime}ms` : 'N/A'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-sm font-medium text-gray-500">Results Shown</div>
              <div className="text-2xl font-bold text-gray-900">
                {results.response.docs?.length || '0'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-sm font-medium text-gray-500">Start Position</div>
              <div className="text-2xl font-bold text-gray-900">
                {results.response.start || '0'}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Query Help</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Basic Queries</h4>
              <ul className="space-y-1">
                <li><code className="bg-blue-100 px-1 rounded">*:*</code> - All documents</li>
                <li><code className="bg-blue-100 px-1 rounded">field:value</code> - Exact match</li>
                <li><code className="bg-blue-100 px-1 rounded">field:*value*</code> - Wildcard search</li>
                <li><code className="bg-blue-100 px-1 rounded">field:[1 TO 10]</code> - Range query</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Features</h4>
              <ul className="space-y-1">
                <li><strong>Filter Queries:</strong> Use for performance</li>
                <li><strong>Faceting:</strong> Get field value counts</li>
                <li><strong>Sorting:</strong> field asc/desc</li>
                <li><strong>Fields:</strong> Specify returned fields</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}






