import { defaultBalancerConfig } from '../config';
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

const handleMakeCustomers =  () => {
  return dummyCustomers.map(customer => ({
    ...customer,
    location: {
      lat: parseFloat(customer.lat.toFixed(6)),
      lng: parseFloat(customer.lng.toFixed(6))
    }
  }));
};

export   {handleMakeCustomers};
