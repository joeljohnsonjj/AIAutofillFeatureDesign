// API Service for backend integration
const API_BASE_URL = 'http://localhost:8000';

export interface CitationItem {
  docId: string;
  pageNumbers: number[];
  section: string[];
}

export interface BackendObligation {
  DutyType: string;
  'Responsible Party': string;
  'Owner Responsibility': string[];
  Reasoning: string[];
  Citation: CitationItem[];
}

export interface BackendQueryResponse {
  query: string;
  total_documents_searched: number;
  total_obligations_found: number;
  results: BackendObligation[];
  processed_at: string;
  error?: string;
}

/**
 * Query legal obligations from the backend
 * @param query - Search query string (keywords from the search bar, can be empty)
 * @param documentIds - Array of document names/IDs to filter by (optional)
 * @returns Promise with query results
 */
export async function queryObligations(query: string, documentIds?: string[]): Promise<BackendQueryResponse> {
  try {
    // #region agent log
    console.log('[DEBUG apiService] queryObligations called', {query, documentIds, apiBaseUrl: API_BASE_URL});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:33',message:'queryObligations called',data:{query,documentIds,apiBaseUrl:API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const requestBody: {
      query: string;
      document_ids?: string[];
    } = {
      query: query || '',
    };
    
    // Include document_ids only if provided and not empty
    if (documentIds && documentIds.length > 0) {
      requestBody.document_ids = documentIds;
    }
    
    const url = `${API_BASE_URL}/query`;
    
    // #region agent log
    console.log('[DEBUG apiService] Making POST request', {url, body: requestBody});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:36',message:'Making POST request',data:{url,body:requestBody},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    // #region agent log
    console.log('[DEBUG apiService] Fetch response received', {status: response.status, ok: response.ok, statusText: response.statusText});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:38',message:'Fetch response received',data:{status:response.status,ok:response.ok,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      // Check if it's a service unavailable error (503) or other server errors that indicate service is down
      const isServiceDown = response.status === 503 || response.status === 502 || response.status === 504;
      const error = new Error(`API request failed with status ${response.status}`);
      (error as any).isConnectionError = isServiceDown;
      throw error;
    }
    
    const data = await response.json();
    
    // #region agent log
    console.log('[DEBUG apiService] JSON parsed successfully', {resultsCount: data.results?.length, totalObligations: data.total_obligations_found, query: data.query});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:42',message:'JSON parsed successfully',data:{resultsCount:data.results?.length,totalObligations:data.total_obligations_found,query:data.query},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    return data;
  } catch (error) {
    // #region agent log
    console.log('[DEBUG apiService] queryObligations error caught', {error: error instanceof Error ? error.message : String(error), errorName: error?.constructor?.name});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:44',message:'queryObligations error caught',data:{error:error instanceof Error?error.message:String(error),errorName:error?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    console.error('Error querying obligations:', error);
    
    // Check if it's a connection error
    const isConnectionError = 
      error instanceof TypeError && error.message.includes('Failed to fetch') ||
      error instanceof TypeError && error.message.includes('NetworkError') ||
      (error instanceof Error && (
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      ));
    
    // Create a custom error with connection flag
    const enhancedError = error instanceof Error ? error : new Error(String(error));
    (enhancedError as any).isConnectionError = isConnectionError;
    
    throw enhancedError;
  }
}

/**
 * Transform backend obligation to snippet format
 * @param obligation - Backend obligation object
 * @param index - Index for generating unique ID
 * @returns Snippet object in the format expected by the frontend
 */
export function transformObligationToSnippet(obligation: BackendObligation, index: number) {
  // Extract citation information (Citation is now an array)
  const firstCitation = obligation.Citation && obligation.Citation.length > 0 
    ? obligation.Citation[0] 
    : null;
  
  const documentName = firstCitation?.docId || 'Unknown Document';
  const pageNumber = firstCitation?.pageNumbers && firstCitation.pageNumbers.length > 0
    ? firstCitation.pageNumbers[0]
    : 1;
  
  // Generate document ID from document name
  const documentId = `doc-${documentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  
  // Combine Owner Responsibility array into a single string
  const ownerResponsibility = obligation['Owner Responsibility'].join('; ');
  
  // Combine Reasoning array into a single string
  const reasoning = obligation.Reasoning.join('; ');
  
  // Build citation text from all citations
  const citationText = obligation.Citation.map(cit => {
    const pages = cit.pageNumbers.join(', ');
    const sections = cit.section.join(', ');
    return `Document: ${cit.docId} | Pages: ${pages}${sections ? ` | Sections: ${sections}` : ''}`;
  }).join('\n');
  
  // Create full text from all available information
  const fullText = `${obligation.DutyType}\n\n${obligation['Responsible Party']}\n\nResponsibilities:\n${obligation['Owner Responsibility'].join('\n')}\n\nReasoning:\n${obligation.Reasoning.join('\n')}\n\n${citationText}`;
  
  // Create page references from citations
  const pageReferences = obligation.Citation.flatMap(cit => 
    cit.pageNumbers.map(pageNum => ({
      page: pageNum,
      fullText: `Page ${pageNum}${cit.section.length > 0 ? ` - ${cit.section.join(', ')}` : ''}`,
      highlights: []
    }))
  );
  
  // Create highlights for the PDF reference
  const highlights = [
    {
      text: obligation['Responsible Party'],
      field: 'Responsible Party',
      color: 'bg-blue-200'
    },
    {
      text: obligation['Owner Responsibility'][0] || ownerResponsibility.substring(0, 100),
      field: 'Maintenance Owner Responsibility',
      color: 'bg-green-200'
    },
    {
      text: obligation.DutyType,
      field: 'Legal Notes',
      color: 'bg-yellow-200'
    }
  ];
  
  return {
    id: `backend-${index}`,
    documentId: documentId,
    title: obligation.DutyType,
    pdfReference: {
      page: pageNumber,
      segment: obligation['Responsible Party'],
      fullText: fullText,
      highlights: highlights,
      pageReferences: pageReferences
    },
    fieldMappings: {
      responsibleParty: obligation['Responsible Party'],
      maintenanceOwnerResponsibility: ownerResponsibility,
      maintenanceReasoning: reasoning,
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
    status: 'normal',
    confidenceScore: 85, // Default confidence score, can be adjusted based on relevance
    citations: obligation.Citation, // Preserve all Citation data for PDF navigation
  };
}
