import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, X, FileText, Maximize2 } from 'lucide-react';
import { FormField } from '../App';

interface CategorySectionProps {
  category: string;
  title: string;
  fields: FormField[];
  formData: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
}

interface PDFReference {
  page: number;
  segment: string;
  context: string;
  snippet: string;
}

interface AIOption {
  id: string;
  value: string;
  description: string;
  confidence: number;
  pdfReferences?: PDFReference[];
  citation?: string;
}

interface FieldOptions {
  [fieldId: string]: AIOption[];
}

// Mock AI suggestions from PDF
const getPDFSuggestions = (category: string): FieldOptions => {
  const suggestions: Record<string, FieldOptions> = {
    maintenance: {
      responsibleParty: [
        {
          id: '1',
          value: 'Property Owner',
          description: 'Property owner responsible for all structural repairs and major building systems',
          confidence: 95,
          citation: 'Section 3.2, Paragraph 1',
          pdfReferences: [
            {
              page: 12,
              segment: 'Property Owner',
              context: 'Section 3.2: The Property Owner shall be responsible for all structural repairs, including but not limited to foundation work, load-bearing walls, and roof maintenance.',
              snippet: 'The Property Owner shall be responsible for all structural repairs, including but not limited to foundation work, load-bearing walls, and roof maintenance. This includes ensuring the building envelope remains weathertight and all major building systems are maintained in good working order.'
            }
          ]
        },
        {
          id: '2',
          value: 'Tenant',
          description: 'Tenant assumes responsibility for most operational costs in NNN lease arrangement',
          confidence: 88,
          citation: 'Section 2.1, Article 4',
          pdfReferences: [
            {
              page: 8,
              segment: 'Tenant',
              context: 'Section 2.1: Under this Triple Net (NNN) lease structure, the Tenant assumes comprehensive responsibility for property operations and maintenance.',
              snippet: 'Article 4: This agreement follows a triple net (NNN) lease structure where tenant assumes responsibility for property taxes, insurance, and maintenance costs in addition to base rent. The tenant shall maintain the property in good condition and handle all day-to-day operational expenses.'
            }
          ]
        },
        {
          id: '3',
          value: 'Shared Responsibility',
          description: 'Balanced maintenance split with negotiated cost thresholds',
          confidence: 82,
          citation: 'Section 1.5, Modified Gross Lease Terms',
          pdfReferences: [
            {
              page: 5,
              segment: 'Shared Responsibility',
              context: 'Section 1.5: This Modified Gross Lease establishes a Shared Responsibility framework for property maintenance and operational costs.',
              snippet: 'Section 1.5: This Modified Gross Lease establishes a Shared Responsibility framework for property maintenance and operational costs. Owner covers major repairs over $2,500, structural elements, and building systems. Tenant handles routine maintenance, minor repairs under $2,500, and interior upkeep.'
            }
          ]
        },
        {
          id: '4',
          value: 'Management Company',
          description: 'Third-party management company handles all maintenance coordination',
          confidence: 75,
          citation: 'Addendum B, Management Services',
          pdfReferences: [
            {
              page: 18,
              segment: 'Management Company',
              context: 'Addendum B: Property management services agreement delegating maintenance responsibilities to XYZ Management Services.',
              snippet: 'The property owner has contracted with XYZ Management Services to oversee all maintenance coordination, vendor management, and emergency repairs. The management company acts as the primary point of contact for all property-related issues.'
            }
          ]
        },
        {
          id: '5',
          value: 'HOA',
          description: 'Homeowners Association responsible for common area maintenance',
          confidence: 68,
          citation: 'HOA Bylaws Section 7',
          pdfReferences: [
            {
              page: 22,
              segment: 'HOA',
              context: 'HOA Bylaws Section 7: The Homeowners Association maintains responsibility for all common areas and shared facilities.',
              snippet: 'The Homeowners Association maintains responsibility for all common areas including parking lots, landscaping, exterior building maintenance, and shared amenities. Individual unit owners are responsible only for interior maintenance within their respective units.'
            }
          ]
        }
      ],
      maintenanceOwnerResponsibility: [
        {
          id: '1',
          value: 'Structural repairs, roof maintenance, HVAC systems, and major plumbing',
          description: 'Comprehensive owner responsibilities for major building systems',
          confidence: 93,
          citation: 'Article 5.1, Owner Obligations',
          pdfReferences: [
            {
              page: 15,
              segment: 'Structural repairs, roof maintenance, HVAC systems',
              context: 'Article 5.1: Owner responsibilities include structural repairs, complete roof maintenance and replacement, all HVAC systems servicing and repair, and major plumbing infrastructure.',
              snippet: 'Owner responsibilities include structural repairs, complete roof maintenance and replacement, all HVAC systems servicing and repair, and major plumbing infrastructure. The owner must respond to major system failures within 24 hours and complete repairs within a reasonable timeframe.'
            }
          ]
        },
        {
          id: '2',
          value: 'Structural integrity and major capital improvements only',
          description: 'Limited owner responsibilities under NNN lease structure',
          confidence: 87,
          citation: 'Section 2.3, NNN Lease Terms',
          pdfReferences: [
            {
              page: 9,
              segment: 'Structural integrity and major capital improvements only',
              context: 'Section 2.3: Owner responsibilities are limited to structural integrity and major capital improvements exceeding $10,000.',
              snippet: 'Under the Triple Net lease arrangement, owner responsibilities are limited to structural integrity of the building and major capital improvements exceeding $10,000. All routine maintenance, repairs, utilities, and property taxes are the responsibility of the tenant.'
            }
          ]
        },
        {
          id: '3',
          value: 'Building systems, life safety equipment, and code compliance',
          description: 'Modified gross lease with shared responsibilities',
          confidence: 85,
          citation: 'Section 3.1, Shared Maintenance Framework',
          pdfReferences: [
            {
              page: 7,
              segment: 'Building systems, life safety equipment',
              context: 'Section 3.1: Owner shall maintain all building systems, life safety equipment, and ensure code compliance for all structural elements.',
              snippet: 'Owner shall maintain all building systems, life safety equipment, and ensure code compliance for all structural elements. This includes fire suppression systems, emergency lighting, elevators, and all mechanical systems serving the common areas and multiple tenant spaces.'
            }
          ]
        },
        {
          id: '4',
          value: 'Exterior maintenance, parking lot, and landscaping only',
          description: 'Limited scope with management company handling operations',
          confidence: 72,
          citation: 'Addendum C, Scope of Services',
          pdfReferences: [
            {
              page: 19,
              segment: 'Exterior maintenance, parking lot, and landscaping',
              context: 'Addendum C: Owner retains responsibility for exterior building maintenance, parking lot upkeep, and professional landscaping services.',
              snippet: 'Owner retains responsibility for exterior building maintenance including painting, parking lot resurfacing and striping, and professional landscaping services for all common areas. The management company coordinates these services on behalf of the owner.'
            }
          ]
        },
        {
          id: '5',
          value: 'Common area maintenance and shared facilities',
          description: 'HOA-managed property responsibilities',
          confidence: 65,
          citation: 'HOA Bylaws Section 8',
          pdfReferences: [
            {
              page: 23,
              segment: 'Common area maintenance',
              context: 'HOA Bylaws Section 8: Individual owners contribute to HOA fees covering all common area maintenance and shared facility upkeep.',
              snippet: 'Individual owners contribute monthly HOA fees covering all common area maintenance including landscaping, pool maintenance, clubhouse upkeep, exterior painting, roof repairs, and parking lot maintenance. The HOA Board contracts with service providers for these maintenance items.'
            }
          ]
        }
      ],
      maintenanceReasoning: [
        {
          id: '1',
          value: 'Standard commercial property allocation per state law. Owner retains responsibility for major systems and structural elements while tenant handles day-to-day maintenance.',
          description: 'Standard legal framework for commercial leases',
          confidence: 94,
          citation: 'Legal Framework §45.2(b)',
          pdfReferences: [
            {
              page: 23,
              segment: 'Standard commercial property allocation per state law',
              context: 'Legal Framework: Standard commercial property allocation per state law §45.2(b) requires owner to retain responsibility for major systems and structural elements while tenant handles day-to-day maintenance.',
              snippet: 'Standard commercial property allocation per state law §45.2(b) establishes that in standard commercial leases, the property owner must retain responsibility for structural integrity, major building systems (HVAC, plumbing, electrical), and roof maintenance. This allocation protects both parties by ensuring the building remains safe and functional while allowing tenants to control their operational environment.'
            }
          ]
        },
        {
          id: '2',
          value: 'Triple net lease structure - tenant responsible for most operational costs. This agreement follows a triple net (NNN) lease structure where tenant assumes responsibility for property taxes, insurance, and maintenance costs in addition to base rent. Owner maintains structural integrity only.',
          description: 'NNN lease arrangement with tenant operational responsibility',
          confidence: 89,
          citation: 'Article 4, NNN Lease Structure',
          pdfReferences: [
            {
              page: 11,
              segment: 'Triple net lease structure',
              context: 'Article 4: This agreement follows a triple net (NNN) lease structure where tenant assumes responsibility for property taxes, insurance, and maintenance costs in addition to base rent.',
              snippet: 'This agreement follows a triple net (NNN) lease structure where tenant assumes comprehensive responsibility for property taxes, insurance premiums, and all maintenance costs in addition to base rent. The tenant effectively operates as a pseudo-owner with full operational control and responsibility. The landlord maintains only structural integrity obligations, creating a hands-off investment for the property owner.'
            }
          ]
        },
        {
          id: '3',
          value: 'Modified gross lease structure with negotiated maintenance responsibilities. Owner covers major repairs over $2,500, structural elements, and building systems. Tenant handles routine maintenance, minor repairs, and interior upkeep.',
          description: 'Balanced approach with negotiated thresholds',
          confidence: 86,
          citation: 'Article 6.2, Cost Threshold Structure',
          pdfReferences: [
            {
              page: 10,
              segment: 'major repairs over $2,500',
              context: 'Article 6.2: Cost threshold structure: Owner covers major repairs over $2,500, structural elements, and building systems. Tenant handles routine maintenance, minor repairs under $2,500, and interior upkeep.',
              snippet: 'Article 6.2 establishes a cost threshold structure balancing responsibilities between owner and tenant. Owner covers major repairs exceeding $2,500, all structural elements, building-wide systems, and capital improvements. Tenant handles day-to-day operations, routine maintenance tasks, minor repairs under $2,500, and all interior improvements and upkeep. This modified gross lease structure provides clarity and reduces disputes over maintenance obligations.'
            }
          ]
        },
        {
          id: '4',
          value: 'Professional management arrangement with third-party coordination. Management company handles all maintenance scheduling, vendor relations, and emergency response on behalf of owner.',
          description: 'Delegated management structure',
          confidence: 78,
          citation: 'Management Agreement Section 5',
          pdfReferences: [
            {
              page: 20,
              segment: 'Management company handles all maintenance',
              context: 'Management Agreement Section 5: The management company is authorized to schedule maintenance, hire contractors, and respond to emergencies up to $5,000 without prior owner approval.',
              snippet: 'The property owner has delegated comprehensive management authority to XYZ Management Services. The management company handles all maintenance scheduling, coordinates with vendors and contractors, responds to tenant requests, and manages emergency repairs. For routine matters under $5,000, the management company has full authorization to act without prior owner approval, streamlining operations and ensuring rapid response times.'
            }
          ]
        },
        {
          id: '5',
          value: 'HOA-managed community with common area maintenance funded through monthly assessments. Individual owners responsible only for unit interiors while HOA maintains all common elements and exterior building components.',
          description: 'Community association structure',
          confidence: 70,
          citation: 'CC&Rs Article 12',
          pdfReferences: [
            {
              page: 24,
              segment: 'HOA maintains all common elements',
              context: 'CC&Rs Article 12: The Homeowners Association maintains responsibility for all common elements as defined in the declaration, funded through regular assessments.',
              snippet: 'Under the governing CC&Rs Article 12, the Homeowners Association maintains comprehensive responsibility for all common area elements including building exteriors, roofs, parking areas, landscaping, pools, and recreational facilities. Individual unit owners pay monthly assessments to fund these maintenance activities and are responsible only for the interior of their units and any exclusive-use areas specifically assigned to them.'
            }
          ]
        }
      ]
    }
  };

  return suggestions[category] || {};
};

export function CategorySection({
  category,
  title,
  fields,
  formData,
  onFieldChange,
}: CategorySectionProps) {
  const [aiSuggestions, setAiSuggestions] = useState<FieldOptions>({});
  const [isAIFilled, setIsAIFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePopup, setActivePopup] = useState<{
    fieldId: string;
    position: { top: number; left: number };
  } | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [modalFieldId, setModalFieldId] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [popupOpacity, setPopupOpacity] = useState(1);
  const [showSnippet, setShowSnippet] = useState<{ optionId: string; snippet: string } | null>(null);
  const [expandedAlternative, setExpandedAlternative] = useState<string | null>(null);

  const handleUsePDFSuggestions = () => {
    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const suggestions = getPDFSuggestions(category);
      setAiSuggestions(suggestions);
      
      // Auto-fill with first option for each field
      Object.keys(suggestions).forEach(fieldId => {
        if (suggestions[fieldId] && suggestions[fieldId].length > 0) {
          onFieldChange(fieldId, suggestions[fieldId][0].value);
        }
      });
      
      setIsAIFilled(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleFieldValueClick = (e: React.MouseEvent, fieldId: string) => {
    if (!isAIFilled || !aiSuggestions[fieldId]) return;
    
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setActivePopup({
      fieldId,
      position: {
        top: rect.bottom + 8,
        left: rect.left
      }
    });
  };

  const handleOptionSelect = (fieldId: string, option: AIOption) => {
    // Find the index of the selected option in its respective field array
    const selectedFieldOptions = aiSuggestions[fieldId];
    const optionIndex = selectedFieldOptions?.findIndex(opt => opt.id === option.id) || 0;

    // Always cascade updates to all three fields based on the selected index
    if (category === 'maintenance') {
      // Update the field that was changed
      onFieldChange(fieldId, option.value);

      // Update responsible party if not the changed field
      if (fieldId !== 'responsibleParty' && 
          aiSuggestions.responsibleParty && 
          aiSuggestions.responsibleParty[optionIndex]) {
        const correspondingRP = aiSuggestions.responsibleParty[optionIndex];
        onFieldChange('responsibleParty', correspondingRP.value);
      }
      
      // Update maintenance owner responsibility if not the changed field
      if (fieldId !== 'maintenanceOwnerResponsibility' && 
          aiSuggestions.maintenanceOwnerResponsibility && 
          aiSuggestions.maintenanceOwnerResponsibility[optionIndex]) {
        const correspondingMOR = aiSuggestions.maintenanceOwnerResponsibility[optionIndex];
        onFieldChange('maintenanceOwnerResponsibility', correspondingMOR.value);
      }
      
      // Update maintenance reasoning if not the changed field
      if (fieldId !== 'maintenanceReasoning' && 
          aiSuggestions.maintenanceReasoning && 
          aiSuggestions.maintenanceReasoning[optionIndex]) {
        const correspondingMR = aiSuggestions.maintenanceReasoning[optionIndex];
        onFieldChange('maintenanceReasoning', correspondingMR.value);
      }
    } else {
      // For non-maintenance fields, just update that field
      onFieldChange(fieldId, option.value);
    }
    
    setActivePopup(null);
  };

  const handleShowMore = (fieldId: string) => {
    setModalFieldId(fieldId);
    setShowFullModal(true);
    setActivePopup(null);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activePopup) {
        setActivePopup(null);
      }
    };

    if (activePopup) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activePopup]);

  // Fade popup when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (activePopup) {
        // Start fading
        setPopupOpacity(0);
        // Close after fade animation completes
        setTimeout(() => {
          setActivePopup(null);
          setPopupOpacity(1);
        }, 300);
      }
    };

    if (activePopup) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [activePopup]);

  // Highlight relevant parts of text with different colors for different field types
  const highlightRelevantText = (
    text: string, 
    highlights: Array<{ value: string; color: string; fieldType: string }>,
    segment?: string
  ): React.ReactNode => {
    if (!text || highlights.length === 0) return text;
    
    // Build patterns for all highlights
    const highlightPatterns: Array<{ pattern: string; color: string; fieldType: string }> = [];
    
    highlights.forEach(({ value, color, fieldType }) => {
      if (!value || value.length < 2) return;
      
      // Extract key phrases from value (split by commas, "and", etc.)
      const valuePhrases = value
        .split(/[,;]| and | or /i)
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length > 2);
      
      // Add main value
      highlightPatterns.push({
        pattern: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        color,
        fieldType
      });
      
      // Add individual phrases
      valuePhrases.forEach(phrase => {
        if (phrase.length > 2 && phrase !== value) {
          highlightPatterns.push({
            pattern: phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            color,
            fieldType
          });
        }
      });
    });
    
    // Add segment if provided (use yellow for segment)
    if (segment && segment.length > 2) {
      highlightPatterns.push({
        pattern: segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        color: 'bg-[#FFB81C]',
        fieldType: 'segment'
      });
    }
    
    if (highlightPatterns.length === 0) return text;
    
    // Find all matches with their colors
    const matches: Array<{ index: number; length: number; text: string; color: string; fieldType: string }> = [];
    
    highlightPatterns.forEach(({ pattern, color, fieldType }) => {
      const regex = new RegExp(pattern, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[0],
          color,
          fieldType
        });
      }
    });
    
    // Sort matches by index and prioritize longer matches when overlapping
    matches.sort((a, b) => {
      if (a.index !== b.index) return a.index - b.index;
      return b.length - a.length; // Longer matches first
    });
    
    // Remove overlaps, keeping the first (longest) match
    const nonOverlappingMatches: Array<{ index: number; length: number; text: string; color: string; fieldType: string }> = [];
    matches.forEach(m => {
      const overlaps = nonOverlappingMatches.some(existing => 
        !(m.index >= existing.index + existing.length || m.index + m.length <= existing.index)
      );
      if (!overlaps) {
        nonOverlappingMatches.push(m);
      }
    });
    
    // Build parts array
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    nonOverlappingMatches.forEach((m, idx) => {
      // Add text before match
      if (m.index > lastIndex) {
        parts.push(text.substring(lastIndex, m.index));
      }
      
      // Add highlighted match with appropriate color
      parts.push(
        <mark key={`highlight-${idx}-${m.index}`} className={`${m.color} text-gray-900 font-semibold px-1 rounded`}>
          {m.text}
        </mark>
      );
      
      lastIndex = m.index + m.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  // Filter suggestions based on current field value
  // If field value matches any AI suggestion (or is empty), show top 3
  // If field has been manually modified (doesn't match any suggestion), filter suggestions based on typed text
  const getFilteredSuggestions = (fieldId: string) => {
    if (!aiSuggestions[fieldId]) return [];
    
    const currentValue = formData[fieldId] || '';
    
    // If field is empty, show all suggestions (will be limited to top 3 in render)
    if (!currentValue.trim()) {
      return aiSuggestions[fieldId];
    }
    
    // Check if current value matches any AI suggestion exactly
    const matchesAnySuggestion = aiSuggestions[fieldId].some(option => option.value === currentValue);
    
    // If it matches a suggestion, show all suggestions (will be limited to top 3 in render)
    if (matchesAnySuggestion) {
      return aiSuggestions[fieldId];
    }
    
    // Field has been manually modified - filter suggestions based on what user typed
    const searchTerm = currentValue.toLowerCase();
    return aiSuggestions[fieldId].filter(option => 
      option.value.toLowerCase().includes(searchTerm) ||
      option.description.toLowerCase().includes(searchTerm)
    );
  };

  const renderClickableField = (
    fieldId: string,
    label: string,
    placeholder: string,
    value: string,
    isTextarea: boolean = false
  ) => {
    const hasAISuggestions = isAIFilled && aiSuggestions[fieldId];

    return (
      <div id={`field-${fieldId}`} className="relative">
        <label className="block text-sm text-gray-700 mb-2">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={(el) => { fieldRefs.current[fieldId] = el; }}>
          {isTextarea ? (
            <textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              onClick={(e) => handleFieldValueClick(e, fieldId)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none transition-all cursor-pointer ${
                hasAISuggestions && value
                  ? 'border-[#DD0031] bg-red-50/30 hover:bg-red-50/50 focus:ring-[#DD0031]'
                  : 'border-gray-300 focus:ring-[#0047BB]'
              }`}
            />
          ) : (
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              onClick={(e) => handleFieldValueClick(e, fieldId)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                hasAISuggestions && value
                  ? 'border-[#DD0031] bg-red-50/30 hover:bg-red-50/50 focus:ring-[#DD0031]'
                  : 'border-gray-300 focus:ring-[#0047BB]'
              }`}
            />
          )}
          
          {/* AI Badge */}
          {hasAISuggestions && value && (
            <div className="absolute right-2 top-2">
              <div className="flex items-center gap-1 bg-[#DD0031] text-white text-xs px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </div>
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
            {renderClickableField(
              'agreementName',
              'Agreement name',
              'Agreement name',
              formData.agreementName
            )}
            {renderClickableField(
              'agreementDate',
              'Agreement date',
              'MM/DD/YYYY',
              formData.agreementDate
            )}
          </div>
          {renderClickableField(
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
      return (
        <div className="space-y-4">
          {renderClickableField(
            'responsibleParty',
            'Responsible party',
            'Responsible party',
            formData.responsibleParty || ''
          )}
          {renderClickableField(
            'maintenanceOwnerResponsibility',
            'Maintenance owner responsibility',
            'Maintenance owner responsibility',
            formData.maintenanceOwnerResponsibility || ''
          )}
          {renderClickableField(
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
          {renderClickableField(
            'billingContact',
            'Billing contact',
            'Billing contact',
            formData.billingContact,
            true
          )}
          {renderClickableField(
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
    <div className="border-b border-gray-200">
      <div className="px-6 py-6">
        {/* Category Header */}
        <div className="mb-4">
          <h2 className="text-gray-900 mb-4">{title}</h2>
          
          {/* AI Suggestions Button - Only show for maintenance category */}
          {category === 'maintenance' && !isAIFilled && (
            <button
              onClick={handleUsePDFSuggestions}
              disabled={isLoading}
              className="mb-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#A50026] to-[#DD0031] text-white rounded-lg hover:from-[#8B0020] hover:to-[#A50026] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Linked Documents...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Use AI suggestions from Linked Documents</span>
                </>
              )}
            </button>
          )}

          {/* AI Filled Indicator */}
          {category === 'maintenance' && isAIFilled && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">
                  Fields filled with AI suggestions. Click any field to see alternatives.
                </span>
              </div>
              <button
                onClick={() => {
                  setIsAIFilled(false);
                  setAiSuggestions({});
                  // Clear all fields
                  fields.forEach(field => {
                    onFieldChange(field.id, '');
                  });
                }}
                className="text-xs text-green-700 hover:text-green-900 underline"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Form Fields */}
        {renderFormFields()}
      </div>

      {/* Small Translucent Popup */}
      {activePopup && aiSuggestions[activePopup.fieldId] && (
        <>
          {/* Backdrop to close popup */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActivePopup(null)}
          />
          
          {/* Popup */}
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-md border border-[#DD0031] rounded-lg shadow-2xl p-4 w-96 transition-opacity duration-300"
            style={{
              top: `${activePopup.position.top + 8}px`,
              left: `${activePopup.position.left}px`,
              opacity: popupOpacity
            }}
          >
            <div className="text-xs text-gray-600 mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#DD0031]" />
              <span>
                {(() => {
                  const currentValue = formData[activePopup.fieldId] || '';
                  const suggestions = aiSuggestions[activePopup.fieldId] || [];
                  const matchesAnySuggestion = currentValue.trim() && suggestions.some(opt => opt.value === currentValue);
                  return matchesAnySuggestion ? 'Top alternatives from Linked Documents' : 'Relevant suggestions based on your input';
                })()}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              {(() => {
                const filtered = getFilteredSuggestions(activePopup.fieldId);
                // Always show top 3 suggestions
                const suggestionsToShow = filtered.slice(0, 3);
                return suggestionsToShow.map((option) => (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => handleOptionSelect(activePopup.fieldId, option)}
                    className={`w-full text-left p-3 rounded-lg border border-gray-200 hover:border-[#DD0031] hover:bg-red-50/50 transition-all group ${
                      expandedAlternative === option.id ? 'pr-12' : ''
                    }`}
                  >
                    <div className={expandedAlternative === option.id ? 'text-sm text-gray-900' : 'text-sm text-gray-900 line-clamp-2'}>
                      {option.value}
                    </div>
                    <div className={expandedAlternative === option.id ? 'text-xs text-gray-500 mt-1' : 'text-xs text-gray-500 line-clamp-1 mt-1'}>
                      {option.description}
                    </div>
                  </button>
                  
                  {/* Expand Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedAlternative(expandedAlternative === option.id ? null : option.id);
                    }}
                    className="absolute right-3 top-3 p-1 bg-white hover:bg-[#0047BB] text-gray-600 hover:text-white border border-gray-300 hover:border-[#0047BB] rounded transition-all"
                    title={expandedAlternative === option.id ? "Collapse" : "Expand"}
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
                ));
              })()}
            </div>
            
            {(() => {
              const filtered = getFilteredSuggestions(activePopup.fieldId);
              // Show "Show more" button when there are more than 3 suggestions available
              if (filtered.length <= 3) return null;
              
              return (
                <button
                  onClick={() => handleShowMore(activePopup.fieldId)}
                  className="w-full text-center text-sm text-[#0047BB] hover:text-[#003399] font-medium py-2 border-t border-gray-200 flex items-center justify-center gap-1"
                >
                  <span>Show more options</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              );
            })()}
          </div>
        </>
      )}

      {/* Full Modal for All Options */}
      {showFullModal && modalFieldId && aiSuggestions[modalFieldId] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowFullModal(false);
              setShowSnippet(null);
            }}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#DD0031]/5 to-[#0047BB]/5">
              <div>
                <h3 className="text-gray-900 mb-1">All Available Options</h3>
                <p className="text-sm text-gray-600">
                  {fields.find(f => f.id === modalFieldId)?.label}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFullModal(false);
                  setShowSnippet(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {aiSuggestions[modalFieldId].map((option, index) => (
                  <div
                    key={option.id}
                    className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#DD0031] hover:shadow-lg transition-all"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-red-50/30"
                      onClick={() => {
                        handleOptionSelect(modalFieldId, option);
                        setShowFullModal(false);
                        setShowSnippet(null);
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DD0031] to-[#A50026] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 mb-2">
                              {option.value}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              {option.description}
                            </div>
                            
                            {/* Citation and Page */}
                            {option.pdfReferences && option.pdfReferences.length > 0 && (
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 text-[#0047BB]">
                                  <FileText className="w-3 h-3" />
                                  <span>Page {option.pdfReferences[0].page}</span>
                                </div>
                                {option.citation && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <span>•</span>
                                    <span className="italic">{option.citation}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* PDF Reference Context */}
                      {option.pdfReferences && option.pdfReferences.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <span>Reference Context:</span>
                          </div>
                          <div className="bg-amber-50 border-l-4 border-[#FFB81C] rounded p-3 text-xs text-gray-700">
                            {option.pdfReferences[0].context}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* View Document Snippet Button */}
                    {option.pdfReferences && option.pdfReferences.length > 0 && option.pdfReferences[0].snippet && (
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSnippet({
                              optionId: option.id,
                              snippet: option.pdfReferences![0].snippet
                            });
                          }}
                          className="text-xs text-[#0047BB] hover:text-[#003399] flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View document snippet</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}</div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end bg-gray-50">
              <button
                onClick={() => {
                  setShowFullModal(false);
                  setShowSnippet(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Snippet Modal */}
      {showSnippet && (() => {
        const currentOption = modalFieldId 
          ? aiSuggestions[modalFieldId]?.find(opt => opt.id === showSnippet.optionId)
          : undefined;
        const pdfRef = currentOption?.pdfReferences?.[0];
        
        if (!currentOption || !pdfRef) return null;
        
        // Get all related field values for highlighting
        const highlights: Array<{ value: string; color: string; fieldType: string }> = [];
        
        if (category === 'maintenance') {
          // Get the index of the current option to find corresponding options in other fields
          const currentFieldOptions = modalFieldId ? aiSuggestions[modalFieldId] : [];
          const currentOptionIndex = currentFieldOptions?.findIndex(opt => opt.id === showSnippet.optionId) ?? -1;
          
          // Responsible Party - Cyan
          // Use formData first, then corresponding AI suggestion, then current option if it's for this field
          const responsiblePartyValue = formData.responsibleParty || 
            (currentOptionIndex >= 0 && aiSuggestions.responsibleParty?.[currentOptionIndex]?.value) ||
            (modalFieldId === 'responsibleParty' ? currentOption.value : '');
          if (responsiblePartyValue) {
            highlights.push({
              value: responsiblePartyValue,
              color: 'bg-cyan-300',
              fieldType: 'responsibleParty'
            });
          }
          
          // Owner Responsibility - Light Green
          const ownerResponsibilityValue = formData.maintenanceOwnerResponsibility || 
            (currentOptionIndex >= 0 && aiSuggestions.maintenanceOwnerResponsibility?.[currentOptionIndex]?.value) ||
            (modalFieldId === 'maintenanceOwnerResponsibility' ? currentOption.value : '');
          if (ownerResponsibilityValue) {
            highlights.push({
              value: ownerResponsibilityValue,
              color: 'bg-green-300',
              fieldType: 'maintenanceOwnerResponsibility'
            });
          }
          
          // Reasoning - Light Orange
          const reasoningValue = formData.maintenanceReasoning || 
            (currentOptionIndex >= 0 && aiSuggestions.maintenanceReasoning?.[currentOptionIndex]?.value) ||
            (modalFieldId === 'maintenanceReasoning' ? currentOption.value : '');
          if (reasoningValue) {
            highlights.push({
              value: reasoningValue,
              color: 'bg-orange-300',
              fieldType: 'maintenanceReasoning'
            });
          }
        } else {
          // For other categories, use yellow for the current field
          highlights.push({
            value: currentOption.value,
            color: 'bg-[#FFB81C]',
            fieldType: modalFieldId || 'default'
          });
        }
        
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSnippet(null)}
            />
            
            {/* Snippet Content */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Snippet Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FFB81C]/10 to-[#0047BB]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0047BB]" />
                    <div>
                      <h3 className="text-gray-900">Document Snippet</h3>
                      <p className="text-xs text-gray-600">Page {pdfRef.page} • {currentOption.citation || 'Source Document'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSnippet(null)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs mt-2 flex-wrap">
                  {category === 'maintenance' ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <mark className="bg-cyan-300 text-gray-900 font-semibold px-1.5 py-0.5 rounded">Responsible Party</mark>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <mark className="bg-green-300 text-gray-900 font-semibold px-1.5 py-0.5 rounded">Owner Responsibility</mark>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <mark className="bg-orange-300 text-gray-900 font-semibold px-1.5 py-0.5 rounded">Reasoning</mark>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <mark className="bg-[#FFB81C] text-gray-900 font-semibold px-1.5 py-0.5 rounded">Highlighted</mark>
                      <span className="text-gray-600">= Data extracted for this field</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Snippet Body - PDF Snapshot */}
              <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-100">
                {/* PDF Page Container */}
                <div className="bg-white shadow-2xl mx-auto" style={{ width: '8.5in', maxWidth: '100%', minHeight: '11in' }}>
                  {/* PDF Header */}
                  <div className="border-b-2 border-gray-300 px-12 pt-8 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-gray-500 font-semibold">COMMERCIAL LEASE AGREEMENT</div>
                      <div className="text-xs text-gray-500">Page {pdfRef.page}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Confidential - Property Management Document</div>
                  </div>
                  
                  {/* PDF Body Content */}
                  <div className="px-12 py-6">
                    {/* Section Header */}
                    {pdfRef.segment && (
                      <div className="mb-4">
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {pdfRef.segment}
                        </div>
                        {currentOption.citation && (
                          <div className="text-xs text-gray-500 italic mb-3">
                            {currentOption.citation}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Main Content - Highlighted */}
                    <div className="text-sm text-gray-800 leading-relaxed mb-6">
                      {/* Context before snippet */}
                      <div className="text-gray-600 mb-3">
                        {pdfRef.context && !pdfRef.context.includes(pdfRef.snippet) && (
                          <p className="mb-2">
                            {highlightRelevantText(
                              pdfRef.context.split(pdfRef.snippet)[0],
                              highlights,
                              pdfRef.segment
                            )}
                          </p>
                        )}
                      </div>
                      
                      {/* Highlighted snippet */}
                      <div className="bg-yellow-200 border-l-4 border-yellow-500 pl-4 py-3 my-4 rounded-r">
                        <p className="font-medium text-gray-900">
                          {highlightRelevantText(
                            showSnippet.snippet,
                            highlights,
                            pdfRef.segment
                          )}
                        </p>
                      </div>
                      
                      {/* Context after snippet */}
                      <div className="text-gray-600 mt-3">
                        {pdfRef.context && !pdfRef.context.includes(pdfRef.snippet) && (
                          <p>
                            {highlightRelevantText(
                              pdfRef.context.split(pdfRef.snippet)[1],
                              highlights,
                              pdfRef.segment
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Additional context paragraphs */}
                    <div className="text-sm text-gray-700 leading-relaxed space-y-3 mt-6">
                      <p>
                        This section outlines the specific responsibilities and obligations of the parties involved 
                        in the lease agreement. All terms are subject to the conditions specified in the master 
                        lease document and any applicable addendums.
                      </p>
                      <p>
                        For questions regarding these provisions, please refer to the complete lease agreement 
                        or contact the property management office. Modifications to these terms require written 
                        consent from all parties.
                      </p>
                    </div>
                  </div>
                  
                  {/* PDF Footer */}
                  <div className="border-t-2 border-gray-300 px-12 py-4 mt-auto">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>© {new Date().getFullYear()} Property Management Services</div>
                      <div>Document ID: LEASE-{pdfRef.page}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Snippet Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-xs text-gray-500">
                  This is a visual representation of the relevant section from the source document.
                </p>
                <button
                  onClick={() => setShowSnippet(null)}
                  className="px-4 py-2 bg-[#0047BB] text-white rounded-lg hover:bg-[#003399] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}