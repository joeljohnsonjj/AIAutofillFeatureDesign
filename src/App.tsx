import React, { useState, useEffect, useRef } from 'react';
import { AgreementForm } from './components/AgreementForm';
import { DocumentViewer } from './components/DocumentViewer';
import { SnippetList } from './components/SnippetList';
import { AIFillHelp } from './components/AIFillHelp';
import { DocumentSelector, type Document } from './components/DocumentSelector';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { AIAnalyzingAnimation } from './components/AIAnalyzingAnimation';
import { Search, Download, X } from 'lucide-react';

export interface FormField {
  id: string;
  label: string;
  value: string;
  category: string;
}

export interface AISuggestion {
  id: string;
  text: string;
  preview: string;
}

// Comprehensive snippet database
const SNIPPET_DATABASE = [
  {
    id: '1',
    title: 'Owner Responsibility - Structural & Systems',
    pdfReference: {
      page: 12,
      segment: 'Property Owner shall be responsible',
      fullText: 'ARTICLE III - MAINTENANCE AND REPAIRS\n\nSection 3.1: General Provisions\nThis agreement establishes the maintenance responsibilities between the parties as follows:\n\nSection 3.2: Owner Maintenance Obligations\nThe Property Owner shall be responsible for all structural repairs, including but not limited to foundation work, load-bearing walls, and roof maintenance. The Owner shall maintain all major building systems including HVAC, plumbing, and electrical systems in good working order.\n\nSection 3.3: Tenant Responsibilities\nTenant shall maintain the interior of the premises and handle routine maintenance as specified in Schedule B.',
      highlights: [
        { 
          text: 'Property Owner shall be responsible', 
          field: 'Responsible Party',
          color: 'bg-blue-200'
        },
        { 
          text: 'structural repairs, including but not limited to foundation work, load-bearing walls, and roof maintenance', 
          field: 'Maintenance Owner Responsibility',
          color: 'bg-green-200'
        },
        { 
          text: 'Section 3.2', 
          field: 'Legal Notes',
          color: 'bg-yellow-200'
        }
      ],
      pageReferences: [
        {
          page: 14,
          fullText: 'PAGE 14\n\nSection 3.4: Extended Maintenance Provisions\nAs referenced in Section 3.2, the Owner\'s responsibility extends to all major capital improvements exceeding $10,000 in value. This includes but is not limited to roof replacement, HVAC system upgrades, and structural modifications required for code compliance.\n\nThe Owner must provide written notice to the Tenant at least 30 days prior to commencing any major maintenance work that may disrupt Tenant operations.',
          highlights: [
            {
              text: 'major capital improvements exceeding $10,000 in value',
              field: 'Maintenance Owner Responsibility',
              color: 'bg-green-200'
            },
            {
              text: 'Section 3.4',
              field: 'Legal Notes',
              color: 'bg-yellow-200'
            }
          ]
        },
        {
          page: 16,
          fullText: 'PAGE 16\n\nSection 3.6: Emergency Maintenance Procedures\nIn cases of emergency maintenance situations affecting structural integrity or life safety systems, the Property Owner shall respond within 24 hours as outlined in Section 3.2. Emergency repairs include but are not limited to: foundation failures, roof collapses, electrical system failures, and plumbing emergencies that pose immediate safety hazards.\n\nAll emergency maintenance costs shall be borne by the Owner per the terms established in Section 3.2 of this agreement.',
          highlights: [
            {
              text: 'Emergency maintenance situations affecting structural integrity or life safety systems',
              field: 'Maintenance Owner Responsibility',
              color: 'bg-green-200'
            },
            {
              text: 'Section 3.6',
              field: 'Legal Notes',
              color: 'bg-yellow-200'
            }
          ]
        }
      ]
    },
    fieldMappings: {
      responsibleParty: 'Property Owner',
      maintenanceOwnerResponsibility: 'Structural repairs, roof maintenance, HVAC systems',
      maintenanceReasoning: 'Per Section 3.2, owner maintains structural integrity and major building systems as defined in commercial lease standards',
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
  },
  {
    id: '2',
    title: 'Triple Net (NNN) Lease Structure',
    pdfReference: {
      page: 8,
      segment: 'Tenant assumes responsibility',
      fullText: 'ARTICLE II - LEASE TYPE AND STRUCTURE\n\nSection 2.1: Triple Net Lease\nUnder this Triple Net (NNN) lease structure, the Tenant assumes comprehensive responsibility for property operations and maintenance, including but not limited to property taxes, insurance, and maintenance costs.\n\nSection 2.2: Owner Limited Obligations\nThe Owner shall retain responsibility for structural integrity and major capital improvements only, as defined in Section 2.3 below.',
      highlights: [
        { 
          text: 'Tenant assumes comprehensive responsibility', 
          field: 'Responsible Party',
          color: 'bg-blue-200'
        },
        { 
          text: 'structural integrity and major capital improvements only', 
          field: 'Maintenance Owner Responsibility',
          color: 'bg-green-200'
        },
        { 
          text: 'Triple Net (NNN) lease structure', 
          field: 'Legal Notes',
          color: 'bg-yellow-200'
        }
      ],
      pageReferences: [
        {
          page: 10,
          fullText: 'PAGE 10\n\nSection 2.3: Detailed NNN Obligations\nAs referenced in Section 2.1, the comprehensive responsibility includes all operational expenses such as utilities, landscaping, parking lot maintenance, and common area upkeep. The Tenant is also responsible for property insurance premiums and all real estate taxes associated with the leased premises.\n\nThese obligations are in addition to the base rent and must be paid separately as outlined in Schedule D of this agreement.',
          highlights: [
            {
              text: 'comprehensive responsibility includes all operational expenses',
              field: 'Responsible Party',
              color: 'bg-blue-200'
            },
            {
              text: 'property insurance premiums and all real estate taxes',
              field: 'Maintenance Owner Responsibility',
              color: 'bg-green-200'
            }
          ]
        }
      ]
    },
    fieldMappings: {
      responsibleParty: 'Tenant',
      maintenanceOwnerResponsibility: 'Structural integrity and major capital improvements only',
      maintenanceReasoning: 'Triple Net (NNN) lease structure per Section 2.1 allocates comprehensive operational responsibility to tenant with owner retaining structural oversight',
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
  },
  {
    id: '3',
    title: 'Shared Responsibility Framework',
    pdfReference: {
      page: 5,
      segment: 'Shared Responsibility',
      fullText: 'ARTICLE I - LEASE TERMS AND CONDITIONS\n\nSection 1.5: Modified Gross Lease - Maintenance Framework\nThis Modified Gross Lease establishes a Shared Responsibility framework for property maintenance and operational costs. Both parties shall cooperate in maintaining the property.\n\nThe Owner shall be responsible for building systems, life safety equipment, and code compliance, while the Tenant handles routine interior maintenance and janitorial services.',
      highlights: [
        { 
          text: 'Shared Responsibility framework', 
          field: 'Responsible Party',
          color: 'bg-blue-200'
        },
        { 
          text: 'building systems, life safety equipment, and code compliance', 
          field: 'Maintenance Owner Responsibility',
          color: 'bg-green-200'
        },
        { 
          text: 'Modified Gross Lease', 
          field: 'Legal Notes',
          color: 'bg-yellow-200'
        }
      ]
    },
    fieldMappings: {
      responsibleParty: 'Shared Responsibility',
      maintenanceOwnerResponsibility: 'Building systems, life safety equipment, and code compliance',
      maintenanceReasoning: 'Modified Gross Lease framework per Section 1.5 establishes shared maintenance obligations with owner covering major systems and tenant handling routine operations',
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
  },
  {
    id: '4',
    title: 'Full Service Lease Agreement',
    pdfReference: {
      page: 15,
      segment: 'Landlord retains all maintenance obligations',
      fullText: 'ARTICLE IV - FULL SERVICE LEASE PROVISIONS\n\nSection 4.1: Landlord Maintenance Responsibilities\nUnder this Full Service Lease, the Landlord retains all maintenance obligations for the property, encompassing both interior and exterior maintenance, system repairs, and general upkeep.\n\nSection 4.2: Tenant Obligations\nTenant responsibility is limited to normal wear and tear mitigation.',
      highlights: [
        { 
          text: 'Landlord retains all maintenance obligations', 
          field: 'Responsible Party',
          color: 'bg-blue-200'
        },
        { 
          text: 'encompassing both interior and exterior maintenance, system repairs, and general upkeep', 
          field: 'Maintenance Owner Responsibility',
          color: 'bg-green-200'
        },
        { 
          text: 'Full Service Lease', 
          field: 'Legal Notes',
          color: 'bg-yellow-200'
        }
      ]
    },
    fieldMappings: {
      responsibleParty: 'Landlord',
      maintenanceOwnerResponsibility: 'Complete property maintenance including interior, exterior, and all systems',
      maintenanceReasoning: 'Full Service Lease per Section 4.1 designates landlord as responsible for comprehensive property maintenance with minimal tenant obligations',
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
  },
  {
    id: '5',
    title: 'Percentage Lease with Joint Maintenance',
    pdfReference: {
      page: 19,
      segment: 'Joint maintenance arrangement',
      fullText: 'ARTICLE V - PERCENTAGE LEASE TERMS\n\nSection 5.1: Maintenance Cost Sharing\nThis percentage lease includes a Joint maintenance arrangement where costs are shared proportionally based on revenue percentages as outlined in Schedule C.\n\nSection 5.2: Responsibility Allocation\nLandlord handles major structural and compliance items while Tenant manages operational maintenance proportional to their lease percentage.',
      highlights: [
        { 
          text: 'Joint maintenance arrangement', 
          field: 'Responsible Party',
          color: 'bg-blue-200'
        },
        { 
          text: 'major structural and compliance items', 
          field: 'Maintenance Owner Responsibility',
          color: 'bg-green-200'
        },
        { 
          text: 'percentage lease', 
          field: 'Legal Notes',
          color: 'bg-yellow-200'
        }
      ]
    },
    fieldMappings: {
      responsibleParty: 'Joint (Proportional)',
      maintenanceOwnerResponsibility: 'Major structural maintenance and regulatory compliance',
      maintenanceReasoning: 'Percentage lease structure per Section 5.1 establishes proportional cost sharing with landlord covering major structural items and compliance requirements',
    },
    matchedFields: ['Responsible Party', 'Maintenance Owner Responsibility', 'Legal Notes'],
  }
];

// Document database - uploaded documents
const DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    name: 'land-reports-2025-04-21T10_19_42.23YZ.pdf',
    uploadDate: '12/11/2025',
    uploadedBy: 'svs. team_v24.r2.f.17',
    totalPages: 25,
  },
  {
    id: 'doc-2',
    name: 'lease-agreement-2024.pdf',
    uploadDate: '11/15/2024',
    uploadedBy: 'admin',
    totalPages: 18,
  },
  {
    id: 'doc-3',
    name: 'maintenance-contract-2025.pdf',
    uploadDate: '01/20/2025',
    uploadedBy: 'legal.team',
    totalPages: 32,
  },
];

export default function App() {
  const [formData, setFormData] = useState<Record<string, string>>({
    agreementName: '',
    agreementDate: '',
    notes: '',
    responsibleParty: '',
    maintenanceOwnerResponsibility: '',
    maintenanceReasoning: '',
    billingContact: '',
    billingAgreement: '',
  });

  const [aiMode, setAiMode] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [snippets, setSnippets] = useState<any[]>([]);
  const [highlightedSection, setHighlightedSection] = useState<{ page: number; segment: string } | null>(null);
  const [ghostValues, setGhostValues] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use ref to store latest formData for field search (ensures we always have current values)
  const formDataRef = useRef(formData);
  
  // Track last auto-populated snippet to prevent re-populating the same one
  const lastAutoPopulatedSnippetId = useRef<string | null>(null);
  
  // Document management
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [lastViewedDocumentId, setLastViewedDocumentId] = useState<string | null>(null);
  
  // Keep formDataRef in sync with formData
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Load first document by default when AI mode is enabled
  useEffect(() => {
    if (aiMode && !selectedDocumentId && DOCUMENTS.length > 0) {
      const firstDocId = DOCUMENTS[0].id;
      setSelectedDocumentId(firstDocId);
      setLastViewedDocumentId(firstDocId);
    }
  }, [aiMode, selectedDocumentId]);

  // Track last viewed document when snippets are shown
  useEffect(() => {
    if (snippets.length > 0 && selectedDocumentId) {
      setLastViewedDocumentId(selectedDocumentId);
    }
  }, [snippets.length, selectedDocumentId]);

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setLastViewedDocumentId(documentId);
  };

  const selectedDocument = DOCUMENTS.find(doc => doc.id === selectedDocumentId);
  const lastViewedDocument = DOCUMENTS.find(doc => doc.id === lastViewedDocumentId);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [fieldId]: value,
      };
      // Update ref immediately to ensure latest values are available for search
      formDataRef.current = newFormData;
      return newFormData;
    });
    
    // Don't clear ghost value automatically - let user see preview even while typing
    // Ghost value will be cleared when they accept or when new snippet is hovered
  };

  // Helper function that accepts formData explicitly to ensure we use latest values
  const handleFieldSearchWithData = (fieldId: string, searchValue: string, currentFormData: Record<string, string>) => {
    // Reverse search: when user types in maintenance field, show snippets
    // Consider ALL three bound fields together, not just the current field
    // IMPORTANT: Do NOT auto-fill while typing - only show snippets for user to choose
    if (!aiMode) {
      return;
    }
    
    // Show AI analyzing animation
    setIsAnalyzing(true);
    
    // If searchValue is too short, check if other fields have values
    // If no fields have values, show all snippets (but don't auto-fill)
    if (!searchValue || searchValue.trim().length < 2) {
      const boundFields = ['responsibleParty', 'maintenanceOwnerResponsibility', 'maintenanceReasoning'];
      const hasAnyFieldValue = boundFields.some(fid => {
        const value = fid === fieldId ? searchValue?.trim() : currentFormData[fid]?.trim();
        return value && value.length >= 2;
      });
      
      // If no fields have values, show all snippets (but don't auto-fill)
      if (!hasAnyFieldValue) {
        const snippetsWithConfidence = SNIPPET_DATABASE.map(snippet => ({
          ...snippet,
          confidenceScore: 50, // Default confidence when no search criteria
        }));
        setSnippets(snippetsWithConfidence);
        if (SNIPPET_DATABASE.length > 0) {
          setHighlightedSection({
            page: SNIPPET_DATABASE[0].pdfReference.page,
            segment: SNIPPET_DATABASE[0].pdfReference.segment,
          });
        }
        setIsAnalyzing(false);
        // DO NOT auto-populate - user should choose manually
      } else {
        setIsAnalyzing(false);
      }
      return;
    }

    // The three bound maintenance fields
    const boundFields = ['responsibleParty', 'maintenanceOwnerResponsibility', 'maintenanceReasoning'];
    
    // Get all field values (including current field being typed)
    // Use the provided currentFormData to ensure we have the latest values
    const getFieldValue = (fid: string): string => {
      if (fid === fieldId) {
        // Use the searchValue for the current field being typed (most up-to-date)
        return searchValue.trim();
      } else {
        // Use the currentFormData value for other fields (ensures latest state)
        return currentFormData[fid]?.trim() || '';
      }
    };

    // Collect all field values that have content
    const fieldValues: Record<string, string> = {};
    boundFields.forEach(fid => {
      const value = getFieldValue(fid);
      if (value && value.length >= 2) {
        fieldValues[fid] = value;
      }
    });

    // If no fields have values, show all snippets (but don't auto-fill)
    if (Object.keys(fieldValues).length === 0) {
      const snippetsWithConfidence = SNIPPET_DATABASE.map(snippet => ({
        ...snippet,
        confidenceScore: 50, // Default confidence when no search criteria
      }));
      setSnippets(snippetsWithConfidence);
      if (SNIPPET_DATABASE.length > 0) {
        setHighlightedSection({
          page: SNIPPET_DATABASE[0].pdfReference.page,
          segment: SNIPPET_DATABASE[0].pdfReference.segment,
        });
      }
      setIsAnalyzing(false);
      // DO NOT auto-populate - user should choose manually
      return;
    }

    // Filter snippets that match ALL bound fields together
    // A snippet must match ALL fields that have values (not just one)
    const matches = SNIPPET_DATABASE.map(snippet => {
      let totalMatchScore = 0;
      let fieldsMatched = 0;
      const totalFieldsWithValues = Object.keys(fieldValues).length;
      let maxPossibleScore = 0;
      
      // Check each field that has a value
      Object.entries(fieldValues).forEach(([fid, fieldValue]) => {
        const snippetValue = snippet.fieldMappings[fid];
        
        // Skip if snippet doesn't have this field
        if (!snippetValue) {
          maxPossibleScore += 3; // Still count max possible for fields without snippet value
          return;
        }
        
        const fieldLower = fieldValue.toLowerCase();
        const snippetLower = snippetValue.toLowerCase();
        
        // Calculate match score for this field
        let fieldScore = 0;
        maxPossibleScore += 3; // Max score per field is 3
        
        // Exact match (highest priority)
        if (snippetLower === fieldLower) {
          fieldScore = 3;
        }
        // Contains full field value
        else if (snippetLower.includes(fieldLower)) {
          fieldScore = 2;
        }
        // Partial match - check if significant words match
        else {
          const fieldWords = fieldLower.split(/\s+/).filter(w => w.length >= 2);
          if (fieldWords.length > 0) {
            const matchingWords = fieldWords.filter(word => {
              // Check if snippet contains the word (for complete words)
              if (snippetLower.includes(word)) {
                return true;
              }
              // Also check if any word in snippet starts with this word (for partial typing like "Inte" -> "Integrity")
              const snippetWords = snippetLower.split(/\s+/);
              return snippetWords.some(snippetWord => snippetWord.startsWith(word));
            });
            if (matchingWords.length > 0) {
              // Partial score based on how many words match
              // Give higher score if all words match
              fieldScore = (matchingWords.length / fieldWords.length) * 1.5;
            }
          }
        }
        
        // If this field matches, add to total and increment matched count
        if (fieldScore > 0) {
          totalMatchScore += fieldScore;
          fieldsMatched++;
        }
      });
      
      // Calculate confidence score (0-100)
      // Based on: match score ratio, fields matched ratio, and whether all fields matched
      const matchRatio = maxPossibleScore > 0 ? totalMatchScore / maxPossibleScore : 0;
      const fieldsMatchedRatio = totalFieldsWithValues > 0 ? fieldsMatched / totalFieldsWithValues : 0;
      const allFieldsMatched = fieldsMatched === totalFieldsWithValues ? 1 : 0;
      
      // Weighted confidence: 50% match quality, 30% fields matched, 20% all fields matched bonus
      const confidenceScore = Math.min(100, Math.round(
        (matchRatio * 50) + 
        (fieldsMatchedRatio * 30) + 
        (allFieldsMatched * 20)
      ));
      
      return {
        ...snippet,
        confidenceScore,
        totalMatchScore,
        fieldsMatched,
        matchesAllFields: fieldsMatched === totalFieldsWithValues && totalMatchScore > 0,
      };
    }).filter(snippet => snippet.matchesAllFields);

    // Sort by relevance: better matches first
    // Prioritize snippets that match more fields and have higher scores
    matches.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      let fieldsMatchedA = 0;
      let fieldsMatchedB = 0;
      
      // Recalculate scores for sorting (more accurate)
      Object.entries(fieldValues).forEach(([fid, fieldValue]) => {
        const fieldLower = fieldValue.toLowerCase();
        const aValue = a.fieldMappings[fid]?.toLowerCase() || '';
        const bValue = b.fieldMappings[fid]?.toLowerCase() || '';
        
        // Check match quality for snippet A
        if (aValue === fieldLower) {
          scoreA += 3;
          fieldsMatchedA++;
        } else if (aValue.includes(fieldLower)) {
          scoreA += 2;
          fieldsMatchedA++;
        } else {
          const fieldWords = fieldLower.split(/\s+/).filter(w => w.length > 2);
          if (fieldWords.some(word => aValue.includes(word))) {
            scoreA += 1;
            fieldsMatchedA++;
          }
        }
        
        // Check match quality for snippet B
        if (bValue === fieldLower) {
          scoreB += 3;
          fieldsMatchedB++;
        } else if (bValue.includes(fieldLower)) {
          scoreB += 2;
          fieldsMatchedB++;
        } else {
          const fieldWords = fieldLower.split(/\s+/).filter(w => w.length > 2);
          if (fieldWords.some(word => bValue.includes(word))) {
            scoreB += 1;
            fieldsMatchedB++;
          }
        }
      });
      
      // First sort by number of fields matched (more is better)
      if (fieldsMatchedA !== fieldsMatchedB) {
        return fieldsMatchedB - fieldsMatchedA;
      }
      
      // Then sort by total score
      return scoreB - scoreA;
    });

    // Simulate AI processing delay
    setTimeout(() => {
      if (matches.length > 0) {
        setSnippets(matches);
        setHighlightedSection({
          page: matches[0].pdfReference.page,
          segment: matches[0].pdfReference.segment,
        });
        setIsAnalyzing(false);
        // Auto-populate first snippet to all maintenance fields if it's different from the last one
        setTimeout(() => {
          if (lastAutoPopulatedSnippetId.current !== matches[0].id) {
            lastAutoPopulatedSnippetId.current = matches[0].id;
            handleApplySnippet(matches[0], true);
          }
        }, 100);
      } else {
        // If no matches, show all snippets so user can still browse
        const snippetsWithConfidence = SNIPPET_DATABASE.map(snippet => ({
          ...snippet,
          confidenceScore: 30, // Low confidence when no matches
        }));
        setSnippets(snippetsWithConfidence);
        setIsAnalyzing(false);
      }
    }, 500); // 500ms delay to show AI animation
  };

  const handleToggleAiMode = (newMode: boolean) => {
    // When toggling ON AI mode, search for matching snippets based on filled fields
    if (newMode && !aiMode) {
      const maintenanceFields = ['responsibleParty', 'maintenanceOwnerResponsibility', 'maintenanceReasoning'];
      const filledFields = Object.entries(formData).filter(([key, value]) => {
        return maintenanceFields.includes(key) && value && value.trim().length > 0;
      });

      let matches: any[] = [];
      let shouldAutoPrefill = false;

      if (filledFields.length > 0) {
        // Find snippets that match the pre-filled fields with fuzzy/partial matching
        matches = SNIPPET_DATABASE.filter(snippet => {
          let matchScore = 0;
          filledFields.forEach(([fieldId, fieldValue]) => {
            const snippetValue = snippet.fieldMappings[fieldId];
            if (snippetValue) {
              const fieldLower = fieldValue.toLowerCase().trim();
              const snippetLower = snippetValue.toLowerCase();
              
              // Exact match
              if (snippetLower === fieldLower) {
                matchScore += 3;
              }
              // Contains full field value
              else if (snippetLower.includes(fieldLower)) {
                matchScore += 2;
              }
              // Partial match - check if any significant words match
              else {
                const fieldWords = fieldLower.split(/\s+/).filter(w => w.length > 2);
                const matchingWords = fieldWords.filter(word => snippetLower.includes(word));
                if (matchingWords.length > 0) {
                  matchScore += matchingWords.length / fieldWords.length; // Partial score
                }
              }
            }
          });
          return matchScore > 0; // At least some match
        });

        // Sort by match score (better matches first)
        matches.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          filledFields.forEach(([fieldId, fieldValue]) => {
            const fieldLower = fieldValue.toLowerCase().trim();
            if (a.fieldMappings[fieldId]?.toLowerCase().includes(fieldLower)) scoreA++;
            if (b.fieldMappings[fieldId]?.toLowerCase().includes(fieldLower)) scoreB++;
          });
          return scoreB - scoreA;
        });
        
        // Add confidence scores to matches based on match quality
        matches = matches.map((snippet, index) => ({
          ...snippet,
          confidenceScore: Math.max(60, 100 - (index * 5)), // Higher confidence for better matches
        }));
      } else {
        // No fields filled - show all snippets and auto-prefill first one
        matches = SNIPPET_DATABASE.map(snippet => ({
          ...snippet,
          confidenceScore: 50, // Default confidence when no search criteria
        }));
        shouldAutoPrefill = true;
      }

      // If few fields filled (1-2), also auto-prefill
      if (filledFields.length > 0 && filledFields.length < 3) {
        shouldAutoPrefill = true;
      }

      // Ensure all snippets have confidence scores (fallback)
      matches = matches.map(snippet => ({
        ...snippet,
        confidenceScore: snippet.confidenceScore !== undefined ? snippet.confidenceScore : 50,
      }));

      // Show matching snippets
      if (matches.length > 0) {
        setSnippets(matches);
        setHighlightedSection({
          page: matches[0].pdfReference.page,
          segment: matches[0].pdfReference.segment,
        });

        // Auto-prefill with first snippet if needed
        if (shouldAutoPrefill) {
          // Use setTimeout to ensure state updates are processed
          setTimeout(() => {
            // Apply snippet but keep snippets visible so user can change
            handleApplySnippet(matches[0], true);
          }, 100);
        }
      }
    }

    // When toggling OFF AI mode, convert all ghost values to actual values
    if (!newMode && aiMode) {
      setFormData(prev => {
        const updated = { ...prev };
        Object.entries(ghostValues).forEach(([fieldId, ghostValue]) => {
          // Only apply ghost value if field is empty
          if (!prev[fieldId]) {
            updated[fieldId] = ghostValue;
          }
        });
        return updated;
      });
      setGhostValues({});
    }
    setAiMode(newMode);
    
    // When toggling ON AI mode, scroll to maintenance section in the form
    if (newMode && !aiMode) {
      setTimeout(() => {
        // Find the maintenance section and scroll to it within the form panel
        const maintenanceSection = document.querySelector('[data-section="maintenance"]');
        if (maintenanceSection) {
          // Find the scrollable form container (right panel)
          const formContainer = maintenanceSection.closest('.overflow-y-auto');
          if (formContainer) {
            // Calculate position relative to the scrollable container
            const containerRect = formContainer.getBoundingClientRect();
            const sectionRect = maintenanceSection.getBoundingClientRect();
            const scrollTop = formContainer.scrollTop;
            const relativeTop = sectionRect.top - containerRect.top + scrollTop;
            
            formContainer.scrollTo({
              top: relativeTop - 20, // 20px offset from top
              behavior: 'smooth',
            });
          } else {
            // Fallback to regular scrollIntoView
            maintenanceSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }
      }, 300); // Small delay to ensure the form is rendered
    }
  };

  const handleAcceptGhost = (fieldId: string) => {
    const ghostValue = ghostValues[fieldId];
    if (ghostValue) {
      setFormData(prev => ({ ...prev, [fieldId]: ghostValue }));
      setGhostValues(prev => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };

  const handleFieldSearch = (fieldId: string, searchValue: string) => {
    // Use the ref to get the latest formData (ensures we have current values for all fields)
    handleFieldSearchWithData(fieldId, searchValue, formDataRef.current);
  };

  const handleClearAll = () => {
    setFormData({
      agreementName: '',
      agreementDate: '',
      notes: '',
      responsibleParty: '',
      maintenanceOwnerResponsibility: '',
      maintenanceReasoning: '',
      billingContact: '',
      billingAgreement: '',
    });
    setGhostValues({});
    setGlobalSearchQuery('');
    setIsAnalyzing(false);
    // Show all snippets when all fields are cleared
    const snippetsWithConfidence = SNIPPET_DATABASE.map(snippet => ({
      ...snippet,
      confidenceScore: 50, // Default confidence when no search criteria
    }));
    setSnippets(snippetsWithConfidence);
    if (SNIPPET_DATABASE.length > 0) {
      setHighlightedSection({
        page: SNIPPET_DATABASE[0].pdfReference.page,
        segment: SNIPPET_DATABASE[0].pdfReference.segment,
      });
    }
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    
    // Show AI analyzing animation
    setIsAnalyzing(true);
    
    // Simulate finding snippets based on search
    if (query.trim().length > 2) {
      const searchLower = query.toLowerCase();
      const queryWords = searchLower.split(/\s+/).filter(w => w.length >= 2);
      
      // Search across all snippets and calculate confidence scores
      const matches = SNIPPET_DATABASE.map(snippet => {
        let matchScore = 0;
        let maxScore = 0;
        
        // Check title match
        if (snippet.title.toLowerCase().includes(searchLower)) {
          matchScore += 3;
        } else if (queryWords.some(word => snippet.title.toLowerCase().includes(word))) {
          matchScore += 1.5;
        }
        maxScore += 3;
        
        // Check full text match
        if (snippet.pdfReference.fullText?.toLowerCase().includes(searchLower)) {
          matchScore += 2;
        } else if (snippet.pdfReference.fullText && queryWords.some(word => 
          snippet.pdfReference.fullText!.toLowerCase().includes(word)
        )) {
          matchScore += 1;
        }
        maxScore += 2;
        
        // Check field mappings match
        const fieldMatches = Object.values(snippet.fieldMappings).filter(value => 
          value.toLowerCase().includes(searchLower)
        ).length;
        if (fieldMatches > 0) {
          matchScore += fieldMatches * 2;
        }
        maxScore += Object.keys(snippet.fieldMappings).length * 2;
        
        // Calculate confidence (0-100)
        const confidenceScore = maxScore > 0 
          ? Math.min(100, Math.round((matchScore / maxScore) * 100))
          : 0;
        
        return {
          ...snippet,
          confidenceScore,
          matchScore,
        };
      }).filter(snippet => snippet.matchScore > 0)
        .sort((a, b) => b.confidenceScore - a.confidenceScore);

      // Simulate AI processing delay
      setTimeout(() => {
        setSnippets(matches.length > 0 ? matches : SNIPPET_DATABASE.map(s => ({ ...s, confidenceScore: 30 })));
        
        // Highlight first snippet
        if (matches.length > 0) {
          setHighlightedSection({
            page: matches[0].pdfReference.page,
            segment: matches[0].pdfReference.segment,
          });
        }
        setIsAnalyzing(false);
      }, 500);
    } else {
      setSnippets([]);
      setHighlightedSection(null);
      setIsAnalyzing(false);
    }
  };

  // Preview snippet - shows ghost text (used when hovering over preview button)
  const handlePreviewSnippet = (snippet: any) => {
    // If snippet has no field mappings, clear the preview
    if (!snippet.fieldMappings || Object.keys(snippet.fieldMappings).length === 0) {
      setGhostValues({});
      return;
    }
    
    // Set all field mappings as ghost values for preview
    // Always show ghost text, even if fields have existing values
    const maintenanceFields = ['responsibleParty', 'maintenanceOwnerResponsibility', 'maintenanceReasoning'];
    const newGhostValues: Record<string, string> = {};
    
    // Set maintenance fields as ghost values (preview only)
    maintenanceFields.forEach((fieldId) => {
      const snippetValue = snippet.fieldMappings[fieldId];
      if (snippetValue) {
        // Always set ghost value for preview (user can see what it would look like)
        newGhostValues[fieldId] = snippetValue;
      }
    });
    
    // Apply other field mappings as ghost values if they exist
    Object.entries(snippet.fieldMappings).forEach(([fieldId, value]) => {
      if (!maintenanceFields.includes(fieldId)) {
        newGhostValues[fieldId] = value as string;
      }
    });
    
    // Set all ghost values at once (this will show even if fields have existing text)
    setGhostValues(newGhostValues);
  };

  // Accept ghost values - converts ghost text to solid text
  const handleAcceptGhostValues = () => {
    // Convert all ghost values to actual form data
    setFormData(prev => {
      const updated = { ...prev };
      Object.entries(ghostValues).forEach(([fieldId, ghostValue]) => {
        // Only accept if field is empty or already has the ghost value
        if (!prev[fieldId] || prev[fieldId].trim().length === 0) {
          updated[fieldId] = ghostValue;
        }
      });
      return updated;
    });
    
    // Clear ghost values after accepting
    setGhostValues({});
  };

  const handleApplySnippet = (snippet: any, keepSnippetsVisible: boolean = false) => {
    // Apply snippet to form fields (including all three fields)
    // Always apply to all three maintenance fields, even if they have existing text
    // This is used for auto-fill when AI toggle is first clicked
    const maintenanceFields = ['responsibleParty', 'maintenanceOwnerResponsibility', 'maintenanceReasoning'];
    
    maintenanceFields.forEach((fieldId) => {
      const snippetValue = snippet.fieldMappings[fieldId];
      if (snippetValue) {
        // Apply directly to form data (overwrites existing text)
        setFormData(prev => ({ ...prev, [fieldId]: snippetValue }));
        // Also clear any ghost value for this field since we're setting actual value
        setGhostValues(prev => {
          const updated = { ...prev };
          delete updated[fieldId];
          return updated;
        });
      }
    });
    
    // Apply other field mappings as ghost values if they exist
    Object.entries(snippet.fieldMappings).forEach(([fieldId, value]) => {
      if (!maintenanceFields.includes(fieldId)) {
        setGhostValues(prev => ({ ...prev, [fieldId]: value as string }));
      }
    });
    
    // Only clear snippets if not keeping them visible (for auto-prefill)
    if (!keepSnippetsVisible) {
      setSnippets([]);
      setGlobalSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm">☰</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-600 font-bold">LOCATION</span>
              <span className="bg-red-600 text-white px-1.5 py-0.5 text-xs">HQ</span>
            </div>
          </div>
          
          {/* AI Fill Toggle - Only show when AI mode is ON */}
          {aiMode && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-r border-gray-300 pr-4 animate-in fade-in slide-in-from-right duration-300">
                <span className="text-sm text-gray-700">AI Fill</span>
                <button
                  onClick={() => handleToggleAiMode(false)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600 hover:bg-blue-700"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
                <span className="text-xs font-medium text-red-600">ON</span>
              </div>

              {aiMode && (
                <>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded"
                  >
                    Clear All
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              🔍
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              👤
            </button>
          </div>
        </div>
      </header>

      {aiMode ? (
        <>
          {/* Document Selector and Search Bar - Side by Side */}
          <div className="bg-white border-b border-gray-300 sticky top-0 z-20">
            <div className="flex items-center gap-3 px-4 py-2.5">
              {/* Document Selector - Left Side (compact) */}
              <div className="flex-shrink-0">
                <DocumentSelector
                  documents={DOCUMENTS}
                  selectedDocumentId={selectedDocumentId}
                  onSelectDocument={handleSelectDocument}
                />
              </div>

              {/* Global Search Bar - Extends to the left */}
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts for evidence... (e.g., 'maintenance responsibility')"
                  value={globalSearchQuery}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => {
                      setGlobalSearchQuery('');
                      setSnippets([]);
                      setHighlightedSection(null);
                      setIsAnalyzing(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {isAnalyzing && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <AIAnalyzingAnimation size="sm" message="" />
                  </div>
                )}
                {globalSearchQuery && !isAnalyzing && (
                  <div className="absolute top-full left-0 right-0 mt-2 text-sm text-gray-600">
                    {snippets.length > 0 ? (
                      <span className="text-purple-600">
                        Matches: "{globalSearchQuery}" - {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} found
                      </span>
                    ) : globalSearchQuery.length > 2 ? (
                      <span className="text-gray-500">Searching...</span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Split Pane Layout */}
          <main className="h-[calc(100vh-180px)]">
            <ResizablePanelGroup direction="horizontal">
              {/* Left Pane - Document Viewer or Snippet List */}
              <ResizablePanel defaultSize={60} minSize={40}>
                {snippets.length > 0 ? (
                  <SnippetList
                    snippets={snippets}
                    onApply={handleApplySnippet}
                    onPreview={handlePreviewSnippet}
                    onClose={() => {
                      setSnippets([]);
                      setGlobalSearchQuery('');
                      setHighlightedSection(null);
                      setIsAnalyzing(false);
                      // Restore last viewed document (or first document by default)
                      if (lastViewedDocumentId) {
                        setSelectedDocumentId(lastViewedDocumentId);
                      } else if (DOCUMENTS.length > 0) {
                        setSelectedDocumentId(DOCUMENTS[0].id);
                        setLastViewedDocumentId(DOCUMENTS[0].id);
                      }
                    }}
                    searchQuery={globalSearchQuery}
                    isAnalyzing={isAnalyzing}
                  />
                ) : (
                  <DocumentViewer 
                    document={selectedDocument || null}
                    highlightedSection={highlightedSection} 
                  />
                )}
              </ResizablePanel>

              <ResizableHandle />

              {/* Right Pane - Form Panel */}
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full overflow-y-auto bg-white">
                  <AgreementForm
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    aiMode={aiMode}
                    ghostValues={ghostValues}
                    onAcceptGhost={handleAcceptGhost}
                    onFieldSearch={handleFieldSearch}
                    onToggleAiMode={handleToggleAiMode}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </>
      ) : (
        /* Original Single Pane Layout */
        <main className="max-w-7xl mx-auto px-6 py-8">
          <AgreementForm
            formData={formData}
            onFieldChange={handleFieldChange}
            aiMode={false}
            onToggleAiMode={handleToggleAiMode}
          />
        </main>
      )}
      
      {/* AI Fill Help Button */}
      {aiMode && <AIFillHelp />}
    </div>
  );
}
