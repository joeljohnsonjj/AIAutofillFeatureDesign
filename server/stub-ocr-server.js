const http = require('http');

const PORT = 8000;

// Stub response matching BackendQueryResponse from apiService.ts
const stubObligations = [
  {
    DutyType: 'Hazardous Materials Indemnification (Stub)',
    'Responsible Party': 'Landlord',
    'Owner Responsibility': [
      'Release, indemnify, and hold harmless the Tenant',
      'Cover any and all demands, expenses, fees, costs'
    ],
    Reasoning: ['Hazardous Materials introduced by the Landlord'],
    Citation: [
      { docId: 'Commercial Lease Agreement.pdf', pageNumbers: [13], section: ['Section (d)'] }
    ]
  },
  {
    DutyType: 'HVAC Maintenance and Repairs (Stub)',
    'Responsible Party': 'Tenant',
    'Owner Responsibility': [
      'Maintain HVAC in good working order',
      'Notify Landlord of any needed repairs'
    ],
    Reasoning: ['Standard commercial lease maintenance allocation'],
    Citation: [
      { docId: 'Commercial Lease Agreement.pdf', pageNumbers: [8], section: ['Section 7(a)'] }
    ]
  }
];

const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/query') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const query = parsed.query || '';
        const documentIds = parsed.document_ids || [];

        const response = {
          query,
          total_documents_searched: documentIds.length || 1,
          total_obligations_found: 2,
          results: stubObligations,
          processed_at: new Date().toISOString()
        };

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Stub OCR server at http://localhost:${PORT} (POST /query)`);
});
