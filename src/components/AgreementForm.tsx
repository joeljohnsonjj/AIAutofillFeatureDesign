import { CategorySection } from './CategorySection';

interface Document {
  id: string;
  name: string;
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
  onSaveDraft?: () => void;
  onFinish?: () => void;
  onApproveAIChanges?: () => void;
  isAIApproved?: boolean;
  hasAIChanges?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
  documents?: Document[];
  checkedDocuments?: string[];
  onDocumentCheckChange?: (documentId: string, checked: boolean) => void;
  hasAIGeneratedFields?: Record<string, boolean>;
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
  onSaveDraft,
  onFinish,
  onApproveAIChanges,
  isAIApproved = false,
  hasAIChanges = false,
  isEditing = false,
  onCancel,
  documents = [],
  checkedDocuments = [],
  onDocumentCheckChange,
  hasAIGeneratedFields = {},
}: AgreementFormProps) {
  // Determine if Finish button should be enabled
  // When there are AI-generated fields: Finish is disabled until AI changes are approved
  // When no AI fields: Finish behaves normally
  const isFinishEnabled = hasAIChanges ? isAIApproved : true;

  return (
    <div className="bg-white rounded-lg shadow-sm">
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
          isAIApproved={isAIApproved}
          hasAIGeneratedFields={hasAIGeneratedFields}
        />
      </div>

      {/* Documents List with Checkboxes - Always visible when documents exist */}
      {documents.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4">
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
          {/* AI Approval Button - Always show when there are AI-generated fields that need approval */}
          {hasAIChanges && !isAIApproved && onApproveAIChanges && (
            <button
              onClick={onApproveAIChanges}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve AI Changes
            </button>
          )}
          <button 
            onClick={onFinish}
            disabled={!isFinishEnabled}
            className={`px-6 py-2 rounded-md ${
              isFinishEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}