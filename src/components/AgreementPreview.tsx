import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Building2, ClipboardList, History, FileCheck, Building, Map } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Agreement } from './AgreementsLandingPage';

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
  
  const agreement = mockAgreements.find((a) => a.id === id);

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="mb-6">Location Management</h2>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left">
              <Map className="w-5 h-5" />
              <span>Land</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left">
              <Building className="w-5 h-5" />
              <span>Campus</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left">
              <Building className="w-5 h-5" />
              <span>Building</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-left">
              <FileText className="w-5 h-5" />
              <span>Agreements</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/agreements')}
                className="gap-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Agreements
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Print Preview
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  Edit Agreement
                </Button>
              </div>
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
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Location:</span>
                  <span>{agreement.location}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="information" className="gap-2 whitespace-nowrap">
                <FileText className="w-4 h-4" />
                Information
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2 whitespace-nowrap">
                <Building2 className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="campuses" className="gap-2 whitespace-nowrap">
                <ClipboardList className="w-4 h-4" />
                Campuses
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="gap-2 whitespace-nowrap">
                <Building2 className="w-4 h-4" />
                Hierarchy
              </TabsTrigger>
              <TabsTrigger value="parcels" className="gap-2 whitespace-nowrap">
                <ClipboardList className="w-4 h-4" />
                Parcels
              </TabsTrigger>
              <TabsTrigger value="agreements" className="gap-2 whitespace-nowrap">
                <FileCheck className="w-4 h-4" />
                Agreements
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 whitespace-nowrap">
                <History className="w-4 h-4" />
                History
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
                <p className="text-gray-600 text-center py-8">No documents attached to this agreement.</p>
              </div>
            </TabsContent>

            <TabsContent value="campuses">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center py-8">No campuses linked to this agreement.</p>
              </div>
            </TabsContent>

            <TabsContent value="hierarchy">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center py-8">No hierarchy information available.</p>
              </div>
            </TabsContent>

            <TabsContent value="parcels">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center py-8">No parcels linked to this agreement.</p>
              </div>
            </TabsContent>

            <TabsContent value="agreements">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center py-8">No related agreements.</p>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center py-8">No history available.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
