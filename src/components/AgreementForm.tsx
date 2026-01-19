import { CategorySection } from './CategorySection';

interface Document {
  id: string;
  name: string;
}

interface PDFReference {
  page: number;
  segment: string;
  context?: string;
  fullText?: string;
}

interface Snippet {
  id: string;
  title: string;
  pdfReference: PDFReference;
  fieldMappings: Record<string, string>;
  matchedFields: string[];
  confidenceScore?: number;
  status?: 'normal' | 'updated' | 'deleted';
  documentId?: string;
}

interface AgreementFormProps {
  formData: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  aiMode?: boolean;
  ghostValues?: Record<string, string>;
  onAcceptGhost?: (fieldId: string) => void;
  onFieldSearch?: (fieldId: string, value: string) => void;
  onToggleAiMode?: (enabled: boolean) => void;
  isAnalyzing?: boolean;
  snippetsCount?: number;
  snippets?: Snippet[];
  onApplySnippet?: (snippet: Snippet, keepSnippetsVisible?: boolean) => void;
  onSaveDraft?: () => void;
  onFinish?: () => void;
  onApproveAIChanges?: () => void;
  isAIApproved?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
  documents?: Document[];
  checkedDocuments?: string[];
  onDocumentCheckChange?: (documentId: string, checked: boolean) => void;
  hasAIGeneratedFields?: Record<string, boolean>;
  reviewReason?: string;
}

export function AgreementForm({ 
  formData, 
  onFieldChange, 
  aiMode = false, 
  ghostValues = {},
  onAcceptGhost,
  onFieldSearch,
  onToggleAiMode,
  isAnalyzing = false,
  snippetsCount = 0,
  snippets = [],
  onApplySnippet,
  onSaveDraft,
  onFinish,
  isAIApproved = false,
  isEditing = false,
  onCancel,
  documents = [],
  checkedDocuments = [],
  onDocumentCheckChange,
  hasAIGeneratedFields = {},
  reviewReason,
}: AgreementFormProps) {
  // Determine if Finish button should be enabled
  // Finish is always enabled now (no ghost values or approval needed)
  const isFinishEnabled = true;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Review Reason Popup */}
      {reviewReason && (
        <div className="bg-red-50 border-l-4 border-red-300 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Needs Review</h3>
              <p className="text-sm text-red-800">{reviewReason}</p>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="font-bold">{isEditing ? 'Edit agreement' : 'Add agreement'}</h1>
      </div>

      <div className="p-6">
        {/* Identification Section */}
        <CategorySection
          category="identification"
          title="Identification"
          fields={[
            { id: 'agreementName', label: 'Agreement Name', value: formData.agreementName, category: 'identification' },
            { id: 'agreementDate', label: 'Agreement Dates', value: formData.agreementDate, category: 'identification' },
            { id: 'notes', label: 'Notes', value: formData.notes, category: 'identification' },
          ]}
          formData={formData}
          onFieldChange={onFieldChange}
          isAIApproved={isAIApproved}
          hasAIGeneratedFields={hasAIGeneratedFields}
        />

        {/* Maintenance Section */}
        <CategorySection
          category="maintenance"
          title="Maintenance"
          fields={[
            { id: 'responsibleParty', label: 'Maintenance Party', value: formData.responsibleParty, category: 'maintenance' },
            { id: 'maintenanceOwnerResponsibility', label: 'Maintenance Owner Responsibility', value: formData.maintenanceOwnerResponsibility, category: 'maintenance' },
            { id: 'maintenanceReasoning', label: 'Legal Notes', value: formData.maintenanceReasoning, category: 'maintenance' },
          ]}
          formData={formData}
          onFieldChange={onFieldChange}
          aiMode={aiMode}
          ghostValues={ghostValues}
          onAcceptGhost={onAcceptGhost}
          onFieldSearch={onFieldSearch}
          onToggleAiMode={onToggleAiMode}
          isAnalyzing={isAnalyzing}
          snippetsCount={snippetsCount}
          snippets={snippets}
          onApplySnippet={onApplySnippet}
          isAIApproved={isAIApproved}
          hasAIGeneratedFields={hasAIGeneratedFields}
        />
      </div>

      {/* Documents List with Checkboxes - Always visible when documents exist */}
      {documents.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4" data-tutorial="documents">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Uploaded Documents {aiMode && <span className="text-xs text-gray-500 font-normal">(Select documents to filter AI snippets)</span>}
          </h3>
          <div className="flex flex-wrap gap-3">
            {documents.map((doc) => (
              <label
                key={doc.id}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  checkedDocuments.includes(doc.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedDocuments.includes(doc.id)}
                  onChange={(e) => {
                    if (onDocumentCheckChange) {
                      onDocumentCheckChange(doc.id, e.target.checked);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 truncate max-w-[200px]" title={doc.name}>
                  {doc.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {onSaveDraft && (
            <button 
              onClick={onSaveDraft}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md border border-gray-300"
            >
              Save as Draft
            </button>
          )}
          <button 
            onClick={onFinish}
            disabled={!isFinishEnabled}
            className={`px-6 py-2 rounded-md transition-colors ${
              isFinishEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={!isFinishEnabled ? 'Please accept the AI suggestion before finishing' : ''}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}