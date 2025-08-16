'use client';

import { useState, useEffect } from 'react';
import { Hash, Database, RefreshCw } from 'lucide-react';

interface HashListProps {
  isConnected: boolean;
  onHashSelect?: (hash: string) => void;
  selectedHash?: string | null;
}

interface HashData {
  hash: string;
  count: number;
  site?: string;
}

export default function HashList({ isConnected, onHashSelect, selectedHash }: HashListProps) {
  const [hashes, setHashes] = useState<HashData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHashes = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/solr/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: '*:*',
          rows: 0,
          facet: true,
          'facet.field': ['hash'],
          'facet.limit': 100,
          'facet.mincount': 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hashes');
      }

      const data = await response.json();
      
      if (data.facet_counts?.facet_fields?.hash) {
        const hashArray = data.facet_counts.facet_fields.hash;
        const hashData: HashData[] = [];
        
        // Process the facet results (alternating values and counts)
        for (let i = 0; i < hashArray.length; i += 2) {
          const hash = hashArray[i];
          const count = hashArray[i + 1];
          
          if (hash && count) {
            hashData.push({
              hash: hash,
              count: count,
            });
          }
        }
        
        // Sort by count descending
        hashData.sort((a, b) => b.count - a.count);
        setHashes(hashData);
      } else {
        setHashes([]);
      }
    } catch (err) {
      console.error('Error fetching hashes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch hashes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchHashes();
    }
  }, [isConnected]);

  const getHashColor = (hash: string) => {
    // Generate a consistent color based on hash
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-gray-100 text-gray-800',
    ];
    
    const index = hash.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatHash = (hash: string) => {
    // Format hash for better display
    if (hash.length > 8) {
      return `${hash.substring(0, 8)}...`;
    }
    return hash;
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Hash className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">Available Hashes</span>
        </div>
        <p className="text-sm text-gray-500">Connect to Solr to view available hashes</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Hash className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-gray-900">Available Hashes</span>
          <span className="text-sm text-gray-500">({hashes.length} environments)</span>
        </div>
        <button
          onClick={fetchHashes}
          disabled={isLoading}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 text-blue-500 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Loading hashes...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-500 text-sm mb-2">Error loading hashes</div>
          <div className="text-gray-600 text-xs">{error}</div>
        </div>
      )}

      {!isLoading && !error && hashes.length === 0 && (
        <div className="text-center py-4">
          <Database className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hashes found</p>
        </div>
      )}

      {!isLoading && !error && hashes.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {hashes.map((hashData) => (
            <div
              key={hashData.hash}
              className={`flex items-center justify-between p-2 rounded border hover:bg-gray-50 ${
                onHashSelect ? 'cursor-pointer' : ''
              } ${selectedHash === hashData.hash ? 'bg-blue-50 border-blue-300' : ''}`}
              onClick={() => {
                console.log('Hash clicked:', hashData.hash);
                onHashSelect?.(hashData.hash);
              }}
            >
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-mono ${getHashColor(hashData.hash)}`}>
                  {formatHash(hashData.hash)}
                </span>
                <span className="text-xs text-gray-500">
                  {hashData.hash}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {hashData.count.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">docs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {hashes.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <div className="text-xs text-gray-500">
            <strong>Total Documents:</strong> {hashes.reduce((sum, h) => sum + h.count, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <strong>Hash Usage:</strong> {onHashSelect ? 'Click on a hash to filter queries by environment' : 'Use hash values in filter queries'}
          </div>
        </div>
      )}
    </div>
  );
}
