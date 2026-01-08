import type { Agreement } from '../components/AgreementsLandingPage';

const STORAGE_KEY = 'agreements_storage';
const DELETED_MOCK_AGREEMENTS_KEY = 'deleted_mock_agreements';

// Get list of deleted mock agreement IDs
export const getDeletedMockAgreements = (): string[] => {
  try {
    const stored = localStorage.getItem(DELETED_MOCK_AGREEMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading deleted mock agreements:', error);
  }
  return [];
};

// Mark a mock agreement as deleted
export const deleteMockAgreement = (id: string): boolean => {
  const deleted = getDeletedMockAgreements();
  if (!deleted.includes(id)) {
    deleted.push(id);
    try {
      localStorage.setItem(DELETED_MOCK_AGREEMENTS_KEY, JSON.stringify(deleted));
      return true;
    } catch (error) {
      console.error('Error saving deleted mock agreement:', error);
      return false;
    }
  }
  return true;
};

// Generate a unique agreement number
const generateAgreementNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `AGR${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
};

// Get all agreements from storage
export const getAgreements = (): Agreement[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading agreements from storage:', error);
  }
  return [];
};

// Save an agreement to storage
export const saveAgreement = (agreementData: Omit<Agreement, 'id' | 'agreementNumber'>, status: 'Active' | 'Needs Review', existingId?: string, existingAgreementNumber?: string): Agreement => {
  const agreements = getAgreements();
  const newAgreement: Agreement = {
    id: existingId || `agreement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    agreementNumber: existingAgreementNumber || generateAgreementNumber(),
    name: agreementData.name || 'Untitled Agreement',
    date: agreementData.date || new Date().toLocaleDateString('en-US'),
    location: agreementData.location || 'Not specified',
    status: status,
    notes: agreementData.notes,
    maintenance: agreementData.maintenance,
    documents: agreementData.documents || [], // Include documents field (default to empty array if not provided)
    lastModified: new Date().toISOString(), // Track modification time
  };
  
  console.log('💾 Saving agreement to storage:', newAgreement);
  console.log('💾 Documents in saved agreement:', newAgreement.documents);

  // Check if agreement with this ID already exists (for mock agreements being saved)
  const existingIndex = agreements.findIndex(a => a.id === newAgreement.id);
  if (existingIndex >= 0) {
    // Update existing
    agreements[existingIndex] = newAgreement;
  } else {
    // Add new
    agreements.push(newAgreement);
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agreements));
  } catch (error) {
    console.error('Error saving agreement to storage:', error);
  }

  return newAgreement;
};

// Get agreement by ID
export const getAgreementById = (id: string): Agreement | undefined => {
  const agreements = getAgreements();
  return agreements.find(agreement => agreement.id === id);
};

// Update agreement
export const updateAgreement = (id: string, updates: Partial<Agreement>): Agreement | null => {
  const agreements = getAgreements();
  const index = agreements.findIndex(agreement => agreement.id === id);
  
  if (index === -1) {
    return null;
  }

  agreements[index] = { 
    ...agreements[index], 
    ...updates,
    lastModified: new Date().toISOString(), // Update modification time
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agreements));
    return agreements[index];
  } catch (error) {
    console.error('Error updating agreement in storage:', error);
    return null;
  }
};

// Delete agreement
export const deleteAgreement = (id: string): boolean => {
  const agreements = getAgreements();
  const index = agreements.findIndex(agreement => agreement.id === id);
  
  if (index === -1) {
    return false;
  }

  agreements.splice(index, 1);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agreements));
    return true;
  } catch (error) {
    console.error('Error deleting agreement from storage:', error);
    return false;
  }
};

