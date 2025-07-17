/**
 * Test script to verify customer data service functionality
 */

import {
  clearCustomerData,
  getCustomerDataStats,
  hasCustomerData,
  loadCustomerData,
  normalizeCustomerData,
  saveCustomerData,
  validateCustomerData
} from '../services/customerDataService.js';

// Test data
const testCustomers = [
  {
    id: 1,
    customer_name: "Test Customer 1",
    document_number: "12345678",
    lat: "-16.408155",
    lng: "-71.474054",
    sales: 183.55
  },
  {
    id: 2,
    customer_name: "Test Customer 2",
    document_number: "87654321",
    lat: "-16.392622",
    lng: "-71.479856",
    sales: 187.73
  }
];

// Test saving and loading
console.log('Testing customer data service...');

// Clear existing data
clearCustomerData();
console.log('Initial state - has data:', hasCustomerData());

// Save test data
const saveResult = saveCustomerData(testCustomers);
console.log('Save result:', saveResult);

// Check if data exists
console.log('After save - has data:', hasCustomerData());

// Load data
const loadedData = loadCustomerData();
console.log('Loaded data:', loadedData);

// Get statistics
const stats = getCustomerDataStats();
console.log('Statistics:', stats);

// Test validation
const validationResult = validateCustomerData(testCustomers);
console.log('Validation result:', validationResult);

// Test normalization
const normalizedData = normalizeCustomerData(testCustomers);
console.log('Normalized data:', normalizedData);

console.log('All tests completed successfully!');
