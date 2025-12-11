import React, { useState, useEffect } from 'react';
import { Search, X, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { FormField } from '../App';

interface CategorySectionProps {
  category: string;
  title: string;
  fields: FormField[];
  formData: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
}

interface AIResponse {
  id: string;
  title: string;
  summary: string;
  fullDetails: string;
  fieldMappings: Record<string, string>; // Maps field IDs to their values
  previewSections?: string[]; // Sections where this applies
}

// Mock AI responses based on search query
const getAIResponses = (query: string, category: string): AIResponse[] => {
  if (!query.trim()) return [];

  const responses: Record<string, AIResponse[]> = {
    identification: [
      {
        id: '1',
        title: 'Commercial Lease Agreement - Retail Property',
        summary: 'Standard commercial lease agreement for retail space with quarterly review clauses',
        fullDetails: `Commercial Lease Agreement - Retail Property

This comprehensive lease agreement is designed for commercial property use, specifically tailored for retail spaces. It includes terms for retail operations, office use, and adaptable clauses for various commercial purposes.

Key Features:
• Quarterly review clauses for flexible management
• Annual renewal options with 90-day notice requirement
• Standard commercial property allocation per state law
• Comprehensive maintenance responsibility definitions
• Clear dispute resolution procedures

Term Details:
• Start Date: January 15, 2025
• End Date: December 31, 2025
• Full calendar year coverage
• Automatic renewal option available

Additional Notes:
Agreement includes quarterly review clauses and annual renewal options. Both parties agree to meet quarterly to review terms and conditions. Renewal must be initiated 90 days before expiration.`,
        fieldMappings: {
          agreementName: 'Commercial Lease Agreement',
          agreementDate: '01/15/2025 - 12/31/2025',
          notes: 'Agreement includes quarterly review clauses and annual renewal options. Both parties agree to meet quarterly to review terms and conditions. Renewal must be initiated 90 days before expiration.',
        },
        previewSections: ['Identification', 'Maintenance'],
      },
      {
        id: '2',
        title: 'Property Management Services Agreement',
        summary: 'Comprehensive property management agreement with force majeure provisions',
        fullDetails: `Property Management Services Agreement

This agreement outlines the comprehensive scope of property management services, responsibilities, compensation structure, and special provisions for unforeseen circumstances.

Scope of Services:
• Complete property management and oversight
• Tenant relations and lease administration
• Maintenance coordination and vendor management
• Financial reporting and rent collection
• Emergency response and crisis management

Special Provisions:
• Force majeure clause for natural disasters
• Pandemic-related modifications and adaptations
• Government mandate compliance procedures
• Business continuity planning requirements

Term & Compensation:
• Service Period: 12/11/2025 - 12/11/2026
• One-year agreement with automatic renewal option
• Performance-based compensation structure
• Quarterly review and adjustment periods

Risk Management:
Special provisions for force majeure and pandemic-related modifications. Agreement includes provisions for unforeseen circumstances including natural disasters, pandemics, and government-mandated closures.`,
        fieldMappings: {
          agreementName: 'Property Management Services Agreement',
          agreementDate: '12/11/2025 - 12/11/2026',
          notes: 'Special provisions for force majeure and pandemic-related modifications. Agreement includes provisions for unforeseen circumstances including natural disasters, pandemics, and government-mandated closures.',
        },
        previewSections: ['Identification'],
      },
      {
        id: '3',
        title: 'Tenant Service Agreement with CPI Escalation',
        summary: '18-month tenant agreement with automatic rent escalation tied to CPI',
        fullDetails: `Tenant Service Agreement with CPI Escalation

This agreement defines the relationship and service expectations between property owner and tenant, with built-in escalation mechanisms tied to economic indicators.

Agreement Duration:
• Start: January 1, 2025
• End: June 30, 2026
• 18-month comprehensive coverage
• Covers fiscal years 2025-2026

CPI Escalation Clause:
• Annual rent increases calculated based on Consumer Price Index
• Minimum adjustment: 2% per year
• Maximum adjustment: 5% per year
• Annual reconciliation and notification process

Service Expectations:
• Clearly defined tenant responsibilities
• Property owner service commitments
• Response time requirements for maintenance
• Communication protocols and procedures

Financial Terms:
Automatic escalation clause tied to CPI adjustments. Annual rent increases will be calculated based on the Consumer Price Index with a minimum of 2% and maximum of 5% adjustment per year.`,
        fieldMappings: {
          agreementName: 'Tenant Service Agreement',
          agreementDate: '01/01/2025 - 06/30/2026',
          notes: 'Automatic escalation clause tied to CPI adjustments. Annual rent increases will be calculated based on the Consumer Price Index with a minimum of 2% and maximum of 5% adjustment per year.',
        },
        previewSections: ['Identification', 'Billing'],
      },
    ],
    maintenance: [
      {
        id: '1',
        title: 'Owner Responsibility - Structural & Systems',
        summary: 'Property owner responsible for all structural repairs and major building systems',
        fullDetails: `Owner Responsibility - Structural & Systems

Complete breakdown of property owner maintenance responsibilities focusing on structural integrity and major building systems.

Owner's Primary Responsibilities:
• Structural repairs including foundation work
• Load-bearing walls and structural elements
• Complete roof maintenance and replacement
• All HVAC systems servicing and repair
• Major plumbing infrastructure beyond unit connections
• Electrical systems and main panels
• Building envelope and weatherproofing

Maintenance Standards:
Standard commercial property allocation per state law requirements. Owner retains responsibility for major systems and structural elements while tenant handles day-to-day maintenance.

Response Requirements:
• Emergency repairs: Within 24 hours
• Critical systems: Within 48 hours
• Routine maintenance: Scheduled quarterly
• Annual inspections required for all major systems

Cost Allocation:
Owner covers all costs for structural and major system repairs. Clear delineation from tenant responsibilities to avoid disputes.`,
        fieldMappings: {
          responsibleParty: 'Property Owner',
          maintenanceOwnerResponsibility: 'Structural repairs, roof maintenance, HVAC systems, and major plumbing',
          maintenanceReasoning: 'Standard commercial property allocation per state law. Owner retains responsibility for major systems and structural elements while tenant handles day-to-day maintenance.',
        },
        previewSections: ['Maintenance'],
      },
      {
        id: '2',
        title: 'Triple Net (NNN) Lease Structure',
        summary: 'Tenant assumes responsibility for most operational costs in NNN lease arrangement',
        fullDetails: `Triple Net (NNN) Lease Structure

This agreement follows a triple net lease structure where the tenant assumes comprehensive responsibility for property taxes, insurance, and maintenance costs in addition to base rent.

Tenant Responsibilities:
• Property taxes (pro-rated share)
• Property insurance premiums
• All routine maintenance and repairs
• Minor repairs under $500
• Interior upkeep and cleaning
• Utilities and operational costs
• Landscaping and grounds keeping

Owner Responsibilities (Limited):
• Structural integrity only
• Major capital improvements
• Building code compliance for structure
• Roof replacement (when necessary)

Financial Implications:
This agreement follows a triple net (NNN) lease structure where tenant assumes responsibility for property taxes, insurance, and maintenance costs in addition to base rent. Owner maintains structural integrity only.

Maintenance Thresholds:
• Tenant handles: All items under $2,500
• Owner handles: Major repairs over $2,500
• Emergency repairs: Immediate action, cost allocation determined later`,
        fieldMappings: {
          responsibleParty: 'Tenant',
          maintenanceOwnerResponsibility: 'Structural integrity and major capital improvements only',
          maintenanceReasoning: 'Triple net lease structure - tenant responsible for most operational costs. This agreement follows a triple net (NNN) lease structure where tenant assumes responsibility for property taxes, insurance, and maintenance costs in addition to base rent. Owner maintains structural integrity only.',
        },
        previewSections: ['Maintenance', 'Billing'],
      },
      {
        id: '3',
        title: 'Shared Responsibility - Modified Gross Lease',
        summary: 'Balanced maintenance split with negotiated cost thresholds',
        fullDetails: `Shared Responsibility - Modified Gross Lease

Modified gross lease structure with carefully negotiated maintenance responsibilities providing balanced cost allocation between owner and tenant.

Cost Threshold Structure:
• Owner: Major repairs over $2,500
• Tenant: Minor repairs under $2,500
• Shared: Items between $1,000-$2,500 (50/50 split)

Owner's Responsibilities:
• Structural elements and building envelope
• Building systems (HVAC, electrical, plumbing mains)
• Roof and foundation
• Parking lot repaving and major repairs
• Life safety systems and code compliance

Tenant's Responsibilities:
• Routine maintenance and cleaning
• Interior upkeep and cosmetic repairs
• Minor plumbing and electrical within unit
• HVAC filter changes and basic maintenance
• Landscaping and snow removal

Reasoning & Legal Basis:
Modified gross lease structure with negotiated maintenance responsibilities. Owner covers major repairs over $2,500, structural elements, and building systems. Tenant handles routine maintenance, minor repairs, and interior upkeep.

Maintenance Schedule:
• Quarterly joint inspections
• Annual system reviews
• Preventive maintenance program
• 24/7 emergency contact system`,
        fieldMappings: {
          responsibleParty: 'Shared Responsibility',
          maintenanceOwnerResponsibility: 'Building systems, life safety equipment, and code compliance. Structural elements and major repairs over $2,500.',
          maintenanceReasoning: 'Modified gross lease structure with negotiated maintenance responsibilities. Owner covers major repairs over $2,500, structural elements, and building systems. Tenant handles routine maintenance, minor repairs, and interior upkeep.',
        },
        previewSections: ['Maintenance'],
      },
    ],
    billing: [
      {
        id: '1',
        title: 'Monthly ACH Payment - Standard Terms',
        summary: 'Monthly rent of $5,000 via ACH with 3% annual increase',
        fullDetails: `Monthly ACH Payment - Standard Terms

Comprehensive billing agreement for monthly rent payment via ACH transfer with built-in escalation and late payment provisions.

Base Rent Structure:
• Monthly rent: $5,000
• Payment method: ACH transfer to account ending in 1234
• Due date: 1st of each month
• Grace period: 5 days
• Annual increase: 3% beginning year 2

Late Payment Provisions:
• Late fee: $100 or 5% of rent (whichever is greater)
• Applied after 5-day grace period
• Additional interest: 1.5% per month on overdue amounts
• Three late payments may constitute default

Billing Contact:
Accounts Payable Department
Email: finance@company.com
Phone: (555) 123-4567
Address: 123 Business Park Dr, Suite 200, City, ST 12345

Payment Processing:
• ACH transfers processed within 1-2 business days
• Confirmation sent via email upon receipt
• Monthly statements provided on the 25th of prior month
• Annual reconciliation in January

Terms & Conditions:
Billing inquiries should be directed to the AP department between 9 AM - 5 PM EST. All payment disputes must be raised within 10 days of statement date.`,
        fieldMappings: {
          billingContact: 'Accounts Payable Department\nfinance@company.com\n(555) 123-4567',
          billingAgreement: 'Monthly rent of $5,000 due on the 1st of each month via ACH transfer. Late fee: $100 or 5% of rent (whichever is greater) after 5-day grace period. Annual increase: 3% beginning year 2.',
        },
        previewSections: ['Billing'],
      },
      {
        id: '2',
        title: 'Quarterly Billing with Early Payment Discount',
        summary: 'Net 30 quarterly billing with 2% discount for early payment',
        fullDetails: `Quarterly Billing with Early Payment Discount

Flexible quarterly billing arrangement with incentives for early payment and multiple accepted payment methods.

Billing Cycle & Terms:
• Billing frequency: Quarterly (January, April, July, October)
• Invoice delivery: Electronic via email 15 days before due date
• Payment terms: Net 30 days from invoice date
• Early payment discount: 2% if paid within 10 days
• Late payment penalty: 1.5% per month after due date

Accepted Payment Methods:
• Check (payable to property management company)
• Wire transfer (details provided on invoice)
• ACH transfer (preferred method)
• Credit card (2.5% processing fee applies)

Billing Contact Information:
John Smith, Controller
Email: jsmith@company.com
Direct: (555) 987-6543
Mobile: (555) 987-6544
Backup Contact: Jane Doe, Accounting Manager (jdoe@company.com)

Invoice Details:
Each quarterly invoice will include:
• Base rent for the quarter
• Any applicable common area maintenance charges
• Utility reconciliation (if applicable)
• Previous balance (if any)
• Itemized breakdown of all charges

Early Payment Incentive:
Take advantage of the 2% early payment discount by paying within 10 days of invoice date. This can result in significant annual savings.`,
        fieldMappings: {
          billingContact: 'John Smith, Controller\njsmith@company.com\n(555) 987-6543',
          billingAgreement: 'Quarterly billing cycle with 30-day payment terms. Invoice delivery: Electronic via email 15 days before due date. Accepted methods: Check, wire transfer, ACH. Early payment discount: 2% if paid within 10 days.',
        },
        previewSections: ['Billing'],
      },
      {
        id: '3',
        title: 'Triple Net Billing with Annual Reconciliation',
        summary: 'Base rent plus operating expenses with annual true-up',
        fullDetails: `Triple Net Billing with Annual Reconciliation

Comprehensive billing structure including base rent, estimated operating expenses, and annual reconciliation process.

Monthly Billing Breakdown:
• Base rent: $4,500/month
• Operating expenses: Estimated $800/month (reconciled annually)
• Property taxes: $300/month (pro-rated share)
• Insurance: $200/month
• Total estimated monthly payment: $5,800

Annual Reconciliation Process:
• Conducted in January of each year
• Actual expenses compared to estimates
• True-up payment or credit issued within 30 days
• Detailed expense report provided
• Adjustments made to following year's estimates

Expense Categories Included:
• Common area maintenance (CAM)
• Property management fees
• Landscaping and grounds maintenance
• Snow removal and parking lot maintenance
• Building insurance premiums
• Property tax assessments
• Shared utility costs

Billing Contact & Portal:
Property Management Office
Email: billing@propmgmt.com
Phone: (555) 456-7890
Fax: (555) 456-7891
Online Portal: www.propmgmt.com/billing

Payment Terms:
• Due date: 1st of each month
• Payment terms: Net 30 days from invoice date
• Late fee: 5% of amount due
• Online payment portal available 24/7

Transparency Commitment:
All operating expenses are fully transparent with supporting documentation available upon request. Annual reconciliation ensures fair and accurate cost allocation.`,
        fieldMappings: {
          billingContact: 'Property Management Office\nbilling@propmgmt.com\n(555) 456-7890',
          billingAgreement: 'Base rent: $4,500/month. Operating expenses: $800/month (reconciled annually). Property taxes: $300/month. Insurance: $200/month. Total monthly: $5,800. Annual reconciliation in January with true-up payment or credit.',
        },
        previewSections: ['Billing', 'Maintenance'],
      },
    ],
  };

  const categoryResponses = responses[category] || [];
  const searchLower = query.toLowerCase();

  return categoryResponses.filter(
    (response) =>
      response.title.toLowerCase().includes(searchLower) ||
      response.summary.toLowerCase().includes(searchLower) ||
      response.fullDetails.toLowerCase().includes(searchLower)
  );
};

export function CategorySection({
  category,
  title,
  fields,
  formData,
  onFieldChange,
}: CategorySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<AIResponse | null>(null);
  const [appliedResponseId, setAppliedResponseId] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        const results = getAIResponses(searchQuery, category);
        setAiResponses(results);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAiResponses([]);
    }
  }, [searchQuery, category]);

  const handleCardClick = (response: AIResponse) => {
    setSelectedResponse(response);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResponse(null);
  };

  const handleApplyResponse = (response: AIResponse) => {
    // Apply all field mappings from the response
    Object.entries(response.fieldMappings).forEach(([fieldId, value]) => {
      onFieldChange(fieldId, value);
    });
    
    setAppliedResponseId(response.id);
    setShowModal(false);
  };

  const handlePreviewField = (fieldId: string) => {
    // Scroll to the specific field
    const element = document.getElementById(`field-${fieldId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-blue-400');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-400');
      }, 2000);
    }
  };

  const renderFormFields = () => {
    if (category === 'identification') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div id="field-agreementName">
              <label className="block text-sm text-gray-700 mb-2">
                Agreement name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Agreement name"
                  value={formData.agreementName}
                  onChange={(e) => onFieldChange('agreementName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {formData.agreementName && appliedResponseId && (
                  <button
                    onClick={() => handlePreviewField('agreementName')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Preview this field"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div id="field-agreementDate">
              <label className="block text-sm text-gray-700 mb-2">
                Agreement date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={formData.agreementDate}
                  onChange={(e) => onFieldChange('agreementDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {formData.agreementDate && appliedResponseId && (
                  <button
                    onClick={() => handlePreviewField('agreementDate')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Preview this field"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div id="field-notes">
            <label className="block text-sm text-gray-700 mb-2">Notes</label>
            <div className="relative">
              <textarea
                placeholder="Enter any additional notes about this agreement"
                value={formData.notes}
                onChange={(e) => onFieldChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              />
              {formData.notes && appliedResponseId && (
                <button
                  onClick={() => handlePreviewField('notes')}
                  className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Preview this field"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </>
      );
    }

    if (category === 'maintenance') {
      return (
        <div className="space-y-4">
          <div id="field-responsibleParty">
            <label className="block text-sm text-gray-700 mb-2">
              Responsible party <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Responsible party"
                value={formData.responsibleParty || ''}
                onChange={(e) => onFieldChange('responsibleParty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {formData.responsibleParty && appliedResponseId && (
                <button
                  onClick={() => handlePreviewField('responsibleParty')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Preview this field"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div id="field-maintenanceOwnerResponsibility">
            <label className="block text-sm text-gray-700 mb-2">
              Maintenance owner responsibility <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Maintenance owner responsibility"
                value={formData.maintenanceOwnerResponsibility || ''}
                onChange={(e) => onFieldChange('maintenanceOwnerResponsibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {formData.maintenanceOwnerResponsibility && appliedResponseId && (
                <button
                  onClick={() => handlePreviewField('maintenanceOwnerResponsibility')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Preview this field"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div id="field-maintenanceReasoning">
            <label className="block text-sm text-gray-700 mb-2">
              Maintenance reasoning <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Maintenance reasoning"
                value={formData.maintenanceReasoning || ''}
                onChange={(e) => onFieldChange('maintenanceReasoning', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {formData.maintenanceReasoning && appliedResponseId && (
                <button
                  onClick={() => handlePreviewField('maintenanceReasoning')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Preview this field"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (category === 'billing') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div id="field-billingContact">
            <label className="block text-sm text-gray-700 mb-2">
              Billing contact <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Billing contact"
                value={formData.billingContact}
                onChange={(e) => onFieldChange('billingContact', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              />
              {formData.billingContact && appliedResponseId && (
                <button
                  onClick={() => handlePreviewField('billingContact')}
                  className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Preview this field"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div id="field-billingAgreement">
            <label className="block text-sm text-gray-700 mb-2">
              Billing agreement <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Billing agreement"
                value={formData.billingAgreement}
                onChange={(e) => onFieldChange('billingAgreement', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              />
              {formData.billingAgreement && appliedResponseId && (
                <button
                  onClick={() => handlePreviewField('billingAgreement')}
                  className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Preview this field"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
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
          
          {/* AI Search Bar - Only show for maintenance category */}
          {category === 'maintenance' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search AI suggestions for this section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* AI Response Cards - Only show for maintenance category */}
        {category === 'maintenance' && aiResponses.length > 0 && (
          <div className="mb-6 space-y-3 max-h-96 overflow-y-auto">
            {aiResponses.map((response) => (
              <div
                key={response.id}
                className="border border-gray-200 rounded-lg bg-white hover:border-purple-300 transition-all"
              >
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-gray-900 mb-1">{response.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{response.summary}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Preview Button */}
                    <div className="relative group">
                      <button
                        onClick={() => handleCardClick(response)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View full details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {response.previewSections && response.previewSections.length > 1 && (
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                            Applies to: {response.previewSections.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Apply Button */}
                    <button
                      onClick={() => handleApplyResponse(response)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Apply to form"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Fields */}
        {renderFormFields()}
      </div>

      {/* Modal for Full Details */}
      {showModal && selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-gray-900">{selectedResponse.title}</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {selectedResponse.fullDetails}
                </pre>
              </div>
              
              {/* Preview Sections */}
              {selectedResponse.previewSections && selectedResponse.previewSections.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">This applies to sections:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedResponse.previewSections.map((section) => (
                      <span
                        key={section}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleApplyResponse(selectedResponse)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply to Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}