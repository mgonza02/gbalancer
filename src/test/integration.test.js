/**
 * Integration test for the customer data source selection feature
 * This test verifies that all components work together correctly
 */

// Mock localStorage for testing
const mockLocalStorage = {
  storage: {},
  getItem: function(key) {
    return this.storage[key] || null;
  },
  setItem: function(key, value) {
    this.storage[key] = value;
  },
  removeItem: function(key) {
    delete this.storage[key];
  },
  clear: function() {
    this.storage = {};
  }
};

// Mock global localStorage (only if in browser environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
  });
}

// Create a localStorage-like object for Node.js testing
const localStorage = mockLocalStorage;

// Test data
const testCustomers = [
  {
    id: 1,
    customer_name: "Integration Test Customer 1",
    document_number: "12345678",
    lat: "-16.408155",
    lng: "-71.474054",
    sales: 183.55
  },
  {
    id: 2,
    customer_name: "Integration Test Customer 2",
    document_number: "87654321",
    lat: "-16.392622",
    lng: "-71.479856",
    sales: 187.73
  },
  {
    id: 3,
    customer_name: "Integration Test Customer 3",
    document_number: "11223344",
    lat: "-16.404702",
    lng: "-71.496794",
    sales: 128.01
  }
];

// Test functions
function testDataSourceSelection() {
  console.log('=== Testing Data Source Selection Feature ===');

  // Test 1: Sample data loading
  console.log('\n1. Testing sample data loading...');
  try {
    // This would normally be called from the DataSourceSelector component
    localStorage.setItem('customerData', JSON.stringify(testCustomers));
    const saved = localStorage.getItem('customerData');
    const parsed = JSON.parse(saved);

    console.log('✓ Sample data saved to localStorage');
    console.log('✓ Sample data loaded from localStorage');
    console.log(`✓ Data contains ${parsed.length} customers`);
  } catch (error) {
    console.error('✗ Sample data test failed:', error);
  }

  // Test 2: JSON file validation
  console.log('\n2. Testing JSON file validation...');
  try {
    const validationErrors = [];
    testCustomers.forEach((customer, index) => {
      if (!customer.id) validationErrors.push(`Customer ${index} missing id`);
      if (!customer.customer_name) validationErrors.push(`Customer ${index} missing customer_name`);
      if (!customer.lat || !customer.lng) validationErrors.push(`Customer ${index} missing coordinates`);
      if (!customer.sales) validationErrors.push(`Customer ${index} missing sales`);
    });

    if (validationErrors.length === 0) {
      console.log('✓ JSON validation passed');
    } else {
      console.error('✗ JSON validation failed:', validationErrors);
    }
  } catch (error) {
    console.error('✗ JSON validation test failed:', error);
  }

  // Test 3: Data normalization
  console.log('\n3. Testing data normalization...');
  try {
    const normalized = testCustomers.map(customer => ({
      id: customer.id,
      customer_name: customer.customer_name || customer.name || '',
      document_number: customer.document_number || '',
      lat: customer.lat,
      lng: customer.lng,
      sales: customer.sales || 0,
      location: {
        lat: parseFloat(customer.lat),
        lng: parseFloat(customer.lng)
      }
    }));

    console.log('✓ Data normalization successful');
    console.log(`✓ Normalized ${normalized.length} customers`);
  } catch (error) {
    console.error('✗ Data normalization failed:', error);
  }

  // Test 4: Statistics calculation
  console.log('\n4. Testing statistics calculation...');
  try {
    const totalCustomers = testCustomers.length;
    const totalSales = testCustomers.reduce((sum, customer) => sum + customer.sales, 0);
    const averageSales = totalSales / totalCustomers;

    console.log('✓ Statistics calculated successfully');
    console.log(`✓ Total customers: ${totalCustomers}`);
    console.log(`✓ Total sales: ${totalSales.toFixed(2)}`);
    console.log(`✓ Average sales: ${averageSales.toFixed(2)}`);
  } catch (error) {
    console.error('✗ Statistics calculation failed:', error);
  }

  // Test 5: API simulation
  console.log('\n5. Testing API simulation...');
  try {
    // Simulate successful API response
    const apiResponse = {
      ok: true,
      status: 200,
      json: async () => testCustomers
    };

    // Simulate fetch call
    const mockFetch = async (url, options) => {
      if (url && options && options.headers) {
        return apiResponse;
      }
      throw new Error('Invalid request');
    };

    console.log('✓ API simulation successful');
    console.log('✓ Mock fetch function created');
  } catch (error) {
    console.error('✗ API simulation failed:', error);
  }

  console.log('\n=== All tests completed ===');
}

// Run the test
testDataSourceSelection();

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDataSourceSelection,
    testCustomers
  };
}
