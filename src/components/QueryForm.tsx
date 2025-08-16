'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Plus, Trash2, Play } from 'lucide-react';

interface QueryFormData {
  query: string;
  rows: number;
  start: number;
  sort: string;
  facet: boolean;
  facetField: string;
  facetLimit: number;
  facetMinCount: number;
  fields: string;
}

interface QueryFormProps {
  onExecuteQuery: (queryData: any) => void;
  isLoading?: boolean;
  selectedHash?: string | null;
}

export default function QueryForm({ onExecuteQuery, isLoading = false, selectedHash }: QueryFormProps) {
  const [filterQueries, setFilterQueries] = useState<string[]>(['']);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<QueryFormData>({
    defaultValues: {
      query: '*:*',
      rows: 10,
      start: 0,
      sort: '',
      facet: false,
      facetField: '',
      facetLimit: 10,
      facetMinCount: 1,
      fields: '',
    }
  });

  const facetEnabled = watch('facet');

  const addFilterQuery = () => {
    setFilterQueries([...filterQueries, '']);
  };

  const removeFilterQuery = (index: number) => {
    const newFilters = filterQueries.filter((_, i) => i !== index);
    setFilterQueries(newFilters);
  };

  const updateFilterQuery = (index: number, value: string) => {
    const newFilters = [...filterQueries];
    newFilters[index] = value;
    setFilterQueries(newFilters);
  };

  const onSubmit = (data: QueryFormData) => {
    const queryData = {
      q: data.query,
      rows: data.rows,
      start: data.start,
      sort: data.sort || undefined,
      fl: data.fields ? data.fields.split(',').map(f => f.trim()) : undefined,
      facet: data.facet,
      'facet.field': data.facet && data.facetField ? [data.facetField] : undefined,
      'facet.limit': data.facet ? data.facetLimit : undefined,
      'facet.mincount': data.facet ? data.facetMinCount : undefined,
      fq: filterQueries.filter(fq => fq.trim() !== ''),
    };

    console.log('QueryForm submitting query data:', queryData);
    onExecuteQuery(queryData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Search className="h-5 w-5 mr-2 text-blue-500" />
        Solr Query Builder
        {selectedHash && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            Hash: {selectedHash}
          </span>
        )}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Main Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Query (q)
          </label>
          <input
            type="text"
            {...register('query', { required: 'Query is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="*:*"
          />
          {errors.query && (
            <p className="text-red-500 text-sm mt-1">{errors.query.message}</p>
          )}
        </div>

        {/* Filter Queries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Queries (fq)
          </label>
          {filterQueries.map((_, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={filterQueries[index]}
                onChange={(e) => updateFilterQuery(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="field:value"
              />
              {filterQueries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFilterQuery(index)}
                  className="px-3 py-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFilterQuery}
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Filter Query
          </button>
        </div>

        {/* Query Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rows
            </label>
            <input
              type="number"
              {...register('rows', { min: 1, max: 1000 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start
            </label>
            <input
              type="number"
              {...register('start', { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort
            </label>
            <input
              type="text"
              {...register('sort')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="field asc/desc"
            />
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fields (fl) - comma separated
          </label>
          <input
            type="text"
            {...register('fields')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="id,title,content"
          />
        </div>

        {/* Faceting */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              {...register('facet')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable Faceting
            </label>
          </div>

          {facetEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facet Field
                </label>
                <input
                  type="text"
                  {...register('facetField')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facet Limit
                </label>
                <input
                  type="number"
                  {...register('facetLimit', { min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Count
                </label>
                <input
                  type="number"
                  {...register('facetMinCount', { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>{isLoading ? 'Executing...' : 'Execute Query'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}






