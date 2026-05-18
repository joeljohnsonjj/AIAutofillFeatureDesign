// API Service for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CitationItem {
  docId: string;
  pageNumbers: number[];
  section: string[];
}

export interface BackendObligation {
  /** Obligation group from consolidated / stream (e.g. "Maintenance & Repairs"). */
  category?: string;
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
  total_categories?: number;
  results: BackendObligation[];
  processed_at: string;
  error?: string;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** Parse API `pageNumbers` whether string, number, or number[]. */
export function normalizePageNumbers(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map((x) => Number(x)).filter((n) => !Number.isNaN(n));
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return [value];
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
}

/** Normalize `section` whether string or string[]. */
export function normalizeSectionList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeCitationItem(raw: unknown): CitationItem {
  const o = asRecord(raw) ?? {};
  const docId = String(o.docId ?? o.document_id ?? 'Unknown Document');
  const pageNumbers = normalizePageNumbers(o.pageNumbers ?? o.page_numbers);
  const section = normalizeSectionList(o.section ?? o.sections);
  return { docId, pageNumbers, section };
}

function deriveDutyType(category: string | undefined, party: string, ownerLines: string[]): string {
  const first = ownerLines.find((s) => s.trim())?.trim() ?? '';
  if (first) {
    const short = first.length > 140 ? `${first.slice(0, 137)}...` : first;
    if (category?.trim()) {
      return `${category.trim()} — ${short}`;
    }
    return short;
  }
  if (category?.trim()) return category.trim();
  if (party.trim()) return party.trim();
  return 'Obligation';
}

function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => String(x)).filter((s) => s.length > 0);
  }
  if (value === undefined || value === null) return [];
  return [String(value)];
}

/**
 * Maps current backend shapes (incl. lowercase `citations`, string page/section lists, no `DutyType`)
 * into the canonical {@link BackendObligation} used by the UI.
 */
export function normalizeBackendObligation(
  raw: Record<string, unknown>,
  options?: { category?: string }
): BackendObligation {
  const party = String(
    raw['Responsible Party'] ?? raw['responsible party'] ?? raw.responsibleParty ?? ''
  );
  const ownerResponsibility = coerceStringArray(raw['Owner Responsibility'] ?? raw['owner responsibility']);
  const reasoning = coerceStringArray(raw.Reasoning ?? raw.reasoning);

  const citationsRaw = raw.Citation ?? raw.citations ?? raw.citation;
  const list = Array.isArray(citationsRaw) ? citationsRaw : [];
  const Citation: CitationItem[] = list.map(normalizeCitationItem);

  const categoryFromRaw =
    typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : undefined;
  const categoryLabel = categoryFromRaw ?? (options?.category?.trim() ? options.category.trim() : undefined);

  const dutyRaw = raw.DutyType ?? raw.dutyType ?? raw.duty_type;
  const DutyType =
    typeof dutyRaw === 'string' && dutyRaw.trim()
      ? dutyRaw.trim()
      : deriveDutyType(categoryLabel, party, ownerResponsibility);

  const base: BackendObligation = {
    DutyType,
    'Responsible Party': party,
    'Owner Responsibility': ownerResponsibility.length ? ownerResponsibility : [''],
    Reasoning: reasoning.length ? reasoning : [''],
    Citation: Citation.length ? Citation : [normalizeCitationItem({})],
  };
  if (categoryLabel) {
    base.category = categoryLabel;
  }
  return base;
}

/**
 * Normalizes both legacy flat `/query` JSON and nested `results: { results: [ { category, obligations } ] }` envelopes.
 */
export function normalizeQueryEnvelope(data: unknown): BackendQueryResponse {
  const root = asRecord(data) ?? {};
  const topQuery = String(root.query ?? '');

  if (typeof root.error === 'string' && root.error) {
    return {
      query: topQuery,
      total_documents_searched: 0,
      total_obligations_found: 0,
      results: [],
      processed_at: '',
      error: root.error,
    };
  }

  const inner = root.results;

  // Legacy: `results` is a flat array of obligations
  if (Array.isArray(inner)) {
    const results = inner.map((item) => normalizeBackendObligation(asRecord(item) ?? {}));
    return {
      query: topQuery,
      total_documents_searched: Number(root.total_documents_searched ?? 0),
      total_obligations_found: Number(root.total_obligations_found ?? results.length),
      results,
      processed_at: String(root.processed_at ?? ''),
    };
  }

  // New: `results` is an object with nested category groups in `results.results`
  const nest = asRecord(inner);
  if (nest) {
    const nestedGroups = nest.results;
    const flat: BackendObligation[] = [];
    if (Array.isArray(nestedGroups)) {
      for (const g of nestedGroups) {
        const gr = asRecord(g);
        if (!gr) continue;
        const category = String(gr.category ?? '');
        const obligations = gr.obligations;
        if (!Array.isArray(obligations)) continue;
        for (const ob of obligations) {
          flat.push(normalizeBackendObligation(asRecord(ob) ?? {}, { category }));
        }
      }
    }
    return {
      query: String(nest.query ?? topQuery),
      total_documents_searched: Number(nest.total_documents_searched ?? 0),
      total_obligations_found: Number(nest.total_obligations_found ?? flat.length),
      total_categories:
        nest.total_categories !== undefined && nest.total_categories !== null
          ? Number(nest.total_categories)
          : undefined,
      results: flat,
      processed_at: String(nest.processed_at ?? ''),
    };
  }

  return {
    query: topQuery,
    total_documents_searched: 0,
    total_obligations_found: 0,
    results: [],
    processed_at: '',
  };
}

// Streaming response types (NDJSON format)
/** Legacy: `data` is a flat obligation. Current backend: `data` is `{ category?, obligation }`. */
export interface StreamObligationEvent {
  type: 'obligation';
  data: BackendObligation | { category?: string; obligation: Record<string, unknown> };
}

/** Current API: merged category block with multiple obligations (raw JSON per item). */
export interface StreamCategoryGroupEvent {
  type: 'category_group';
  data: {
    category: string;
    obligations: unknown[];
  };
}

export interface StreamMetadataEvent {
  type: 'metadata';
  data: {
    query: string;
    total_documents_searched: number;
    total_obligations_found: number;
    total_categories?: number;
    processed_at: string;
  };
}

export interface StreamErrorEvent {
  type: 'error';
  message: string;
}

export type StreamEvent =
  | StreamObligationEvent
  | StreamCategoryGroupEvent
  | StreamMetadataEvent
  | StreamErrorEvent;

/** Backend may wrap the row in `{ category, obligation }` (see stream logs). */
export function unwrapStreamObligationPayload(data: unknown): {
  category?: string;
  raw: Record<string, unknown>;
} {
  const d = asRecord(data);
  if (!d) return { raw: {} };
  const inner = asRecord(d.obligation);
  if (inner && Object.keys(inner).length > 0) {
    const category = typeof d.category === 'string' ? d.category : undefined;
    return { category, raw: inner };
  }
  return {
    category: typeof d.category === 'string' ? d.category : undefined,
    raw: d,
  };
}

function fingerprintNormalizedObligation(norm: BackendObligation): string {
  const cat = norm.category ?? '';
  const oc = norm['Owner Responsibility'].join('\u001e');
  const r = norm['Responsible Party'];
  const c0 = norm.Citation[0];
  const pages = c0?.pageNumbers?.join(',') ?? '';
  const sec = c0?.section?.join('\u001e') ?? '';
  return `${cat}\u001f${r}\u001f${oc}\u001f${c0?.docId ?? ''}\u001f${pages}\u001f${sec}`;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
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
    
    return normalizeQueryEnvelope(data);
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
 * Stream legal obligations from the backend (NDJSON format)
 * @param query - Search query string (keywords from the search bar, can be empty)
 * @param documentIds - Array of document names/IDs to filter by (optional)
 * @param onObligation - Callback function called for each obligation as it arrives
 * @param onMetadata - Callback function called when metadata arrives
 * @param onError - Callback function called if an error occurs
 * @returns Promise that resolves when streaming is complete
 */
export async function queryObligationsStream(
  query: string,
  documentIds?: string[],
  callbacks?: {
    onObligation?: (obligation: BackendObligation, index: number) => void;
    onMetadata?: (metadata: StreamMetadataEvent['data']) => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
  }
): Promise<void> {
  const streamT0 = performance.now();
  let lastReadAt = streamT0;
  let lastObligationEmitAt: number | null = null;
  let readCount = 0;
  let totalChunkBytes = 0;
  let ndjsonLineCount = 0;

  const dbg = (step: string, detail?: Record<string, unknown>) => {
    const t = performance.now();
    console.log(`[query/stream] ${step}`, {
      msSinceStreamStart: Math.round(t - streamT0),
      ...detail,
    });
  };

  try {
    const requestBody: {
      query: string;
      document_ids?: string[] | null;
      save_output?: boolean;
    } = {
      query: query || '',
      save_output: false,
    };

    // Include document_ids only if provided and not empty
    if (documentIds && documentIds.length > 0) {
      requestBody.document_ids = documentIds;
    }

    dbg('fetch:start', { url: `${API_BASE_URL}/query/stream`, body: requestBody });

    const url = `${API_BASE_URL}/query/stream`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson',
      },
      body: JSON.stringify(requestBody),
    });

    dbg('fetch:responseHeaders', {
      status: response.status,
      ok: response.ok,
      msToHeaders: Math.round(performance.now() - streamT0),
      contentType: response.headers.get('Content-Type') ?? '(none)',
    });
    
    if (!response.ok) {
      const isServiceDown = response.status === 503 || response.status === 502 || response.status === 504;
      const error = new Error(`API request failed with status ${response.status}`);
      (error as any).isConnectionError = isServiceDown;
      throw error;
    }
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    // Read the stream line by line (NDJSON format)
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let obligationIndex = 0;
    let streamHalted = false;
    const seenObligationKeys = new Set<string>();

    const tryEmitNormalized = async (norm: BackendObligation): Promise<void> => {
      const party = norm['Responsible Party']?.trim() ?? '';
      const hasOwner = norm['Owner Responsibility'].some((s) => String(s).trim());
      if (!party && !hasOwner) return;

      const key = fingerprintNormalizedObligation(norm);
      if (seenObligationKeys.has(key)) {
        dbg('emit:skippedDuplicate', { fingerprint: key.slice(0, 80) });
        return;
      }
      seenObligationKeys.add(key);
      const emitNow = performance.now();
      dbg('emit:obligation', {
        uiIndex: obligationIndex,
        dutyTypePreview: (norm.DutyType ?? '').slice(0, 100),
        category: norm.category ?? '',
        msSinceStreamStart: Math.round(emitNow - streamT0),
        msSincePrevObligationEmit:
          lastObligationEmitAt != null ? Math.round(emitNow - lastObligationEmitAt) : null,
      });
      lastObligationEmitAt = emitNow;
      callbacks?.onObligation?.(norm, obligationIndex);
      obligationIndex++;
      const afterCb = performance.now();
      dbg('emit:afterOnObligationCallback', {
        uiIndex: obligationIndex - 1,
        onObligationMs: Math.round(afterCb - emitNow),
      });
      await yieldToBrowser();
      dbg('emit:afterYieldToBrowser', {
        uiIndex: obligationIndex - 1,
        yieldMs: Math.round(performance.now() - afterCb),
      });
    };

    const handleParsedEvent = async (event: StreamEvent): Promise<boolean> => {
      if (event.type === 'category_group') {
        const list = event.data?.obligations;
        if (!Array.isArray(list)) {
          console.warn('[query/stream] category_group missing obligations array', event.data);
          return false;
        }
        dbg('event:category_group', {
          category: String(event.data?.category ?? ''),
          obligationCount: list.length,
        });
        const category = String(event.data?.category ?? '');
        for (const ob of list) {
          const norm = normalizeBackendObligation(asRecord(ob) ?? {}, { category });
          await tryEmitNormalized(norm);
        }
        return false;
      }
      if (event.type === 'obligation') {
        dbg('event:obligation_line', {
          category: (event.data as { category?: string })?.category,
        });
        const { category, raw } = unwrapStreamObligationPayload(event.data);
        if (!raw || Object.keys(raw).length === 0) {
          console.warn('[query/stream] obligation event missing payload', event.data);
          return false;
        }
        const norm = normalizeBackendObligation(raw, { category });
        await tryEmitNormalized(norm);
        return false;
      }
      if (event.type === 'metadata') {
        dbg('event:metadata', { data: event.data });
        callbacks?.onMetadata?.(event.data);
        return false;
      }
      if (event.type === 'error') {
        dbg('event:error', { message: event.message });
        callbacks?.onError?.(event.message);
        return true;
      }
      return false;
    };

    const consumeLine = async (raw: string): Promise<boolean> => {
      const line = raw.trim();
      if (!line) return false;
      ndjsonLineCount++;
      let event: StreamEvent;
      try {
        event = JSON.parse(line) as StreamEvent;
      } catch (parseError) {
        console.error('[query/stream] NDJSON parse error', {
          linePreview: line.slice(0, 200),
          parseError,
        });
        callbacks?.onError?.(`Invalid NDJSON line: ${line.slice(0, 120)}`);
        return true;
      }
      dbg('ndjson:parsed', {
        lineIndex: ndjsonLineCount,
        type: (event as StreamEvent).type,
        lineChars: line.length,
        preview: line.length > 160 ? `${line.slice(0, 160)}…` : line,
      });
      return handleParsedEvent(event);
    };

    while (!streamHalted) {
      const { done, value } = await reader.read();
      const chunkAt = performance.now();

      if (done) {
        dbg('read:done', {
          readCount,
          totalChunkBytes,
          ndjsonLineCount,
          msSinceStreamStart: Math.round(chunkAt - streamT0),
        });
        buffer += decoder.decode(undefined, { stream: false });
        if (buffer.trim()) {
          streamHalted = await consumeLine(buffer);
        }
        if (!streamHalted) {
          dbg('stream:complete', {
            totalMs: Math.round(performance.now() - streamT0),
            readCount,
            totalChunkBytes,
            ndjsonLineCount,
            obligationsEmitted: obligationIndex,
          });
          callbacks?.onComplete?.();
        }
        break;
      }

      readCount++;
      const byteLen = value?.byteLength ?? 0;
      totalChunkBytes += byteLen;
      dbg('read:chunk', {
        readCount,
        byteLength: byteLen,
        msSinceStreamStart: Math.round(chunkAt - streamT0),
        msSincePrevRead: Math.round(chunkAt - lastReadAt),
      });
      lastReadAt = chunkAt;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        streamHalted = await consumeLine(line);
        if (streamHalted) {
          await reader.cancel().catch(() => undefined);
          break;
        }
      }
      if (streamHalted) {
        break;
      }
    }

  } catch (error) {
    console.error('[query/stream] error', {
      message: error instanceof Error ? error.message : String(error),
      msSinceStreamStart: Math.round(performance.now() - streamT0),
    });
    
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
    
    callbacks?.onError?.(enhancedError.message);
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
  const citations = Array.isArray(obligation.Citation) ? obligation.Citation : [];
  // Extract citation information (Citation is now an array)
  const firstCitation = citations.length > 0 ? citations[0] : null;

  const documentName = firstCitation?.docId || 'Unknown Document';
  const pageNumber =
    firstCitation?.pageNumbers && firstCitation.pageNumbers.length > 0
      ? firstCitation.pageNumbers[0]
      : 1;
  
  // Generate document ID from document name
  const documentId = `doc-${documentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  
  // Combine Owner Responsibility array into a single string
  const ownerResponsibility = obligation['Owner Responsibility'].join('; ');
  
  // Combine Reasoning array into a single string
  const reasoning = obligation.Reasoning.join('; ');
  
  // Build citation text from all citations
  const citationText = citations
    .map((cit) => {
      const pages = cit.pageNumbers.length ? cit.pageNumbers.join(', ') : '';
      const sections = cit.section.length ? cit.section.join(', ') : '';
      return `Document: ${cit.docId} | Pages: ${pages}${sections ? ` | Sections: ${sections}` : ''}`;
    })
    .join('\n');

  const categoryLine = obligation.category ? `Category: ${obligation.category}\n\n` : '';
  const fullText = `${categoryLine}${obligation.DutyType}\n\n${obligation['Responsible Party']}\n\nResponsibilities:\n${obligation['Owner Responsibility'].join('\n')}\n\nReasoning:\n${obligation.Reasoning.join('\n')}\n\n${citationText}`;

  // Create page references from citations
  const pageReferences = citations.flatMap((cit) =>
    (cit.pageNumbers.length ? cit.pageNumbers : [1]).map((pageNum) => ({
      page: pageNum,
      fullText: `Page ${pageNum}${cit.section.length > 0 ? ` - ${cit.section.join(', ')}` : ''}`,
      highlights: [],
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
    ...(obligation.category ? { category: obligation.category } : {}),
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
    citations, // Preserve all Citation data for PDF navigation
  };
}

// ——— HEB Legal doc analyzer — `/api/v1/chat` ———

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string | null;
}

export interface ChatQueryRequest {
  message: string;
  document_id?: string | null;
  top_k?: number;
  user_id?: string | null;
  run_id?: string | null;
}

export interface ChatQueryResponse {
  answer: string;
  route: Record<string, unknown>;
  hit_count: number;
  block_count: number;
  context_was_empty: boolean;
}

export interface ChatResetResponse {
  user_id: string;
  run_id: string;
}

function enhanceFetchError(error: unknown): Error {
  const isConnectionError =
    error instanceof TypeError && error.message.includes('Failed to fetch') ||
    error instanceof TypeError && String(error).includes('NetworkError') ||
    (error instanceof Error &&
      (error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_CONNECTION_REFUSED')));

  const enhanced = error instanceof Error ? error : new Error(String(error));
  (enhanced as { isConnectionError?: boolean }).isConnectionError = Boolean(isConnectionError);
  return enhanced;
}

/**
 * POST /chat — conversational Q&A.
 */
export async function chatQuery(request: ChatQueryRequest): Promise<ChatQueryResponse> {
  const url = `${API_BASE_URL}/chat`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const isServiceDown =
        response.status === 503 || response.status === 502 || response.status === 504;
      const err = new Error(`API request failed with status ${response.status}`);
      (err as { isConnectionError?: boolean }).isConnectionError = isServiceDown;
      throw err;
    }

    return (await response.json()) as ChatQueryResponse;
  } catch (error) {
    console.error('Error in chat query:', error);
    throw enhanceFetchError(error);
  }
}

export async function chatQueryStream(
  request: ChatQueryRequest,
  onToken: (chunk: string) => void
): Promise<void> {
  const url = `${API_BASE_URL}/chat/stream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const isServiceDown =
        response.status === 503 || response.status === 502 || response.status === 504;
      const err = new Error(`API request failed with status ${response.status}`);
      (err as { isConnectionError?: boolean }).isConnectionError = isServiceDown;
      throw err;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      onToken(decoder.decode(value, { stream: true }));
    }
  } catch (error) {
    console.error('Error in chat stream:', error);
    throw enhanceFetchError(error);
  }
}

export async function chatReset(): Promise<ChatResetResponse> {
  const url = `${API_BASE_URL}/chat/reset`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const isServiceDown =
        response.status === 503 || response.status === 502 || response.status === 504;
      const err = new Error(`API request failed with status ${response.status}`);
      (err as { isConnectionError?: boolean }).isConnectionError = isServiceDown;
      throw err;
    }

    return (await response.json()) as ChatResetResponse;
  } catch (error) {
    console.error('Error resetting chat session:', error);
    throw enhanceFetchError(error);
  }
}
