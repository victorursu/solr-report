import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      solrUrl: process.env.SOLR_URL || 'http://localhost:8983/solr',
      solrCore: process.env.SOLR_CORE || 'your_core_name',
    };
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get Solr configuration' },
      { status: 500 }
    );
  }
}
