'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface ConnectionStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/solr/connection?action=test');
      const data = await response.json();
      setIsConnected(data.connected);
      setLastChecked(new Date());
      onConnectionChange?.(data.connected);
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      setLastChecked(new Date());
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />
            ) : isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium text-gray-900">Solr Connection</span>
          </div>
          
          {isConnected !== null && (
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Disconnected</span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Test</span>
        </button>
      </div>

      {lastChecked && (
        <p className="text-xs text-gray-500 mt-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}






