import React from 'react';
import { CategorySection } from './CategorySection';

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
}: AgreementFormProps) {
  // Determine if Finish button should be enabled
  // When AI mode is ON: Finish is disabled until AI changes are approved
  // When AI mode is OFF: Finish behaves normally
  const isFinishEnabled = aiMode ? isAIApproved : true;

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
        />
      </div>

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
          {/* AI Approval Button - Only show when AI mode is ON and there are AI changes that need approval */}
          {aiMode && hasAIChanges && !isAIApproved && onApproveAIChanges && (
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