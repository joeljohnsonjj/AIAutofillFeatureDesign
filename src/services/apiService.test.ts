/**
 * API Service Test File
 * 
 * This file contains test examples for the API service.
 * Run these tests to verify backend integration is working correctly.
 */

import { queryObligations, transformObligationToSnippet, checkHealth, getDocuments } from './apiService';
import type { BackendObligation } from './apiService';

/**
 * Test 1: Health Check
 * Verifies the backend is running and accessible
 */
export async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  try {
    const health = await checkHealth();
    console.log('✅ Health check passed:', health);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

/**
 * Test 2: Query Obligations
 * Tests the main query functionality with a sample search
 */
export async function testQueryObligations() {
  console.log('🔍 Testing query obligations...');
  try {
    const query = 'Landlord HVAC Hazardous Materials';
    const response = await queryObligations(query);
    
    console.log('✅ Query successful!');
    console.log(`   Query: "${response.query}"`);
    console.log(`   Documents searched: ${response.total_documents_searched}`);
    console.log(`   Obligations found: ${response.total_obligations_found}`);
    console.log(`   Results count: ${response.results.length}`);
    
    if (response.results.length > 0) {
      console.log('\n   First result:');
      console.log(`   - DutyType: ${response.results[0].DutyType}`);
      console.log(`   - Responsible Party: ${response.results[0]['Responsible Party']}`);
      console.log(`   - Citation: ${response.results[0].Citation}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Query failed:', error);
    return false;
  }
}

/**
 * Test 3: Get Documents
 * Tests fetching the list of available documents
 */
export async function testGetDocuments() {
  console.log('📄 Testing get documents...');
  try {
    const documents = await getDocuments();
    console.log('✅ Documents fetched successfully!');
    console.log(`   Total documents: ${documents.length}`);
    
    if (documents.length > 0) {
      console.log('\n   First document:');
      console.log(`   - ID: ${documents[0].id}`);
      console.log(`   - Name: ${documents[0].name}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Get documents failed:', error);
    return false;
  }
}

/**
 * Test 4: Transform Obligation
 * Tests the data transformation logic
 */
export function testTransformObligation() {
  console.log('🔄 Testing obligation transformation...');
  
  const mockObligation: BackendObligation = {
    DutyType: 'Hazardous Materials Indemnification',
    'Responsible Party': 'Landlord',
    'Owner Responsibility': [
      'Release, indemnify, and hold harmless the Tenant',
      'Cover any and all demands, expenses, fees, costs'
    ],
    Reasoning: [
      'Hazardous Materials introduced by the Landlord'
    ],
    Citation: 'Document: Commercial Lease Agreement.pdf | Page 13, Section (d)'
  };
  
  try {
    const snippet = transformObligationToSnippet(mockObligation, 0);
    
    console.log('✅ Transformation successful!');
    console.log(`   Snippet ID: ${snippet.id}`);
    console.log(`   Title: ${snippet.title}`);
    console.log(`   Document ID: ${snippet.documentId}`);
    console.log(`   Page: ${snippet.pdfReference.page}`);
    console.log(`   Responsible Party: ${snippet.fieldMappings.responsibleParty}`);
    console.log(`   Owner Responsibility: ${snippet.fieldMappings.maintenanceOwnerResponsibility.substring(0, 50)}...`);
    console.log(`   Reasoning: ${snippet.fieldMappings.maintenanceReasoning}`);
    
    return true;
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('\n🚀 Starting API Service Tests\n');
  console.log('='.repeat(50));
  
  const results = {
    health: false,
    query: false,
    documents: false,
    transform: false,
  };
  
  // Test 1: Health Check
  results.health = await testHealthCheck();
  console.log('='.repeat(50));
  
  // Test 2: Query Obligations
  results.query = await testQueryObligations();
  console.log('='.repeat(50));
  
  // Test 3: Get Documents
  results.documents = await testGetDocuments();
  console.log('='.repeat(50));
  
  // Test 4: Transform Obligation
  results.transform = testTransformObligation();
  console.log('='.repeat(50));
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Query Obligations: ${results.query ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Get Documents: ${results.documents ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Transform Obligation: ${results.transform ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n   Total: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('\n🎉 All tests passed! Backend integration is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend server and configuration.\n');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).apiTests = {
    runAll: runAllTests,
    testHealth: testHealthCheck,
    testQuery: testQueryObligations,
    testDocuments: testGetDocuments,
    testTransform: testTransformObligation,
  };
  
  console.log('💡 API tests loaded! Run tests from console:');
  console.log('   - window.apiTests.runAll()');
  console.log('   - window.apiTests.testHealth()');
  console.log('   - window.apiTests.testQuery()');
  console.log('   - window.apiTests.testDocuments()');
  console.log('   - window.apiTests.testTransform()');
}
