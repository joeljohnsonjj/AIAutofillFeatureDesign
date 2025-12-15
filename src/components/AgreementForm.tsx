import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CategorySection } from './CategorySection';

interface AgreementFormProps {
  formData: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
}

export function AgreementForm({ formData, onFieldChange }: AgreementFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAIUsed, setIsAIUsed] = useState(false);
  const [isAIApproved, setIsAIApproved] = useState(false);

  const handleAIUsed = () => {
    setIsAIUsed(true);
    setIsAIApproved(false); // Reset approval when AI is used again
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1>Add agreement</h1>
      </div>

      <div className="p-6">
        {/* Agreement 1 Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>Agreement 1</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {isExpanded && (
            <div className="border-t border-gray-200">
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
                onAIUsed={handleAIUsed}
              />

              {/* Billing Section */}
              <CategorySection
                category="billing"
                title="Billing"
                fields={[
                  { id: 'billingContact', label: 'Billing Contact', value: formData.billingContact, category: 'billing' },
                  { id: 'billingAgreement', label: 'Billing Agreement', value: formData.billingAgreement, category: 'billing' },
                ]}
                formData={formData}
                onFieldChange={onFieldChange}
              />

              {/* Documents Section */}
              <div className="px-6 py-6">
                <h2 className="text-gray-900 mb-4">Documents</h2>
                <p className="text-sm text-gray-600 mb-4">
                  What documents would you like to link to this agreement?
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  The documents below are available in the Documents tab on the Land details page
                </p>

                <div className="border border-gray-200 rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">
                          <input type="checkbox" className="rounded" />
                          <span className="ml-3">Select all</span>
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">File name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Uploaded by</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Uploaded date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <a href="#" className="text-blue-600 hover:underline text-sm">
                            land-reports-2025-04-21T10_19_42.23YZ
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">svs. team_v24.r2.f.17</td>
                        <td className="px-4 py-3 text-sm text-gray-600">12/11/2025, 2:58PM</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">1 - 1 of 1 rows</div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 text-gray-400 hover:text-gray-600">‹</button>
                      <button className="px-2 py-1 text-gray-400 hover:text-gray-600">›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Approval Section */}
      {isAIUsed && !isAIApproved && (
        <div className="border-t border-gray-200 px-6 py-4 bg-amber-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                AI has been used to fill fields. Please review and approve before finishing.
              </span>
            </div>
            <button
              onClick={() => setIsAIApproved(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md">
            Add another agreement
          </button>
          <button 
            className={`px-6 py-2 rounded-md transition-colors ${
              isAIUsed && !isAIApproved
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={isAIUsed && !isAIApproved}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
