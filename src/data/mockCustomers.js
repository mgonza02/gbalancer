import { defaultBalancerConfig } from '../config';
import { normalizeCustomerData, saveCustomerData } from '../services/customerDataService';
import { dummyCustomers } from './dummy-customers';

// --- Helper function to generate a random coordinate within a bounding box ---
const getRandomCoordinates = box => {
  return {
    lat: box.minLat + Math.random() * (box.maxLat - box.minLat),
    lng: box.minLng + Math.random() * (box.maxLng - box.minLng)
  };
};

// --- Bounding box for San Francisco ---
const sfBox = {
  minLat: 37.7,
  maxLat: 37.81,
  minLng: -122.52,
  maxLng: -122.36
};

const salesAverages = {
  min: 1000,
  max: 5000
};

// --- Generate mock customers ---
const mockCustomersDraft = Array.from({ length: defaultBalancerConfig.customers }, (_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  location: getRandomCoordinates(sfBox),
  sales: Math.floor(Math.random() * (salesAverages.max - salesAverages.min + 1)) + salesAverages.min
}));

const handleMakeCustomers = () => {
  const validCustomers = dummyCustomers.reduce((acc, customer) => {
    // Skip customers without valid lat/lng coordinates
    if (!customer.lat || !customer.lng) {
      return acc;
    }

    const lat = parseFloat(customer.lat);
    const lng = parseFloat(customer.lng);

    // Skip customers with invalid coordinate values or zero coordinates
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return acc;
    }

    acc.push({
      ...customer,
      location: {
        lat: parseFloat(lat.toFixed(8)),
        lng: parseFloat(lng.toFixed(8))
      }
    });

    return acc;
  }, []);

  // Normalize the customer data
  const normalizedCustomers = normalizeCustomerData(validCustomers);

  // Save to localStorage
  saveCustomerData(normalizedCustomers);

  return normalizedCustomers;
};

export { handleMakeCustomers };
