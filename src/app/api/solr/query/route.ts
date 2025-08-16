import { NextRequest, NextResponse } from 'next/server';
import { solrClient, SolrQueryParams } from '@/lib/solr-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API received query params:', JSON.stringify(body, null, 2));
    const queryParams: SolrQueryParams = body;

    const result = await solrClient.query(queryParams);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute Solr query', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '*:*';
    const rows = parseInt(searchParams.get('rows') || '10');
    const start = parseInt(searchParams.get('start') || '0');
    const sort = searchParams.get('sort') || undefined;
    const facet = searchParams.get('facet') === 'true';
    const facetField = searchParams.get('facet.field') || undefined;

    const queryParams: SolrQueryParams = {
      q,
      rows,
      start,
      sort,
      facet,
      'facet.field': facetField ? [facetField] : undefined,
    };

    const result = await solrClient.query(queryParams);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute Solr query', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}






