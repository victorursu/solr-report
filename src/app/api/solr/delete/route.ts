import { NextRequest, NextResponse } from 'next/server';
import { solrClient } from '@/lib/solr-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Document ID is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Deleting document with ID:', id);
    
    // First, verify the document exists
    const searchResponse = await solrClient.query({
      q: `id:${JSON.stringify(id)}`,
      rows: 1,
      start: 0
    });

    if (searchResponse.response.numFound === 0) {
      return NextResponse.json(
        { error: `Document with ID "${id}" not found` },
        { status: 404 }
      );
    }

    // Delete the document
    const deleteResponse = await solrClient.deleteDocument(id);
    
    console.log('Delete response:', deleteResponse);

    return NextResponse.json({
      success: true,
      message: `Document "${id}" deleted successfully`,
      deletedId: id
    });

  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete document', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
