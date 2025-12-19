import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Building2, FileCheck, File, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Agreement } from './AgreementsLandingPage';
import { getAgreementById, deleteAgreement, deleteMockAgreement } from '../utils/agreementStorage';
import { useState } from 'react';

// All available documents (for reference)
const ALL_DOCUMENTS = [
  { id: 'doc-1', name: 'land-reports-2025-04-21T10_19_42.23YZ.pdf' },
  { id: 'doc-2', name: 'lease-agreement-2024.pdf' },
  { id: 'doc-3', name: 'maintenance-contract-2025.pdf' },
];

// Helper function to get file type icon
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-600" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-600" />;
    case 'xls':
    case 'xlsx':
      return <FileText className="w-5 h-5 text-green-600" />;
    default:
      return <File className="w-5 h-5 text-gray-600" />;
  }
};

const mockAgreements: Agreement[] = [
  {
    id: '1',
    agreementNumber: 'AGR001234',
    name: 'Facilities Management Agreement',
    date: '01/15/2024',
    location: 'Building A - Corporate Office',
    status: 'Active',
    notes: 'Annual facilities maintenance and upkeep agreement for corporate office building.',
    maintenance: {
      responsibleParty: 'Facilities Corp',
      ownerResponsibility: 'Property oversight and compliance',
      reasoning: 'Specialized equipment requires certified maintenance',
    },
  },
  {
    id: '2',
    agreementNumber: 'AGR001235',
    name: 'HVAC Service Contract',
    date: '02/20/2024',
    location: 'Zone 5 - Industrial Complex',
    status: 'Active',
    notes: 'Quarterly HVAC maintenance and emergency repair services.',
  },
  {
    id: '3',
    agreementNumber: 'AGR001236',
    name: 'Landscaping Services Agreement',
    date: '03/10/2024',
    location: 'Campus East - Research Facility',
    status: 'Active',
    notes: 'Weekly landscaping and grounds maintenance for research campus.',
    maintenance: {
      responsibleParty: 'GreenScape LLC',
      ownerResponsibility: 'Environmental compliance',
      reasoning: 'Maintains professional appearance and environmental standards',
    },
  },
  {
    id: '4',
    agreementNumber: 'AGR001237',
    name: 'Security Monitoring Agreement',
    date: '12/05/2023',
    location: 'All Locations',
    status: 'Active',
    notes: '24/7 security monitoring and response services across all properties.',
  },
  {
    id: '5',
    agreementNumber: 'AGR001238',
    name: 'Waste Management Contract',
    date: '04/18/2024',
    location: 'Building C - Distribution Center',
    status: 'Pending',
    notes: 'Bi-weekly waste collection and recycling services.',
  },
];

export function AgreementPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Try to find agreement in storage first (to get latest saved data), then in mock data
  const storedAgreement = id ? getAgreementById(id) : undefined;
  const mockAgreement = mockAgreements.find((a) => a.id === id);
  // Prioritize stored agreement over mock (stored has latest saved documents)
  const agreement = storedAgreement || mockAgreement;

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2>Agreement not found</h2>
          <Button onClick={() => navigate('/agreements')} className="mt-4">
            Back to Agreements
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/agreements/${id}/edit`);
  };

  const handleDelete = () => {
    if (id) {
      if (storedAgreement) {
        // Delete stored agreement
        const success = deleteAgreement(id);
        if (success) {
          navigate('/agreements');
        }
      } else if (mockAgreement) {
        // Delete mock agreement (mark as deleted)
        const success = deleteMockAgreement(id);
        if (success) {
          navigate('/agreements');
        }
      }
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = () => {
    // Show confirmation for all agreements
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as other pages */}
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
      <div className="w-full">
        {/* Content Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/agreements')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Agreements
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Edit Agreement
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Agreement details</h1>
              <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Agreement ID:</span>
                  <span>{agreement.agreementNumber}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Name:</span>
                  <span>{agreement.name}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger 
                value="information" 
                className="gap-2 whitespace-nowrap data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900"
              >
                <FileText className="w-4 h-4" />
                Information
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="gap-2 whitespace-nowrap data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900"
              >
                <Building2 className="w-4 h-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="information">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Identification Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">Identification</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Agreement name</label>
                      <p className="text-gray-900 text-base">{agreement.name}</p>
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Agreement date</label>
                      <p className="text-gray-900 text-base">{agreement.date}</p>
                    </div>
                  </div>

                  {agreement.notes && (
                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-900 text-base leading-relaxed">{agreement.notes}</p>
                    </div>
                  )}
                </div>

                {/* Maintenance Section - Only show if exists */}
                {agreement.maintenance && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">Maintenance</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Responsible party</label>
                        <p className="text-gray-900 text-base">{agreement.maintenance.responsibleParty}</p>
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Maintenance owner responsibility
                        </label>
                        <p className="text-gray-900 text-base leading-relaxed">
                          {agreement.maintenance.ownerResponsibility}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Maintenance reasoning</label>
                        <p className="text-gray-900 text-base leading-relaxed">{agreement.maintenance.reasoning}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {agreement.documents && agreement.documents.length > 0 ? (
                  <div className="space-y-3">
                    {agreement.documents.map((docId) => {
                      const doc = ALL_DOCUMENTS.find(d => d.id === docId);
                      if (!doc) return null;
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {getFileIcon(doc.name)}
                          <span className="text-gray-900 font-medium">{doc.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No documents attached to this agreement.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Delete Button - At the bottom */}
          <div className="mt-16 pb-8 border-t-2 border-gray-300 pt-10" style={{paddingTop:24}}>
            <Button
              onClick={handleDeleteClick}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Agreement
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this agreement? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleCancelDelete}
                variant="outline"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
