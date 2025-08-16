import { NextRequest, NextResponse } from 'next/server';
import { solrClient } from '@/lib/solr-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, hash } = body;

    // Handle document ID deletion
    if (id) {
      if (typeof id !== 'string') {
        return NextResponse.json(
          { error: 'Document ID must be a string' },
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
      const deleteResponse = await solrClient.deleteDocument(`id:${JSON.stringify(id)}`);
      
      console.log('Delete response:', deleteResponse);

      return NextResponse.json({
        success: true,
        message: `Document "${id}" deleted successfully`,
        deletedId: id
      });
    }

    // Handle hash-based deletion
    if (hash) {
      if (typeof hash !== 'string') {
        return NextResponse.json(
          { error: 'Hash must be a string' },
          { status: 400 }
        );
      }

      console.log('Deleting documents with hash:', hash);
      
      // First, count documents with this hash
      const countResponse = await solrClient.query({
        q: `hash:${JSON.stringify(hash)}`,
        rows: 0,
        start: 0
      });

      const documentCount = countResponse.response.numFound;

      if (documentCount === 0) {
        return NextResponse.json(
          { error: `No documents found with hash "${hash}"` },
          { status: 404 }
        );
      }

      console.log(`Found ${documentCount} documents with hash "${hash}"`);

      // Delete all documents with this hash
      const deleteResponse = await solrClient.deleteDocument(`hash:${JSON.stringify(hash)}`);
      
      console.log('Hash delete response:', deleteResponse);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${documentCount} documents with hash "${hash}"`,
        deletedCount: documentCount,
        deletedHash: hash
      });
    }

    // Neither id nor hash provided
    return NextResponse.json(
      { error: 'Either document ID or hash is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete document(s)', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
