# AI Autofill Backend Integration - Complete Guide

## 🎯 Overview

This project integrates a React/TypeScript frontend with a Python ML backend to provide AI-powered legal document analysis and form autofill functionality. The integration replaces mock data with real-time API calls to fetch legal obligations from processed documents.

## 📦 What's Included

### Core Integration Files

| File | Purpose |
|------|---------|
| `src/services/apiService.ts` | API service layer with backend communication logic |
| `src/services/apiService.test.ts` | Browser console testing utilities |
| `src/App.tsx` (modified) | Updated to use API service instead of mock data |

### Documentation Files

| File | Purpose |
|------|---------|
| `BACKEND_INTEGRATION.md` | Complete technical documentation |
| `QUICK_START.md` | Step-by-step setup and testing guide |
| `INTEGRATION_SUMMARY.md` | High-level overview and architecture |
| `README_INTEGRATION.md` | This file - complete guide |

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend

```bash
# Navigate to your backend directory
cd /path/to/backend

# Start the Python server
python main.py
# Expected: Server running on http://localhost:8000
```

### Step 2: Verify Backend

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"} or similar
```

### Step 3: Start Frontend

```bash
# In this project directory
npm install  # if not already done
npm run dev
# Expected: Server running on http://localhost:5173
```

### Step 4: Test Integration

1. Open `http://localhost:5173` in your browser
2. Navigate to create/edit an agreement
3. Enable **AI Mode** (toggle in top right)
4. Search for: `Landlord HVAC Hazardous Materials`
5. Watch snippets load from your backend! 🎉

## 🔍 How It Works

### The Search Flow

```
User Types Keywords
    ↓
Frontend validates (>2 chars)
    ↓
API call: GET /query?q=keywords
    ↓
Backend processes with ML
    ↓
Returns JSON obligations
    ↓
Frontend transforms data
    ↓
UI displays snippets
```

### Data Transformation

**Backend sends:**
```json
{
  "DutyType": "Hazardous Materials Indemnification",
  "Responsible Party": "Landlord",
  "Owner Responsibility": ["List", "Of", "Items"],
  "Reasoning": ["Reasons"],
  "Citation": "Document: file.pdf | Page 13"
}
```

**Frontend converts to:**
```javascript
{
  title: "Hazardous Materials Indemnification",
  fieldMappings: {
    responsibleParty: "Landlord",
    maintenanceOwnerResponsibility: "List; Of; Items",
    maintenanceReasoning: "Reasons"
  },
  pdfReference: { page: 13, ... }
}
```

## 🧪 Testing

### Browser Console Tests

Open DevTools (F12) and run:

```javascript
// Run all tests
window.apiTests.runAll()

// Or individual tests
window.apiTests.testHealth()      // Check backend
window.apiTests.testQuery()       // Test search
window.apiTests.testDocuments()   // List documents
window.apiTests.testTransform()   // Test data mapping
```

### Manual API Testing

```bash
# Test search
curl "http://localhost:8000/query?q=Landlord%20HVAC"

# List documents
curl "http://localhost:8000/documents"

# Health check
curl "http://localhost:8000/health"
```

## 📋 API Endpoints

### Query Obligations

```http
GET /query?q={searchQuery}
```

**Example:**
```bash
curl "http://localhost:8000/query?q=Landlord%20HVAC%20Hazardous%20Materials"
```

**Response:**
```json
{
  "query": "Landlord HVAC Hazardous Materials",
  "total_documents_searched": 1,
  "total_obligations_found": 4,
  "results": [
    {
      "DutyType": "Hazardous Materials Indemnification",
      "Responsible Party": "Landlord",
      "Owner Responsibility": [...],
      "Reasoning": [...],
      "Citation": "Document: file.pdf | Page 13"
    }
  ]
}
```

### List Documents

```http
GET /documents
```

### Health Check

```http
GET /health
```

## 🛡️ Error Handling

The integration includes robust error handling:

### Automatic Fallback

If the backend is unavailable, the system automatically falls back to mock data:

```typescript
try {
  // Try backend API
  const response = await queryObligations(query);
  setSnippets(transformedResults);
} catch (error) {
  console.error('Backend unavailable, using mock data');
  // Fallback to SNIPPET_DATABASE
  setSnippets(mockResults);
}
```

### Error Types Handled

- ✅ Network errors (backend down)
- ✅ HTTP errors (4xx, 5xx)
- ✅ JSON parsing errors
- ✅ Timeout errors
- ✅ Empty results

## 🔧 Configuration

### Change Backend URL

Edit `src/services/apiService.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';  // Change here
```

### Adjust Confidence Scores

Edit `src/App.tsx` in the `handleGlobalSearch` function:

```typescript
// Current: 95%, 90%, 85%, 80%... (min 60%)
const baseConfidence = 95 - (index * 5);
const confidenceScore = Math.max(60, Math.min(100, baseConfidence));

// Example: Higher starting confidence
const baseConfidence = 98 - (index * 3);
const confidenceScore = Math.max(70, Math.min(100, baseConfidence));
```

## 📊 Field Mappings

### Complete Mapping Table

| Backend Field | Type | Frontend Field | Location | Transformation |
|--------------|------|----------------|----------|----------------|
| `DutyType` | string | `title` | Snippet card title | Direct |
| `Responsible Party` | string | `fieldMappings.responsibleParty` | Form field | Direct |
| `Owner Responsibility` | array | `fieldMappings.maintenanceOwnerResponsibility` | Form field | Join with "; " |
| `Reasoning` | array | `fieldMappings.maintenanceReasoning` | Form field | Join with "; " |
| `Citation` | string | `pdfReference.page` | PDF viewer | Regex parse |
| `Citation` | string | `documentId` | Document reference | Regex parse + slugify |

### Citation Parsing

The `Citation` field is parsed to extract document and page information:

```typescript
// Input: "Document: Commercial Lease Agreement.pdf | Page 13, Section (d)"
// Output:
{
  documentName: "Commercial Lease Agreement.pdf",
  documentId: "doc-commercial-lease-agreement-pdf",
  pageNumber: 13
}
```

## 🎨 UI Integration

### Components That Use Backend Data

1. **SnippetCarousel** - Displays transformed snippets
2. **SnippetList** - Shows list of all snippets
3. **CategorySection** - Renders form fields with data
4. **AgreementForm** - Accepts and validates data

### No Changes Required

All existing UI components work seamlessly with the backend data because:
- Data transformation maintains the same format
- All interfaces remain unchanged
- Props and state structure preserved

## 🔍 Troubleshooting

### Issue: No Snippets Appear

**Checklist:**
1. ✓ Backend running? → `curl http://localhost:8000/health`
2. ✓ Frontend running? → Check browser at `http://localhost:5173`
3. ✓ Search query > 2 characters?
4. ✓ Documents processed in backend?
5. ✓ Check browser console for errors (F12)
6. ✓ Check backend logs for errors

### Issue: CORS Errors

**Solution:** Enable CORS in your backend

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "Failed to Fetch" Error

**Possible Causes:**
1. Backend not running
2. Wrong port (check if backend is on 8000)
3. Firewall blocking connection
4. Backend crashed (check logs)

**Solution:**
```bash
# Check if backend is accessible
curl http://localhost:8000/health

# Check if port is in use
netstat -an | grep 8000  # Linux/Mac
netstat -an | findstr 8000  # Windows
```

### Issue: Empty Results

**Possible Causes:**
1. No documents processed
2. Search terms too specific
3. Backend indexing incomplete

**Solution:**
- Try broader search terms
- Check backend logs for query processing
- Verify documents are uploaded and processed
- Test with example query: "Landlord HVAC"

### Issue: Fallback to Mock Data

**This is expected when:**
- Backend is not running
- API call fails
- Network error occurs

**To verify:**
```javascript
// In browser console
window.apiTests.testHealth()
// If this fails, backend is not accessible
```

## 📚 Documentation Reference

### Quick Links

- **Technical Details** → `BACKEND_INTEGRATION.md`
- **Setup Guide** → `QUICK_START.md`
- **Architecture** → `INTEGRATION_SUMMARY.md`
- **API Contracts** → `apiContracts.yaml`

### Code Files

- **API Service** → `src/services/apiService.ts`
- **Tests** → `src/services/apiService.test.ts`
- **Main App** → `src/App.tsx` (search for `handleGlobalSearch`)

## 🎯 Example Usage

### Example 1: Search for HVAC Responsibilities

```
1. User types: "HVAC maintenance"
2. API calls: GET /query?q=HVAC%20maintenance
3. Backend returns: 3 obligations about HVAC
4. Frontend displays: 3 snippet cards
5. User clicks: Accept on first snippet
6. Form fills: Responsible Party, Responsibility, Reasoning
```

### Example 2: Search for Insurance Requirements

```
1. User types: "insurance requirements"
2. API calls: GET /query?q=insurance%20requirements
3. Backend returns: 5 obligations about insurance
4. Frontend displays: 5 snippet cards with confidence scores
5. User navigates: Through all 5 snippets
6. User selects: Third snippet (highest confidence for their needs)
7. Form fills: All maintenance fields automatically
```

## 🚀 Production Considerations

### Before Deploying

1. **Update API URL**
   ```typescript
   // Change from localhost to production URL
   const API_BASE_URL = 'https://api.yourcompany.com';
   ```

2. **Add Environment Variables**
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

3. **Add Request Timeout**
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s
   
   const response = await fetch(url, { signal: controller.signal });
   ```

4. **Add Request Retry Logic**
   ```typescript
   async function queryWithRetry(query: string, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await queryObligations(query);
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   }
   ```

5. **Add Analytics**
   ```typescript
   // Track successful searches
   analytics.track('search_success', { query, resultCount });
   
   // Track API errors
   analytics.track('api_error', { error: error.message });
   ```

## 🔮 Future Enhancements

### Planned Features

1. **Caching** - Cache frequent queries
2. **Pagination** - Handle large result sets
3. **Filtering** - Filter by document type, date
4. **Real-time** - WebSocket for live updates
5. **Export** - Export results to CSV/PDF
6. **Multi-language** - Support for multiple languages
7. **Advanced Search** - Boolean operators, wildcards
8. **Batch Processing** - Process multiple queries

### How to Extend

#### Add New Endpoint

1. Add function to `apiService.ts`:
```typescript
export async function getDocumentDetails(docId: string) {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}`);
  return await response.json();
}
```

2. Use in component:
```typescript
import { getDocumentDetails } from './services/apiService';

const details = await getDocumentDetails('doc-123');
```

#### Add New Field Mapping

1. Update backend response interface:
```typescript
export interface BackendObligation {
  // ... existing fields
  NewField: string;  // Add new field
}
```

2. Update transformation:
```typescript
export function transformObligationToSnippet(obligation) {
  return {
    // ... existing mappings
    fieldMappings: {
      // ... existing
      newField: obligation.NewField,  // Map new field
    }
  };
}
```

## ✅ Checklist

### Integration Complete When:

- [x] API service created (`apiService.ts`)
- [x] Tests created (`apiService.test.ts`)
- [x] App.tsx updated to use API
- [x] Error handling implemented
- [x] Fallback to mock data works
- [x] TypeScript types defined
- [x] No linter errors
- [x] Documentation complete
- [x] Browser tests available
- [x] Example queries work

### Ready for Production When:

- [ ] Backend deployed to production
- [ ] Frontend deployed to production
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Error tracking enabled
- [ ] Analytics integrated
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Documentation updated
- [ ] Team trained

## 📞 Support

### Getting Help

1. **Check Documentation**
   - Read `BACKEND_INTEGRATION.md` for technical details
   - Read `QUICK_START.md` for setup help
   - Read `INTEGRATION_SUMMARY.md` for overview

2. **Run Tests**
   ```javascript
   window.apiTests.runAll()
   ```

3. **Check Logs**
   - Browser console (F12)
   - Backend server logs
   - Network tab in DevTools

4. **Verify Setup**
   ```bash
   # Backend
   curl http://localhost:8000/health
   
   # Frontend
   curl http://localhost:5173
   ```

## 🎉 Success!

The integration is complete and ready to use! The frontend now communicates with your Python ML backend to fetch real legal obligations from processed documents.

**Next Steps:**
1. Start your backend server
2. Start the frontend
3. Try searching for legal obligations
4. Review the snippets and accept suggestions
5. Watch your form auto-fill with AI-powered data!

---

**Happy coding!** 🚀

For questions or issues, refer to the documentation files or run the browser console tests.
