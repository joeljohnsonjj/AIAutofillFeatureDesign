// API Service for backend integration
const API_BASE_URL = 'http://localhost:8000';

export interface BackendObligation {
  DutyType: string;
  'Responsible Party': string;
  'Owner Responsibility': string[];
  Reasoning: string[];
  Citation: string;
}

export interface BackendQueryResponse {
  query: string;
  total_documents_searched: number;
  total_obligations_found: number;
  results: BackendObligation[];
  processed_at: string;
}

export interface BackendDocument {
  id: string;
  name: string;
  uploadDate?: string;
  uploadedBy?: string;
  totalPages?: number;
}

/**
 * Query legal obligations from the backend
 * @param query - Search query string (keywords from the search bar)
 * @returns Promise with query results
 */
export async function queryObligations(query: string): Promise<BackendQueryResponse> {
  try {
    // #region agent log
    console.log('[DEBUG apiService] queryObligations called', {query, apiBaseUrl: API_BASE_URL});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:33',message:'queryObligations called',data:{query,apiBaseUrl:API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const encodedQuery = encodeURIComponent(query);
    const url = `${API_BASE_URL}/query?q=${encodedQuery}`;
    
    // #region agent log
    console.log('[DEBUG apiService] Making fetch request', {url});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:36',message:'Making fetch request',data:{url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(url);
    
    // #region agent log
    console.log('[DEBUG apiService] Fetch response received', {status: response.status, ok: response.ok, statusText: response.statusText});
    fetch('http://127.0.0.1:7242/ingest/c69e181c-4485-4aaa-8fb9-54a919c8d97a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiService.ts:38',message:'Fetch response received',data:{status:response.status,ok:response.ok,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
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
    throw error;
  }
}

/**
 * Get list of available documents
 * @returns Promise with list of documents
 */
export async function getDocuments(): Promise<BackendDocument[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Check API health status
 * @returns Promise with health status
 */
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
}

/**
 * Transform backend obligation to snippet format
 * @param obligation - Backend obligation object
 * @param index - Index for generating unique ID
 * @returns Snippet object in the format expected by the frontend
 */
export function transformObligationToSnippet(obligation: BackendObligation, index: number) {
  // Parse citation to extract document name and page info
  const citationMatch = obligation.Citation.match(/Document:\s*(.+?)\s*\|\s*Page\s*(\d+)/i);
  const documentName = citationMatch ? citationMatch[1].trim() : 'Unknown Document';
  const pageNumber = citationMatch ? parseInt(citationMatch[2]) : 1;
  
  // Generate document ID from document name
  const documentId = `doc-${documentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  
  // Combine Owner Responsibility array into a single string
  const ownerResponsibility = obligation['Owner Responsibility'].join('; ');
  
  // Combine Reasoning array into a single string
  const reasoning = obligation.Reasoning.join('; ');
  
  // Create full text from all available information
  const fullText = `${obligation.DutyType}\n\n${obligation['Responsible Party']}\n\nResponsibilities:\n${obligation['Owner Responsibility'].join('\n')}\n\nReasoning:\n${obligation.Reasoning.join('\n')}\n\n${obligation.Citation}`;
  
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
      pageReferences: [] // Can be expanded if backend provides multi-page references
    },
    fieldMappings: {
      responsibleParty: obligation['Responsible Party'],
      maintenanceOwnerResponsibility: ownerResponsibility,
      maintenanceReasoning: reasoning,
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
    status: 'normal',
    confidenceScore: 85, // Default confidence score, can be adjusted based on relevance
  };
}
