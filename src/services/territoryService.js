import convexHull from 'convex-hull';
import { kmeans } from 'ml-kmeans';

/**
 * Generates balanced territories using K-means clustering and convex hull calculation
 * @param {Array} customers - Array of customer objects with id, name, and location
 * @param {Object} options - Configuration options
 * @param {number} options.numSellers - Number of sellers (territories)
 * @param {number} options.maxCustomersPerPolygon - Maximum customers per territory
 * @param {number} options.minCustomersPerPolygon - Minimum customers per territory
 * @returns {Object} - Either success object with territories or error object
 */
export const generateTerritories = async (customers, { numSellers, maxCustomersPerPolygon, minCustomersPerPolygon = 0 }) => {
  // Input validation
  if (!customers || customers.length === 0) {
    return { error: 'No customers provided' };
  }

  if (!numSellers || numSellers <= 0) {
    return { error: 'Number of sellers must be greater than 0' };
  }

  if (!maxCustomersPerPolygon || maxCustomersPerPolygon <= 0) {
    return { error: 'Max customers per territory must be greater than 0' };
  }

  if (minCustomersPerPolygon < 0) {
    return { error: 'Min customers per territory cannot be negative' };
  }

  if (minCustomersPerPolygon > maxCustomersPerPolygon) {
    return { error: 'Min customers per territory cannot exceed max customers per territory' };
  }

  // Check if it's mathematically possible to assign all customers
  const totalCapacity = numSellers * maxCustomersPerPolygon;
  if (totalCapacity < customers.length) {
    return {
      error: `Settings do not allow for all customers to be assigned. Need capacity for ${customers.length} customers but only have ${totalCapacity} slots. Increase sellers or max customers per territory.`
    };
  }

  try {
    // Prepare data for K-means (convert to coordinate arrays)
    const coordinates = customers.map(customer => [customer.location.lat, customer.location.lng]);

    // Perform K-means clustering
    const kmeansResult = kmeans(coordinates, numSellers, {
      initialization: 'kmeans++',
      maxIterations: 100,
      tolerance: 1e-6
    });

    // Group customers by their assigned cluster
    const customerGroups = {};
    kmeansResult.clusters.forEach((clusterIndex, customerIndex) => {
      if (!customerGroups[clusterIndex]) {
        customerGroups[clusterIndex] = [];
      }
      customerGroups[clusterIndex].push(customers[customerIndex]);
    });

    // Validate cluster sizes
    const oversizedClusters = [];
    const undersizedClusters = [];
    Object.entries(customerGroups).forEach(([clusterIndex, customerGroup]) => {
      if (customerGroup.length > maxCustomersPerPolygon) {
        oversizedClusters.push({
          territoryId: parseInt(clusterIndex) + 1,
          customerCount: customerGroup.length
        });
      }
      if (minCustomersPerPolygon > 0 && customerGroup.length < minCustomersPerPolygon && customerGroup.length > 0) {
        undersizedClusters.push({
          territoryId: parseInt(clusterIndex) + 1,
          customerCount: customerGroup.length
        });
      }
    });

    if (oversizedClusters.length > 0) {
      const oversizedDetails = oversizedClusters
        .map(cluster => `Territory ${cluster.territoryId} has ${cluster.customerCount} customers`)
        .join(', ');
      return {
        error: `Automated clustering resulted in oversized territories (${oversizedDetails}). Please adjust parameters or review customer distribution.`
      };
    }

    if (undersizedClusters.length > 0) {
      const undersizedDetails = undersizedClusters
        .map(cluster => `Territory ${cluster.territoryId} has ${cluster.customerCount} customers`)
        .join(', ');
      return {
        error: `Automated clustering resulted in undersized territories (${undersizedDetails}). Please reduce minimum customers per territory or review customer distribution.`
      };
    }

    // Generate polygons for each territory
    const territories = [];

    Object.entries(customerGroups).forEach(([clusterIndex, customerGroup]) => {
      const clusterIdx = parseInt(clusterIndex);

      if (customerGroup.length === 0) {
        return; // Skip empty clusters
      }

      let polygonPath = [];

      if (customerGroup.length === 1) {
        // Single customer: create a small circle around it
        const customer = customerGroup[0];
        const radius = 0.01; // Approximately 1km radius
        const numPoints = 8;

        for (let i = 0; i < numPoints; i++) {
          const angle = (2 * Math.PI * i) / numPoints;
          polygonPath.push({
            lat: customer.location.lat + radius * Math.cos(angle),
            lng: customer.location.lng + radius * Math.sin(angle)
          });
        }
      } else if (customerGroup.length === 2) {
        // Two customers: create a rectangle around them
        const customer1 = customerGroup[0];
        const customer2 = customerGroup[1];
        const padding = 0.005; // Small padding around the line

        const minLat = Math.min(customer1.location.lat, customer2.location.lat) - padding;
        const maxLat = Math.max(customer1.location.lat, customer2.location.lat) + padding;
        const minLng = Math.min(customer1.location.lng, customer2.location.lng) - padding;
        const maxLng = Math.max(customer1.location.lng, customer2.location.lng) + padding;

        polygonPath = [
          { lat: minLat, lng: minLng },
          { lat: maxLat, lng: minLng },
          { lat: maxLat, lng: maxLng },
          { lat: minLat, lng: maxLng }
        ];
      } else {
        // Three or more customers: use convex hull
        const clusterCoordinates = customerGroup.map(customer => [customer.location.lat, customer.location.lng]);

        try {
          const hull = convexHull(clusterCoordinates);
          polygonPath = hull.map(([lat, lng]) => ({ lat, lng }));
        } catch (hullError) {
          console.warn(`Convex hull failed for cluster ${clusterIdx}, falling back to bounding box:`, hullError);

          // Fallback: create bounding box
          const latitudes = customerGroup.map(c => c.location.lat);
          const longitudes = customerGroup.map(c => c.location.lng);
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);

          polygonPath = [
            { lat: minLat, lng: minLng },
            { lat: maxLat, lng: minLng },
            { lat: maxLat, lng: maxLng },
            { lat: minLat, lng: maxLng }
          ];
        }
      }

      // Calculate centroid from K-means result
      const centroid = {
        lat: kmeansResult.centroids[clusterIdx][0],
        lng: kmeansResult.centroids[clusterIdx][1]
      };

      territories.push({
        id: clusterIdx + 1,
        path: polygonPath,
        customers: customerGroup,
        customerCount: customerGroup.length,
        centroid
      });
    });

    return {
      success: true,
      territories: territories.sort((a, b) => a.id - b.id) // Sort by ID for consistency
    };
  } catch (error) {
    console.error('Error generating territories:', error);
    return {
      error: `Failed to generate territories: ${error.message}. Please try adjusting the parameters.`
    };
  }
};
