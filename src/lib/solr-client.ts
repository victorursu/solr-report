import axios from 'axios';

export interface SolrQueryParams {
  q?: string;
  fq?: string[];
  sort?: string;
  start?: number;
  rows?: number;
  fl?: string[];
  facet?: boolean;
  'facet.field'?: string[];
  'facet.limit'?: number;
  'facet.mincount'?: number;
  wt?: string;
}

export interface SolrResponse {
  responseHeader: {
    status: number;
    QTime: number;
    params: any;
  };
  response: {
    numFound: number;
    start: number;
    docs: any[];
  };
  facet_counts?: {
    facet_fields: Record<string, any[]>;
    facet_queries: Record<string, number>;
    facet_ranges: Record<string, any>;
  };
}

export interface SolrStats {
  totalDocuments: number;
  averageQueryTime: number;
  topFields: Array<{ field: string; count: number }>;
  recentQueries: Array<{ query: string; timestamp: string; responseTime: number }>;
}

class SolrClient {
  private baseUrl: string;
  private core: string;
  private timeout: number;
  private username: string;
  private password: string;

  constructor() {
    this.baseUrl = process.env.SOLR_URL || 'http://localhost:8983/solr';
    this.core = process.env.SOLR_CORE || 'your_core_name';
    this.timeout = parseInt(process.env.SOLR_TIMEOUT || '30000');
    this.username = process.env.SOLR_USERNAME || '';
    this.password = process.env.SOLR_PASSWORD || '';
  }

  private getUrl(endpoint: string = ''): string {
    return `${this.baseUrl}/${this.core}${endpoint}`;
  }

  async query(params: SolrQueryParams): Promise<SolrResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      if (params.q) queryParams.append('q', params.q);
      if (params.fq) {
        params.fq.forEach(fq => queryParams.append('fq', fq));
      }
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.start !== undefined) queryParams.append('start', params.start.toString());
      if (params.rows !== undefined) queryParams.append('rows', params.rows.toString());
      if (params.fl) {
        params.fl.forEach(fl => queryParams.append('fl', fl));
      }
      
      // Faceting parameters
      if (params.facet) queryParams.append('facet', 'true');
      if (params['facet.field']) {
        params['facet.field'].forEach(field => queryParams.append('facet.field', field));
      }
      if (params['facet.limit']) queryParams.append('facet.limit', params['facet.limit'].toString());
      if (params['facet.mincount']) queryParams.append('facet.mincount', params['facet.mincount'].toString());
      
      // Response format
      queryParams.append('wt', params.wt || 'json');

      const config: any = {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add authentication if credentials are provided
      if (this.username && this.password) {
        config.auth = {
          username: this.username,
          password: this.password,
        };
      }

      const response = await axios.get(`${this.getUrl('/select')}?${queryParams.toString()}`, config);

      console.log('Solr response structure:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Solr query error:', error);
      throw new Error(`Failed to query Solr: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCoreInfo(): Promise<any> {
    try {
      const config: any = {
        timeout: this.timeout,
        params: { wt: 'json' },
      };

      // Add authentication if credentials are provided
      if (this.username && this.password) {
        config.auth = {
          username: this.username,
          password: this.password,
        };
      }

      const response = await axios.get(this.getUrl('/admin/system'), config);
      return response.data;
    } catch (error) {
      console.error('Failed to get core info:', error);
      throw new Error(`Failed to get core info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSchema(): Promise<any> {
    try {
      const config: any = {
        timeout: this.timeout,
        params: { wt: 'json' },
      };

      // Add authentication if credentials are provided
      if (this.username && this.password) {
        config.auth = {
          username: this.username,
          password: this.password,
        };
      }

      const response = await axios.get(this.getUrl('/schema'), config);
      return response.data;
    } catch (error) {
      console.error('Failed to get schema:', error);
      throw new Error(`Failed to get schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to:', this.getUrl('/select'));
      console.log('Using credentials:', this.username ? 'Yes' : 'No');
      await this.query({ q: '*:*', rows: 0 });
      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const solrClient = new SolrClient();






