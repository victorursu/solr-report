'use client';

import { useState, useEffect } from 'react';
import { List, Database, RefreshCw, Filter } from 'lucide-react';

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
    if (isConnected && fieldName) {
      fetchValues();
    }
  }, [isConnected, fieldName]);

  const getValueColor = (value: string) => {
    // Generate a consistent color based on value
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-gray-100 text-gray-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
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
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-2 mb-2">
          <List className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">Available {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Values</span>
        </div>
        <p className="text-sm text-gray-500">Connect to Solr to view available {fieldName} values</p>
      </div>
    );
  }

  if (!fieldName) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-2 mb-2">
          <List className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">Available Values</span>
        </div>
        <p className="text-sm text-gray-500">No field configured for unique values</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <List className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-gray-900">
            Available {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Values
          </span>
          <span className="text-sm text-gray-500">({values.length} unique values)</span>
        </div>
        <button
          onClick={fetchValues}
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
          <span className="text-sm text-gray-600">Loading {fieldName} values...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-500 text-sm mb-2">Error loading {fieldName} values</div>
          <div className="text-gray-600 text-xs">{error}</div>
        </div>
      )}

      {!isLoading && !error && values.length === 0 && (
        <div className="text-center py-4">
          <Database className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No {fieldName} values found</p>
        </div>
      )}

      {!isLoading && !error && values.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {values.map((valueData) => (
            <div
              key={valueData.value}
              className={`flex items-center justify-between p-2 rounded border hover:bg-gray-50 ${
                onValueSelect ? 'cursor-pointer' : ''
              } ${selectedValue === valueData.value ? 'bg-blue-50 border-blue-300' : ''}`}
              onClick={() => {
                console.log(`${fieldName} value clicked:`, valueData.value);
                onValueSelect?.(valueData.value);
              }}
            >
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getValueColor(valueData.value)}`}>
                  {formatValue(valueData.value)}
                </span>
                <span className="text-xs text-gray-500">
                  {valueData.value}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {valueData.count.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">docs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {values.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <div className="text-xs text-gray-500">
            <strong>Total Documents:</strong> {values.reduce((sum, v) => sum + v.count, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <strong>Filter Usage:</strong> {onValueSelect ? `Click on a ${fieldName} value to filter queries` : `Use ${fieldName} values in filter queries`}
          </div>
        </div>
      )}
    </div>
  );
}
