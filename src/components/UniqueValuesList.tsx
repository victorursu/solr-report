'use client';

import { useState, useEffect } from 'react';
import { List, Database, RefreshCw } from 'lucide-react';

interface UniqueValuesListProps {
  isConnected: boolean;
  onValueSelect?: (value: string) => void;
  selectedValue?: string | null;
  fieldName?: string;
}

interface ValueData {
  value: string;
  count: number;
}

export default function UniqueValuesList({ 
  isConnected, 
  onValueSelect, 
  selectedValue, 
  fieldName = 'site' 
}: UniqueValuesListProps) {
  const [values, setValues] = useState<ValueData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValues = async () => {
    if (!isConnected || !fieldName) return;
    
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
          'facet.field': [fieldName],
          'facet.limit': 100,
          'facet.mincount': 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${fieldName} values`);
      }

      const data = await response.json();
      
      if (data.facet_counts?.facet_fields?.[fieldName]) {
        const valueArray = data.facet_counts.facet_fields[fieldName];
        const valueData: ValueData[] = [];
        
        // Process the facet results (alternating values and counts)
        for (let i = 0; i < valueArray.length; i += 2) {
          const value = valueArray[i];
          const count = valueArray[i + 1];
          
          if (value && count) {
            valueData.push({
              value: value,
              count: count,
            });
          }
        }
        
        // Sort by count descending
        valueData.sort((a, b) => b.count - a.count);
        setValues(valueData);
      } else {
        setValues([]);
      }
    } catch (err) {
      console.error(`Error fetching ${fieldName} values:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${fieldName} values`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isConnected || !fieldName) return;
    const timer = window.setTimeout(() => {
      void fetchValues();
    }, 0);
    return () => window.clearTimeout(timer);
    // Refresh facet values when connection or field changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, fieldName]);

  const getValueColor = (value: string) => {
    // Generate a consistent color based on value
    const colors = [
      'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
      'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
      'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200',
      'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
      'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
      'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200',
      'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200',
      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200',
      'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200',
    ];
    
    const index = value.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatValue = (value: string) => {
    // Format value for better display
    if (value.length > 20) {
      return `${value.substring(0, 20)}...`;
    }
    return value;
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <List className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          <span className="font-medium text-gray-900 dark:text-slate-100">Available {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Values</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400">Connect to Solr to view available {fieldName} values</p>
      </div>
    );
  }

  if (!fieldName) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <List className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          <span className="font-medium text-gray-900 dark:text-slate-100">Available Values</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400">No field configured for unique values</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <List className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-slate-100">
            Available {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Values
          </span>
          <span className="text-sm text-gray-600 dark:text-slate-400">({values.length} unique values)</span>
        </div>
        <button
          onClick={fetchValues}
          disabled={isLoading}
          className="px-2 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin mr-2" />
          <span className="text-sm text-gray-700 dark:text-slate-300">Loading {fieldName} values...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-600 dark:text-red-400 text-sm mb-2 font-medium">Error loading {fieldName} values</div>
          <div className="text-gray-700 dark:text-slate-300 text-xs">{error}</div>
        </div>
      )}

      {!isLoading && !error && values.length === 0 && (
        <div className="text-center py-4">
          <Database className="h-8 w-8 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-slate-400">No {fieldName} values found</p>
        </div>
      )}

      {!isLoading && !error && values.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {values.map((valueData) => (
            <div
              key={valueData.value}
              className={`flex items-center justify-between p-2 rounded border dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                onValueSelect ? 'cursor-pointer' : ''
              } ${selectedValue === valueData.value ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''}`}
              onClick={() => {
                console.log(`${fieldName} value clicked:`, valueData.value);
                onValueSelect?.(valueData.value);
              }}
            >
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getValueColor(valueData.value)}`}>
                  {formatValue(valueData.value)}
                </span>
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  {valueData.value}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {valueData.count.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600 dark:text-slate-400">docs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {values.length > 0 && (
        <div className="mt-4 pt-3 border-t dark:border-slate-700">
          <div className="text-xs text-gray-600 dark:text-slate-400">
            <strong className="text-gray-900 dark:text-slate-200">Total Documents:</strong> {values.reduce((sum, v) => sum + v.count, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            <strong className="text-gray-900 dark:text-slate-200">Filter Usage:</strong> {onValueSelect ? `Click on a ${fieldName} value to filter queries` : `Use ${fieldName} values in filter queries`}
          </div>
        </div>
      )}
    </div>
  );
}
