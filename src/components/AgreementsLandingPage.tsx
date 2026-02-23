import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { Input } from './ui/input';
import { getAgreements, getDeletedMockAgreements } from '../utils/agreementStorage';

export interface Agreement {
  id: string;
  agreementNumber: string;
  name: string;
  date: string;
  location: string;
  status: string;
  notes?: string;
  maintenance?: {
    responsibleParty: string;
    ownerResponsibility: string;
    reasoning: string;
  };
  documents?: string[]; // Array of document IDs
  lastModified?: string; // ISO timestamp of last modification
}

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
    status: 'Needs Review',
    notes: 'Bi-weekly waste collection and recycling services.',
  },
];

export function AgreementsLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [allAgreements, setAllAgreements] = useState<Agreement[]>([]);
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'id'>('modified');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Sort agreements based on current sort option
  const sortAgreements = (agreements: Agreement[]): Agreement[] => {
    const sorted = [...agreements];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'modified':
        sorted.sort((a, b) => {
          const timeA = a.lastModified 
            ? new Date(a.lastModified).getTime() 
            : new Date(a.date).getTime();
          const timeB = b.lastModified 
            ? new Date(b.lastModified).getTime() 
            : new Date(b.date).getTime();
          return timeB - timeA; // Most recent first
        });
        break;
      case 'id':
        sorted.sort((a, b) => a.agreementNumber.localeCompare(b.agreementNumber));
        break;
    }
    return sorted;
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name': return 'Agreement Name';
      case 'modified': return 'Last Modified';
      case 'id': return 'Agreement ID';
    }
  };

  // Refresh whenever location changes (when navigating back from form)
  useEffect(() => {
    const storedAgreements = getAgreements();
    const deletedMockIds = new Set(getDeletedMockAgreements());
    // Filter out deleted mock agreements
    const activeMockAgreements = mockAgreements.filter(a => !deletedMockIds.has(a.id));
    // Merge mock agreements with stored agreements, avoiding duplicates by ID
    const mockIds = new Set(activeMockAgreements.map(a => a.id));
    const uniqueStored = storedAgreements.filter(a => !mockIds.has(a.id));
    const merged = [...activeMockAgreements, ...uniqueStored];
    setAllAgreements(merged);
    
    // Apply sorting
    const sorted = sortAgreements(merged);
    
    // Apply current search filter if any
    if (searchTerm) {
      const filtered = sorted.filter(
        (agreement) => {
          const searchLower = searchTerm.toLowerCase();
          
          // Search in name, ID, and status
          const matchesBasic = 
            agreement.name.toLowerCase().includes(searchLower) ||
            agreement.agreementNumber.toLowerCase().includes(searchLower) ||
            agreement.status.toLowerCase().includes(searchLower);
          
          // Search in date fields
          const creationDate = agreement.date;
          const lastModifiedDate = agreement.lastModified 
            ? new Date(agreement.lastModified).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : agreement.date;
          
          const matchesDate = 
            creationDate.includes(searchTerm) ||
            lastModifiedDate.includes(searchTerm);
          
          return matchesBasic || matchesDate;
        }
      );
      setFilteredAgreements(filtered);
    } else {
      setFilteredAgreements(sorted);
    }
  }, [location.pathname, searchTerm, sortBy]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const sorted = sortAgreements(allAgreements);
    const filtered = sorted.filter(
      (agreement: Agreement) => {
        const searchLower = value.toLowerCase();
        
        // Search in name, ID, and status
        const matchesBasic = 
          agreement.name.toLowerCase().includes(searchLower) ||
          agreement.agreementNumber.toLowerCase().includes(searchLower) ||
          agreement.status.toLowerCase().includes(searchLower);
        
        // Search in date fields
        const creationDate = agreement.date;
        const lastModifiedDate = agreement.lastModified 
          ? new Date(agreement.lastModified).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : agreement.date;
        
        const matchesDate = 
          creationDate.includes(value) ||
          lastModifiedDate.includes(value);
        
        return matchesBasic || matchesDate;
      }
    );
    setFilteredAgreements(filtered);
  };

  const handleViewAgreement = (agreementId: string) => {
    navigate(`/agreements/${agreementId}`);
  };

  const handleNewAgreement = () => {
    navigate('/agreements/new');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-red-600 font-bold text-lg">LOCATION</span>
              <span className="bg-red-600 text-white px-1.5 py-0.5 text-xs font-bold">HQ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Back button - below header, outside app bar */}
      <div className="bg-white border-b b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50" >
        {/* Page Header */}
        <div className="bg-white px-6 py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6" style={{ marginBottom: '20px' }}>
              <h1 className="text-3xl font-bold text-gray-900">Agreements</h1>
              <button 
                onClick={handleNewAgreement}
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-full font-medium text-sm transition-colors"
              >
                + Add Agreement
              </button>
            </div>

            {/* Search Bar and Sort Dropdown */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by name, ID, status, or date (MM/DD/YYYY)"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-10 border-gray-300 rounded"
                />
              </div>
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 h-10 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700 bg-white min-w-[180px]"
                >
                  <span>Sort by: {getSortLabel()}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSortDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        <button
                          onClick={() => { setSortBy('modified'); setShowSortDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                            sortBy === 'modified' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          Last Modified
                          {sortBy === 'modified' && <span className="text-blue-600">✓</span>}
                        </button>
                        <button
                          onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                            sortBy === 'name' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          Agreement Name
                          {sortBy === 'name' && <span className="text-blue-600">✓</span>}
                        </button>
                        <button
                          onClick={() => { setSortBy('id'); setShowSortDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                            sortBy === 'id' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          Agreement ID
                          {sortBy === 'id' && <span className="text-blue-600">✓</span>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-600 mb-4">{filteredAgreements.length} Agreement result</p>

          {/* Agreements Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Agreement name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Agreement ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Creation date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Created by</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last updated date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last updated by</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAgreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewAgreement(agreement.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        {agreement.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{agreement.agreementNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{agreement.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">svc_team_24247137</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {agreement.lastModified 
                        ? new Date(agreement.lastModified).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                        : agreement.date
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">svc_team_24247137</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          agreement.status === 'Active'
                            ? 'bg-blue-100 text-blue-800'
                            : agreement.status === 'Needs Review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : agreement.status === 'Pending Addition'
                            ? 'bg-green-100 text-green-800'
                            : agreement.status === 'Pending Deletion'
                            ? 'bg-red-100 text-red-800'
                            : agreement.status === 'Pending Update'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {agreement.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm text-gray-600">1 - 1 of 1 rows</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
