import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarPrompt, setSidebarPrompt] = useState('');

  // Sort agreements based on current sort option
  const sortAgreements = (agreements: Agreement[]): Agreement[] => {
    const sorted = [...agreements];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'modified':
        // Sort by lastModified (most recent first), fallback to date if lastModified not available
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

  // Load agreements from storage and merge with mock data
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
        (agreement) =>
          agreement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agreement.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agreement.status.toLowerCase().includes(searchTerm.toLowerCase())
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
      (agreement: Agreement) =>
        agreement.name.toLowerCase().includes(value.toLowerCase()) ||
        agreement.agreementNumber.toLowerCase().includes(value.toLowerCase()) ||
        agreement.status.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAgreements(filtered);
  };

  const handleSortChange = (option: 'name' | 'modified' | 'id') => {
    setSortBy(option);
    setShowSortDropdown(false);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name':
        return 'Agreement Name';
      case 'modified':
        return 'Last Modified';
      case 'id':
        return 'Agreement ID';
    }
  };

  const handleViewAgreement = (agreementId: string) => {
    navigate(`/agreements/${agreementId}`);
  };

  const handleNewAgreement = () => {
    navigate('/agreements/new');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Same as agreement form page */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-30">
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

      {/* Main Content Container */}
      <div className="flex-1 flex relative">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'mr-96' : ''}`}>
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 max-w-3xl">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Agreements</h1>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Organize and manage agreements within your location hierarchy. Define terms, track
                    details, and ensure seamless integration with Campuses, Buildings, Sub-locations,
                    and Zones for complete visibility and informed decision-making.
                  </p>
                </div>
                <div className="ml-6 flex-shrink-0">
                  <Button 
                    onClick={handleNewAgreement}
                    className="bg-gray-800 hover:bg-gray-700 text-white whitespace-nowrap"
                    style={{ backgroundColor: '#007bff' , color: 'white'}}
                  >
                    + New Agreement
                  </Button>
                </div>
              </div>

              {/* Search Bar and Sort Dropdown - Side by Side */}
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="   Search"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-gray-300 rounded-lg"
                  />
                </div>
                
                {/* Sort By Dropdown - Right side */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 px-4 py-2.5 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 bg-white"
                  >
                    <span>Sort by: {getSortLabel()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showSortDropdown && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowSortDropdown(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="py-1">
                          <button
                            onClick={() => handleSortChange('modified')}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                              sortBy === 'modified' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            <span>Last Modified</span>
                            {sortBy === 'modified' && <span className="text-blue-600">✓</span>}
                          </button>
                          <button
                            onClick={() => handleSortChange('name')}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                              sortBy === 'name' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            <span>Agreement Name</span>
                            {sortBy === 'name' && <span className="text-blue-600">✓</span>}
                          </button>
                          <button
                            onClick={() => handleSortChange('id')}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                              sortBy === 'id' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            <span>Agreement ID</span>
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

          {/* Results */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{filteredAgreements.length} Agreement results</p>
            </div>

            {/* Agreement Cards */}
            <div className="space-y-4">
              {filteredAgreements.map((agreement, index) => (
                <motion.div
                  key={agreement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{agreement.agreementNumber}</h3>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-800 font-medium">{agreement.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600 mb-3 flex-wrap">
                        <span className="text-sm">{agreement.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            agreement.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : agreement.status === 'Needs Review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {agreement.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleViewAgreement(agreement.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                      >
                        View agreement
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Agreements 101 Sidebar */}
        <motion.div
          initial={false}
          animate={{ x: isSidebarOpen ? 0 : '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-[73px] bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Agreements 101</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ✕
            </button>
          </div>

          {/* Search/Prompt Input */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Enter Prompt"
                value={sidebarPrompt}
                onChange={(e) => setSidebarPrompt(e.target.value)}
                className="pl-10 h-10 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Sidebar Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 height-full top-20">
            {/* Empty content area - extends full height */}
            <div className="h-full ">
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>
             <br/>       
            </div>
          </div>
        </motion.div>

        {/* Agreements 101 Toggle Button - Rotated 90 degrees */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bg-blue-600 text-white shadow-lg hover:bg-blue-700 z-20 flex items-center gap-2"
          style={{
            right: isSidebarOpen ? '410px' : '20px',
            top: '50%',
            padding: '12px 16px',
            transform: 'rotate(-90deg)',
            transformOrigin: 'right center',
            borderRadius: '8px 8px 0 0',
            transition: 'right 0.3s ease-in-out'
          }}
        >
          <span className="text-sm font-medium whitespace-nowrap">Agreements 101</span>
          <span className="text-lg font-bold" style={{ transform: 'rotate(90deg)' }}>‹</span>
        </button>
      </div>
    </div>
  );
}
