# Quick Start Guide - Backend Integration

## Setup Instructions

### 1. Start the Backend Server

Make sure your Python backend is running on `http://localhost:8000`:

```bash
# Navigate to your backend directory
cd /path/to/backend

# Start the server (adjust command as needed)
python main.py
# or
uvicorn main:app --reload --port 8000
```

### 2. Verify Backend is Running

Open your browser or use curl to check:

```bash
curl http://localhost:8000/health
```

Expected response: `{"status": "healthy"}` or similar

### 3. Start the Frontend

```bash
# In the project root directory
npm install  # if not already installed
npm run dev
```

### 4. Test the Integration

1. Open the application in your browser (usually `http://localhost:5173`)
2. Navigate to create a new agreement or edit an existing one
3. Enable **AI Mode** (toggle switch in the top right)
4. In the search bar next to "Maintenance", type keywords like:
   - `Landlord HVAC Hazardous Materials`
   - `Tenant Responsibility`
   - `Insurance Requirements`
   - Any other relevant terms

5. Watch as the AI fetches and displays snippets from your backend!

## Testing the API Integration

### Browser Console Tests

The application includes built-in tests that you can run from the browser console:

1. Open browser DevTools (F12)
2. Go to the Console tab
3. Run the following commands:

```javascript
// Run all tests
window.apiTests.runAll()

// Or run individual tests
window.apiTests.testHealth()      // Check backend health
window.apiTests.testQuery()       // Test query functionality
window.apiTests.testDocuments()   // Test document listing
window.apiTests.testTransform()   // Test data transformation
```

### Manual API Testing

You can also test the API directly:

```bash
# Test query endpoint
curl "http://localhost:8000/query?q=Landlord%20HVAC%20Hazardous%20Materials"

# Test documents endpoint
curl "http://localhost:8000/documents"

# Test health endpoint
curl "http://localhost:8000/health"
```

## How It Works

### Search Flow

1. **User enters keywords** in the search bar (e.g., "Landlord HVAC")
2. **Frontend sends request** to `http://localhost:8000/query?q=Landlord%20HVAC`
3. **Backend processes** the query and returns matching obligations
4. **Frontend transforms** the response to snippet format
5. **UI displays** the snippets in the carousel

### Data Mapping

The backend returns obligations in this format:

```json
{
  "DutyType": "Hazardous Materials Indemnification",
  "Responsible Party": "Landlord",
  "Owner Responsibility": ["List of responsibilities"],
  "Reasoning": ["List of reasoning"],
  "Citation": "Document: file.pdf | Page 13"
}
```

Which gets transformed to:

```javascript
{
  title: "Hazardous Materials Indemnification",
  fieldMappings: {
    responsibleParty: "Landlord",
    maintenanceOwnerResponsibility: "List of responsibilities joined",
    maintenanceReasoning: "List of reasoning joined"
  }
}
```

## Troubleshooting

### Problem: No snippets appear

**Check:**
1. Is the backend running? → `curl http://localhost:8000/health`
2. Are there any errors in the browser console? → F12 → Console tab
3. Are there any errors in the backend logs?
4. Is the search query long enough? (Must be > 2 characters)

### Problem: CORS errors

**Solution:**
Ensure your backend has CORS enabled for the frontend origin:

```python
# Example for FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problem: Backend returns empty results

**Check:**
1. Are documents processed in the backend?
2. Try broader search terms
3. Check backend logs for query processing details

### Problem: Fallback to mock data

If you see the old mock data instead of backend data, it means:
- The API call failed (check console for errors)
- The system automatically fell back to mock data
- This is expected behavior when the backend is unavailable

## Features

### ✅ Implemented

- Real-time API integration with Python backend
- Automatic data transformation from backend format to frontend format
- Error handling with fallback to mock data
- Confidence scoring based on result ranking
- Full TypeScript type safety
- Browser console testing tools

### 🔄 Preserved

- All existing UI functionality (flip cards, navigation, etc.)
- Mock data as fallback when backend is unavailable
- Tutorial system
- Form validation
- Document selection

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/query` | GET | Search for legal obligations |
| `/documents` | GET | List available documents |
| `/health` | GET | Check backend status |

## Configuration

### Change Backend URL

Edit `src/services/apiService.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';  // Change this
```

### Adjust Confidence Scoring

Edit the confidence calculation in `App.tsx` → `handleGlobalSearch()`:

```typescript
const baseConfidence = 95 - (index * 5);  // Adjust these values
const confidenceScore = Math.max(60, Math.min(100, baseConfidence));
```

## Next Steps

1. **Test with real documents**: Upload and process documents in your backend
2. **Customize confidence scoring**: Adjust based on your backend's ranking algorithm
3. **Add more endpoints**: Integrate `/documents` endpoint for document selector
4. **Implement caching**: Add client-side caching for repeated queries
5. **Add loading states**: Improve UX with better loading indicators

## Support

For detailed documentation, see:
- `BACKEND_INTEGRATION.md` - Complete integration documentation
- `apiContracts.yaml` - API contract specifications
- `src/services/apiService.ts` - API service implementation

## Example Queries

Try these example queries to test the integration:

- `Landlord HVAC Hazardous Materials`
- `Tenant Insurance Requirements`
- `Maintenance Responsibilities`
- `Operating Expenses`
- `Property Taxes`
- `Structural Repairs`
- `Emergency Procedures`

Each query will search through your processed documents and return relevant legal obligations!
