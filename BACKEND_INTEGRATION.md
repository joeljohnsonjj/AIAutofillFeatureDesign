# Backend Integration Documentation

## Overview

This document describes the integration between the React frontend and the Python ML backend for the AI Autofill feature. The integration replaces mock data with real-time API calls to fetch legal obligations from processed documents.

## Architecture

### API Service Layer

**File**: `src/services/apiService.ts`

This service layer handles all communication with the backend API running on `http://localhost:8000`.

#### Key Functions

1. **`queryObligations(query: string)`**
   - Fetches legal obligations based on search keywords
   - Endpoint: `GET /query?q={query}`
   - Returns: `BackendQueryResponse` with obligation results

2. **`getDocuments()`**
   - Retrieves list of available processed documents
   - Endpoint: `GET /documents`
   - Returns: Array of `BackendDocument` objects

3. **`checkHealth()`**
   - Checks backend API health status
   - Endpoint: `GET /health`
   - Returns: Health status object

4. **`transformObligationToSnippet(obligation, index)`**
   - Transforms backend obligation format to frontend snippet format
   - Maintains compatibility with existing UI components

### Data Flow

```
User Input (Search Bar)
    ↓
handleGlobalSearch() in App.tsx
    ↓
queryObligations(query) in apiService.ts
    ↓
Backend API: GET http://localhost:8000/query?q={query}
    ↓
Backend Response (JSON)
    ↓
transformObligationToSnippet() for each result
    ↓
Update snippets state
    ↓
UI renders snippet cards
```

## Backend Response Format

### Query Response Structure

```typescript
{
  query: string;
  total_documents_searched: number;
  total_obligations_found: number;
  results: [
    {
      DutyType: string;
      "Responsible Party": string;
      "Owner Responsibility": string[];
      Reasoning: string[];
      Citation: string;
    }
  ];
  processed_at: string;
}
```

### Example Response

```json
{
  "query": "Landlord HVAC Hazardous Materials",
  "total_documents_searched": 1,
  "total_obligations_found": 4,
  "results": [
    {
      "DutyType": "Hazardous Materials Indemnification",
      "Responsible Party": "Landlord",
      "Owner Responsibility": [
        "Release, indemnify, and hold harmless the Tenant",
        "Cover any and all demands, expenses, fees, costs"
      ],
      "Reasoning": [
        "Hazardous Materials introduced by the Landlord"
      ],
      "Citation": "Document: Commercial Lease Agreement.pdf | Page 13, Section (d)"
    }
  ],
  "processed_at": "2026-01-20T16:08:38.521209"
}
```

## Frontend Snippet Format

The backend response is transformed to match the existing snippet format:

```typescript
{
  id: string;                    // Generated: "backend-{index}"
  documentId: string;            // Extracted from Citation
  title: string;                 // Maps to DutyType
  pdfReference: {
    page: number;                // Extracted from Citation
    segment: string;             // Maps to Responsible Party
    fullText: string;            // Combined from all fields
    highlights: Array<{
      text: string;
      field: string;
      color: string;
    }>;
    pageReferences: Array;       // Empty for now, can be expanded
  };
  fieldMappings: {
    responsibleParty: string;              // Maps to "Responsible Party"
    maintenanceOwnerResponsibility: string; // Joins "Owner Responsibility" array
    maintenanceReasoning: string;          // Joins "Reasoning" array
  };
  matchedFields: string[];       // Always includes the three main fields
  status: string;                // Default: "normal"
  confidenceScore: number;       // Calculated based on result ranking
}
```

## Field Mapping

| Backend Field | Frontend Field | Transformation |
|--------------|----------------|----------------|
| `DutyType` | `title` | Direct mapping |
| `Responsible Party` | `fieldMappings.responsibleParty` | Direct mapping |
| `Owner Responsibility` (array) | `fieldMappings.maintenanceOwnerResponsibility` | Join with `"; "` |
| `Reasoning` (array) | `fieldMappings.maintenanceReasoning` | Join with `"; "` |
| `Citation` | `pdfReference.page`, `documentId` | Parsed to extract document name and page number |

## Search Behavior

### Search Query Construction

The search query is constructed from the keywords entered in the search bar next to the "Maintenance" section. The query is sent as-is to the backend:

```typescript
// User types: "Landlord HVAC Hazardous Materials"
// API call: GET http://localhost:8000/query?q=Landlord%20HVAC%20Hazardous%20Materials
```

### Minimum Query Length

- Searches are only triggered when the query length is **greater than 2 characters**
- This prevents unnecessary API calls for very short queries

### Confidence Scoring

Results are assigned confidence scores based on their ranking from the backend:
- First result: 95% confidence
- Each subsequent result: -5% confidence
- Minimum confidence: 60%
- Maximum confidence: 100%

This assumes the backend already ranks results by relevance.

## Error Handling

### Fallback to Mock Data

If the API call fails (network error, backend down, etc.), the system automatically falls back to the mock data (`SNIPPET_DATABASE`) with local search logic:

```typescript
try {
  // Try backend API
  const response = await queryObligations(query);
  // ... process results
} catch (error) {
  console.error('Error fetching obligations from backend:', error);
  // Fallback to mock data with local search
  // ... use SNIPPET_DATABASE
}
```

### Error Scenarios Handled

1. **Network errors**: Backend unreachable
2. **HTTP errors**: 4xx, 5xx status codes
3. **Parsing errors**: Invalid JSON response
4. **Timeout errors**: Slow backend response

## Integration Points

### Modified Files

1. **`src/App.tsx`**
   - Added import for `queryObligations` and `transformObligationToSnippet`
   - Modified `handleGlobalSearch()` to use async/await
   - Replaced mock data filtering with API calls
   - Added error handling with fallback

2. **`src/services/apiService.ts`** (NEW)
   - Created API service layer
   - Defined TypeScript interfaces for backend responses
   - Implemented API call functions
   - Implemented data transformation logic

### Unchanged Components

The following components remain unchanged and work seamlessly with the new integration:

- `SnippetList.tsx` - Displays snippets in carousel
- `SnippetCarousel.tsx` - Handles snippet navigation
- `CategorySection.tsx` - Renders form sections
- `AgreementForm.tsx` - Main form component

## Testing the Integration

### Prerequisites

1. Backend server running on `http://localhost:8000`
2. Documents processed and indexed by the backend
3. Frontend development server running

### Test Steps

1. **Start the backend server**:
   ```bash
   # Navigate to backend directory
   python main.py  # or your backend start command
   ```

2. **Verify backend health**:
   ```bash
   curl http://localhost:8000/health
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

4. **Test search functionality**:
   - Navigate to the agreement form
   - Enable AI mode
   - Enter search keywords (e.g., "Landlord HVAC Hazardous Materials")
   - Verify snippets appear from backend data

### Expected Behavior

1. **Successful API Call**:
   - Loading animation appears
   - Snippets populate from backend response
   - Confidence scores displayed
   - All snippet interactions work (flip, navigate, accept)

2. **API Failure**:
   - Error logged to console
   - Fallback to mock data automatically
   - User experience uninterrupted

## API Endpoints Reference

### Query Obligations

```http
GET /query?q={searchQuery}
```

**Parameters**:
- `q` (string, optional): Search query string
- `output_folder` (string, optional): Output folder path

**Response**: `BackendQueryResponse`

### List Documents

```http
GET /documents
```

**Response**: Array of document metadata

### Health Check

```http
GET /health
```

**Response**: Health status object

## Future Enhancements

### Potential Improvements

1. **Multi-page References**:
   - Backend could return multiple page references per obligation
   - Frontend already supports `pageReferences` array

2. **Document Metadata**:
   - Fetch actual document list from `/documents` endpoint
   - Display in document selector

3. **Caching**:
   - Implement client-side caching for repeated queries
   - Reduce API calls for identical searches

4. **Real-time Updates**:
   - WebSocket connection for live document processing status
   - Notification when new documents are processed

5. **Advanced Filtering**:
   - Filter by document type
   - Filter by responsible party
   - Date range filtering

6. **Confidence Tuning**:
   - Use backend-provided confidence scores if available
   - Machine learning-based relevance scoring

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend has CORS enabled for `http://localhost:5173` (or your frontend port)
   - Check backend CORS configuration

2. **Empty Results**:
   - Verify documents are processed in backend
   - Check backend logs for query processing
   - Try broader search terms

3. **Slow Response**:
   - Check backend performance
   - Consider implementing request timeout
   - Add loading states for better UX

4. **Type Errors**:
   - Verify backend response matches `BackendQueryResponse` interface
   - Check for null/undefined values in response

## Development Notes

### Mock Data Preservation

The original `SNIPPET_DATABASE` is preserved in `App.tsx` for:
- Fallback functionality when API fails
- Development without backend running
- Testing UI components independently

### Type Safety

All API interactions are fully typed with TypeScript interfaces:
- `BackendObligation`
- `BackendQueryResponse`
- `BackendDocument`

This ensures compile-time type checking and better IDE support.

### Async/Await Pattern

The integration uses modern async/await syntax for cleaner code and better error handling compared to promise chains.

## Contact & Support

For issues or questions about the integration:
- Check backend API logs
- Review browser console for frontend errors
- Verify network requests in browser DevTools
- Ensure backend and frontend versions are compatible
