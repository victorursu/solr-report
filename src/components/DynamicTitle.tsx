'use client';

import { useEffect } from 'react';

interface DynamicTitleProps {
  solrConfig: { solrUrl: string; solrCore: string } | null;
}

export default function DynamicTitle({ solrConfig }: DynamicTitleProps) {
  useEffect(() => {
    if (solrConfig) {
      // Extract hostname from URL for cleaner display
      const url = new URL(solrConfig.solrUrl);
      const hostname = url.hostname;
      const port = url.port ? `:${url.port}` : '';
      
      document.title = `Solr Report Dashboard [${solrConfig.solrCore}] - ${hostname}${port}`;
    } else {
      document.title = 'Solr Report Dashboard';
    }
  }, [solrConfig]);

  return null; // This component doesn't render anything
}
