import { NextRequest, NextResponse } from 'next/server';
import { solrClient } from '@/lib/solr-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'test':
        const isConnected = await solrClient.testConnection();
        return NextResponse.json({ connected: isConnected });
      
      case 'info':
        const coreInfo = await solrClient.getCoreInfo();
        return NextResponse.json(coreInfo);
      
      case 'schema':
        const schema = await solrClient.getSchema();
        return NextResponse.json(schema);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: test, info, or schema' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}







