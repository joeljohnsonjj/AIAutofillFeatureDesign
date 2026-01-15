import { useState, useEffect, useRef } from 'react';
import { Search, Eye, Check, X } from 'lucide-react';
import { FormField } from '../App';
import { GhostFormField } from './GhostFormField';
import { AIAnalyzingAnimation } from './AIAnalyzingAnimation';

interface CategorySectionProps {
  category: string;
  title: string;
  fields: FormField[];
  formData: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  aiMode?: boolean;
  ghostValues?: Record<string, string>;
  onAcceptGhost?: (fieldId: string) => void;
  onFieldSearch?: (fieldId: string, value: string) => void;
  onToggleAiMode?: (enabled: boolean) => void;
  isAnalyzing?: boolean;
  snippetsCount?: number;
  isAIApproved?: boolean;
  hasAIGeneratedFields?: Record<string, boolean>; // Track which fields have AI-generated values
}

interface PDFReference {
  page: number;
  segment: string;
  context: string;
}

interface AIResponse {
  id: string;
  title: string;
  summary: string;
  fullDetails: string;
  fieldMappings: Record<string, string>;
  previewSections?: string[];
  citation?: string;
  pdfReferences?: PDFReference[];
}

// Mock AI responses based on search quer

export function CategorySection({
  category,
  title,
  formData,
  onFieldChange,
  aiMode = false,
  ghostValues = {},
  onAcceptGhost,
  onFieldSearch,
  onToggleAiMode,
  isAnalyzing = false,
  snippetsCount = 0,
  isAIApproved = false,
  hasAIGeneratedFields = {},
}: CategorySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPreviewResponse, setSelectedPreviewResponse] = useState<AIResponse | null>(null);
  
  // Field-level autocomplete
  const [activeField, setActiveField] = useState<string | null>(null);
  const [fieldSuggestions, setFieldSuggestions] = useState<AIResponse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // AI search functionality removed per user request
  // The search bar in maintenance section has been completely removed
  useEffect(() => {
    // Clear any existing search state since search bar is removed
    setSearchQuery('');
    setAiResponses([]);
    setShowCitations(false);
    setIsSearching(false);
    setIsProcessing(false);
  }, [aiMode, category]);

  // Field value matches - DISABLED since search bar is removed
  // This functionality was tied to the maintenance section search bar
  useEffect(() => {
    // Clear field suggestions since search is removed
    setFieldSuggestions([]);
    setShowSuggestions(false);
  }, [formData, activeField]);

  const handleApplyCitation = (response: AIResponse) => {
    // Apply all field mappings from the response
    Object.entries(response.fieldMappings).forEach(([fieldId, value]) => {
      onFieldChange(fieldId, value);
    });
    
    // Close citations after applying
    setShowCitations(false);
    setSearchQuery('');
    setAiResponses([]);
  };

  const handlePreviewClick = (response: AIResponse) => {
    setSelectedPreviewResponse(response);
    setShowPreviewModal(true);
  };

  const handleSuggestionSelect = (response: AIResponse) => {
    // Apply all fields from this citation
    Object.entries(response.fieldMappings).forEach(([fieldId, value]) => {
      onFieldChange(fieldId, value);
    });
    setShowSuggestions(false);
    setActiveField(null);
  };

  const handleFieldFocus = (fieldId: string) => {
    setActiveField(fieldId);
  };

  const handleFieldBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setActiveField(null);
      setShowSuggestions(false);
    }, 200);
  };

  const renderFieldWithAutocomplete = (
    fieldId: string,
    label: string,
    placeholder: string,
    value: string,
    isTextarea: boolean = false
  ) => {
    const hasSuggestions = showSuggestions && activeField === fieldId && fieldSuggestions.length > 0;

    // If in AI mode, use GhostFormField
    if (aiMode) {
      const ghostValue = ghostValues[fieldId];
      const hasGhost = Boolean(ghostValue && !value);
      
      return (
        <GhostFormField
          id={fieldId}
          label={label}
          value={value}
          ghostValue={ghostValue}
          placeholder={placeholder}
          isTextarea={isTextarea}
          onChange={(newValue) => onFieldChange(fieldId, newValue)}
          onFocus={() => handleFieldFocus(fieldId)}
          onBlur={handleFieldBlur}
          onAcceptGhost={onAcceptGhost}
          onFieldSearch={onFieldSearch}
          hasAISuggestion={hasGhost}
          sourceInfo={hasGhost ? {
            page: 12,
            snippet: ghostValue?.substring(0, 50) + '...'
          } : undefined}
          isAIApproved={isAIApproved}
          aiMode={aiMode}
          hasAIGeneratedValue={hasAIGeneratedFields[fieldId] || false}
        />
      );
    }

    return (
      <div id={`field-${fieldId}`} className="relative">
        <label className="block text-sm text-gray-700 mb-2">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {isTextarea ? (
            <textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              onFocus={() => handleFieldFocus(fieldId)}
              onBlur={handleFieldBlur}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
            />
          ) : (
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              onFocus={() => handleFieldFocus(fieldId)}
              onBlur={handleFieldBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          )}
          
          {/* Autocomplete suggestions dropdown */}
          {hasSuggestions && (
            <div 
              ref={(el) => { suggestionRefs.current[fieldId] = el; }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {fieldSuggestions.map((response) => (
                <button
                  key={response.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionSelect(response);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {response.title}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {response.fieldMappings[fieldId]}
                  </div>
                  {response.citation && (
                    <div className="text-xs text-gray-500 italic mt-1">
                      {response.citation}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    if (category === 'identification') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {renderFieldWithAutocomplete(
              'agreementName',
              'Agreement name',
              'Agreement name',
              formData.agreementName
            )}
            {renderFieldWithAutocomplete(
              'agreementDate',
              'Agreement date',
              'MM/DD/YYYY',
              formData.agreementDate
            )}
          </div>
          {renderFieldWithAutocomplete(
            'notes',
            'Notes',
            'Enter any additional notes about this agreement',
            formData.notes,
            true
          )}
        </>
      );
    }

    if (category === 'maintenance') {
      // Check if any maintenance field has AI-generated values (after Accept is pressed)
      const maintenanceFields = ['responsibleParty', 'maintenanceOwnerResponsibility', 'maintenanceReasoning'];
      const hasAIFilledValues = maintenanceFields.some(fieldId => hasAIGeneratedFields[fieldId]);
      
      return (
        <div className="space-y-4">
          {/* AI Filled Status Message - Show when fields have AI-generated values (after Accept) */}
          {hasAIFilledValues && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-900">
                  <span className="font-semibold">These fields were filled by AI.</span>
                  {' '}You can edit them as needed. The AI-generated content will remain until you manually clear all fields.
                </p>
              </div>
            </div>
          )}
          
          {renderFieldWithAutocomplete(
            'responsibleParty',
            'Responsible party',
            'Responsible party',
            formData.responsibleParty || ''
          )}
          {renderFieldWithAutocomplete(
            'maintenanceOwnerResponsibility',
            'Maintenance owner responsibility',
            'Maintenance owner responsibility',
            formData.maintenanceOwnerResponsibility || ''
          )}
          {renderFieldWithAutocomplete(
            'maintenanceReasoning',
            'Maintenance reasoning',
            'Maintenance reasoning',
            formData.maintenanceReasoning || ''
          )}
        </div>
      );
    }

    if (category === 'billing') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {renderFieldWithAutocomplete(
            'billingContact',
            'Billing contact',
            'Billing contact',
            formData.billingContact,
            true
          )}
          {renderFieldWithAutocomplete(
            'billingAgreement',
            'Billing agreement',
            'Billing agreement',
            formData.billingAgreement,
            true
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="border-b border-gray-200" data-section={category}>
      <div className="px-6 py-6">
        {/* Category Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-bold text-xl">{title}</h2>
            <div className="flex items-center gap-3">
              {/* AI Analyzing Animation - Show in maintenance section when analyzing */}
              {category === 'maintenance' && aiMode && isAnalyzing && (
                <div className="animate-in fade-in slide-in-from-right duration-300">
                  <AIAnalyzingAnimation size="sm" message="" />
                </div>
              )}
              {/* Snippet Count - Show when not analyzing and snippets are available */}
              {category === 'maintenance' && aiMode && !isAnalyzing && snippetsCount > 0 }
              {/* AI Fill Toggle - Show in maintenance section */}
              {category === 'maintenance' && onToggleAiMode && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
                  <span className="text-sm text-gray-700">AI Fill</span>
                  <button
                    onClick={() => onToggleAiMode(!aiMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      aiMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={`text-xs font-medium ${aiMode ? 'text-red-600' : 'text-gray-500'}`}>
                    {aiMode ? 'ON' : 'OFF'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* AI Search Bar - REMOVED per user request */}
          {false && category === 'maintenance' && !aiMode && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <div className={`relative ${isSearching ? 'rotating-border-container' : ''}`}>
                  <input
                    type="text"
                    placeholder="Search AI suggestions for this section..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent relative z-10 bg-white"
                  />
                  {isSearching && (
                    <div className="rotating-border"></div>
                  )}
                </div>
              </div>
              
              {/* Loading indicator */}
              {isProcessing && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  Processing AI suggestions...
                </div>
              )}
              
              {/* Citations below search box */}
              {showCitations && aiResponses.length > 0 && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700 mb-3 flex items-center justify-between">
                    <span className="font-medium">
                      {aiResponses.length} result{aiResponses.length !== 1 ? 's' : ''} found
                    </span>
                    <button
                      onClick={() => {
                        setShowCitations(false);
                        setSearchQuery('');
                        setAiResponses([]);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {aiResponses.map((response, index) => (
                      <div 
                        key={response.id} 
                        className="bg-white border border-purple-200 rounded-lg p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            [{index + 1}] {response.title}
                          </div>
                          {response.citation && (
                            <div className="text-xs text-gray-500 italic">
                              {response.citation}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Preview Button */}
                          <button
                            onClick={() => handlePreviewClick(response)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview PDF references"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Check/Apply Button */}
                          <button
                            onClick={() => handleApplyCitation(response)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Apply to form"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Fields */}
        {renderFormFields()}
      </div>

      {/* Preview Modal for PDF References */}
      {showPreviewModal && selectedPreviewResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 mb-1">{selectedPreviewResponse.title}</h3>
                <p className="text-sm text-gray-600">{selectedPreviewResponse.citation}</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Body - PDF References */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Referenced from {selectedPreviewResponse.pdfReferences?.length || 0} location(s) in document:
                </h4>
                
                {selectedPreviewResponse.pdfReferences?.map((ref, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        Page {ref.page}
                      </span>
                      <span className="text-xs text-gray-500">Reference {index + 1}</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">Segment:</div>
                      <div className="text-sm bg-yellow-100 px-2 py-1 rounded inline-block">
                        "{ref.segment}"
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Context:</div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {ref.context}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Open PDF in new tab at specific page
                        // In a real application, this would open the actual PDF file
                        const pdfUrl = `/documents/agreement.pdf#page=${ref.page}`;
                        window.open(pdfUrl, '_blank');
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open PDF at Page {ref.page}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApplyCitation(selectedPreviewResponse);
                  setShowPreviewModal(false);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply to Form
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chaseBorder {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .rotating-border-container {
          position: relative;
        }
        
        .rotating-border {
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 10px;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            transparent 85%,
            rgb(147, 51, 234) 92%,
            rgb(147, 51, 234) 95%,
            transparent 98%,
            transparent 100%
          );
          animation: chaseBorder 1s linear infinite;
          z-index: 0;
        }
        
        .rotating-border::before {
          content: '';
          position: absolute;
          inset: 3px;
          background: white;
          border-radius: 8px;
          z-index: 1;
        }
        
        .rotating-border-container input {
          position: relative;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}