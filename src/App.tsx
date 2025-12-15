import React, { useState } from 'react';
import { AgreementForm } from './components/AgreementForm';

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

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [fieldId]: value,
      };
      return newFormData;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm">☰</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-600 font-bold">LOCATION</span>
              <span className="bg-red-600 text-white px-1.5 py-0.5 text-xs">HQ</span>
            </div>
          </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AgreementForm
          formData={formData}
          onFieldChange={handleFieldChange}
        />
      </main>
    </div>
  );
}