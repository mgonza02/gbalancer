/**
 * Customer Data Service
 * Handles customer data persistence and retrieval from localStorage
 */

const CUSTOMER_DATA_KEY = 'customerData';

/**
 * Save customer data to localStorage
 * @param {Array} customerData - Array of customer objects
 * @returns {boolean} - Success status
 */
export const saveCustomerData = (customerData) => {
  try {
    const jsonString = JSON.stringify(customerData);
    localStorage.setItem(CUSTOMER_DATA_KEY, jsonString);
    return true;
  } catch (error) {
    console.error('Failed to save customer data to localStorage:', error);
    return false;
  }
};

/**
 * Load customer data from localStorage
 * @returns {Array|null} - Array of customer objects or null if not found
 */
export const loadCustomerData = () => {
  try {
    const jsonString = localStorage.getItem(CUSTOMER_DATA_KEY);
    if (!jsonString) {
      return null;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to load customer data from localStorage:', error);
    return null;
  }
};

/**
 * Clear customer data from localStorage
 * @returns {boolean} - Success status
 */
export const clearCustomerData = () => {
  try {
    localStorage.removeItem(CUSTOMER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear customer data from localStorage:', error);
    return false;
  }
};

/**
 * Check if customer data exists in localStorage
 * @returns {boolean} - True if data exists
 */
export const hasCustomerData = () => {
  try {
    const jsonString = localStorage.getItem(CUSTOMER_DATA_KEY);
    return jsonString !== null && jsonString !== undefined;
  } catch (error) {
    console.error('Failed to check customer data in localStorage:', error);
    return false;
  }
};

/**
 * Get customer data statistics
 * @returns {Object|null} - Statistics object or null if no data
 */
export const getCustomerDataStats = () => {
  try {
    const customerData = loadCustomerData();
    if (!customerData || !Array.isArray(customerData)) {
      return null;
    }

    const totalCustomers = customerData.length;
    const totalSales = customerData.reduce((sum, customer) => sum + (customer.sales || 0), 0);
    const averageSales = totalCustomers > 0 ? totalSales / totalCustomers : 0;
    const customersWithCoordinates = customerData.filter(customer =>
      customer.lat && customer.lng &&
      !isNaN(parseFloat(customer.lat)) &&
      !isNaN(parseFloat(customer.lng))
    ).length;

    return {
      totalCustomers,
      totalSales,
      averageSales,
      customersWithCoordinates,
      validationRate: totalCustomers > 0 ? (customersWithCoordinates / totalCustomers) * 100 : 0
    };
  } catch (error) {
    console.error('Failed to get customer data statistics:', error);
    return null;
  }
};

/**
 * Validate customer data structure
 * @param {Array} customerData - Array of customer objects
 * @returns {Object} - Validation result with success status and errors
 */
export const validateCustomerData = (customerData) => {
  const errors = [];

  if (!Array.isArray(customerData)) {
    return {
      success: false,
      errors: ['Customer data must be an array']
    };
  }

  customerData.forEach((customer, index) => {
    if (!customer.id) {
      errors.push(`Customer at index ${index} is missing required 'id' field`);
    }

    if (!customer.customer_name && !customer.name) {
      errors.push(`Customer at index ${index} is missing required 'customer_name' or 'name' field`);
    }

    if (!customer.lat || !customer.lng) {
      errors.push(`Customer at index ${index} is missing required 'lat' or 'lng' coordinates`);
    } else {
      const lat = parseFloat(customer.lat);
      const lng = parseFloat(customer.lng);

      if (isNaN(lat) || isNaN(lng)) {
        errors.push(`Customer at index ${index} has invalid coordinate values`);
      }
    }

    if (customer.sales === undefined || customer.sales === null) {
      errors.push(`Customer at index ${index} is missing required 'sales' field`);
    }
  });

  return {
    success: errors.length === 0,
    errors
  };
};

/**
 * Normalize customer data to ensure consistent structure
 * @param {Array} customerData - Array of customer objects
 * @returns {Array} - Normalized customer data
 */
export const normalizeCustomerData = (customerData) => {
  if (!Array.isArray(customerData)) {
    return [];
  }

  return customerData.map(customer => {
    const lat = parseFloat(customer.lat);
    const lng = parseFloat(customer.lng);

    return {
      id: customer.id,
      customer_name: customer.customer_name || customer.name || '',
      document_number: customer.document_number || '',
      lat: customer.lat,
      lng: customer.lng,
      sales: customer.sales || 0,
      location: {
        lat: isNaN(lat) ? 0 : lat,
        lng: isNaN(lng) ? 0 : lng
      }
    };
  });
};
