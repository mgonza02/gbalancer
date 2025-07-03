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
      console.log('Initial clustering resulted in undersized territories, attempting rebalancing...');
      const rebalancedGroups = await rebalanceTerritories(
        customerGroups,
        coordinates,
        kmeansResult.centroids,
        minCustomersPerPolygon,
        maxCustomersPerPolygon
      );

      if (rebalancedGroups.error) {
        return rebalancedGroups;
      }

      // Update customer groups with rebalanced result
      Object.assign(customerGroups, rebalancedGroups);

      // Re-validate after rebalancing
      const finalOversized = [];
      const finalUndersized = [];
      Object.entries(customerGroups).forEach(([clusterIndex, customerGroup]) => {
        if (customerGroup.length > maxCustomersPerPolygon) {
          finalOversized.push({
            territoryId: parseInt(clusterIndex) + 1,
            customerCount: customerGroup.length
          });
        }
        if (minCustomersPerPolygon > 0 && customerGroup.length < minCustomersPerPolygon && customerGroup.length > 0) {
          finalUndersized.push({
            territoryId: parseInt(clusterIndex) + 1,
            customerCount: customerGroup.length
          });
        }
      });

      if (finalOversized.length > 0 || finalUndersized.length > 0) {
        const issues = [];
        if (finalOversized.length > 0) {
          issues.push(`oversized: ${finalOversized.map(c => `Territory ${c.territoryId} (${c.customerCount})`).join(', ')}`);
        }
        if (finalUndersized.length > 0) {
          issues.push(`undersized: ${finalUndersized.map(c => `Territory ${c.territoryId} (${c.customerCount})`).join(', ')}`);
        }
        return {
          error: `Unable to balance territories after rebalancing attempts. Issues: ${issues.join('; ')}. Consider adjusting parameters.`
        };
      }
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

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Rebalance territories to meet minimum and maximum customer requirements
 */
async function rebalanceTerritories(customerGroups, coordinates, centroids, minCustomers, maxCustomers) {
  const maxIterations = 10;
  let iteration = 0;
  let rebalancedGroups = JSON.parse(JSON.stringify(customerGroups)); // Deep copy

  console.log('Starting territory rebalancing...');

  while (iteration < maxIterations) {
    iteration++;
    console.log(`Rebalancing iteration ${iteration}`);

    // Find undersized and oversized territories
    const undersized = [];
    const oversized = [];
    const normal = [];

    Object.entries(rebalancedGroups).forEach(([clusterIndex, customerGroup]) => {
      const info = {
        index: parseInt(clusterIndex),
        count: customerGroup.length,
        customers: customerGroup,
        centroid: centroids[parseInt(clusterIndex)]
      };

      if (customerGroup.length < minCustomers && customerGroup.length > 0) {
        undersized.push(info);
      } else if (customerGroup.length > maxCustomers) {
        oversized.push(info);
      } else if (customerGroup.length >= minCustomers) {
        normal.push(info);
      }
    });

    console.log(`Iteration ${iteration}: Undersized: ${undersized.length}, Oversized: ${oversized.length}, Normal: ${normal.length}`);

    if (undersized.length === 0 && oversized.length === 0) {
      console.log('Territory rebalancing completed successfully');
      return rebalancedGroups;
    }

    let movementsMade = false;

    // Strategy 1: Move customers from oversized to undersized territories
    for (const underTerritory of undersized) {
      const needed = minCustomers - underTerritory.count;

      for (const overTerritory of oversized) {
        if (needed <= 0) break;

        const available = overTerritory.count - maxCustomers;
        if (available <= 0) continue;

        const toMove = Math.min(needed, available);

        // Find the closest customers in oversized territory to undersized territory centroid
        const customersWithDistance = overTerritory.customers.map(customer => ({
          customer,
          distance: calculateDistance(underTerritory.centroid[0], underTerritory.centroid[1], customer.location.lat, customer.location.lng)
        }));

        customersWithDistance.sort((a, b) => a.distance - b.distance);

        // Move the closest customers
        for (let i = 0; i < toMove && i < customersWithDistance.length; i++) {
          const customerToMove = customersWithDistance[i].customer;

          // Remove from oversized territory
          const sourceIndex = rebalancedGroups[overTerritory.index].findIndex(c => c.id === customerToMove.id);
          if (sourceIndex !== -1) {
            rebalancedGroups[overTerritory.index].splice(sourceIndex, 1);
            rebalancedGroups[underTerritory.index].push(customerToMove);
            overTerritory.count--;
            underTerritory.count++;
            movementsMade = true;
          }
        }
      }
    }

    // Strategy 2: Move customers from normal territories to undersized territories
    for (const underTerritory of undersized) {
      const needed = minCustomers - underTerritory.count;

      for (const normalTerritory of normal) {
        if (needed <= 0) break;

        const available = normalTerritory.count - minCustomers;
        if (available <= 0) continue;

        const toMove = Math.min(needed, available);

        // Find the closest customers in normal territory to undersized territory centroid
        const customersWithDistance = normalTerritory.customers.map(customer => ({
          customer,
          distance: calculateDistance(underTerritory.centroid[0], underTerritory.centroid[1], customer.location.lat, customer.location.lng)
        }));

        customersWithDistance.sort((a, b) => a.distance - b.distance);

        // Move the closest customers
        for (let i = 0; i < toMove && i < customersWithDistance.length; i++) {
          const customerToMove = customersWithDistance[i].customer;

          // Remove from normal territory
          const sourceIndex = rebalancedGroups[normalTerritory.index].findIndex(c => c.id === customerToMove.id);
          if (sourceIndex !== -1) {
            rebalancedGroups[normalTerritory.index].splice(sourceIndex, 1);
            rebalancedGroups[underTerritory.index].push(customerToMove);
            normalTerritory.count--;
            underTerritory.count++;
            movementsMade = true;
          }
        }
      }
    }

    // Strategy 3: Merge very small territories with nearby territories
    const verySmall = undersized.filter(t => t.count < minCustomers / 2);
    for (const smallTerritory of verySmall) {
      if (smallTerritory.count === 0) continue;

      // Find the closest territory that can accommodate these customers
      let bestTarget = null;
      let bestDistance = Infinity;

      Object.entries(rebalancedGroups).forEach(([clusterIndex, customerGroup]) => {
        const index = parseInt(clusterIndex);
        if (index === smallTerritory.index) return;
        if (customerGroup.length + smallTerritory.count > maxCustomers) return;

        const distance = calculateDistance(
          smallTerritory.centroid[0],
          smallTerritory.centroid[1],
          centroids[index][0],
          centroids[index][1]
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestTarget = index;
        }
      });

      if (bestTarget !== null) {
        console.log(`Merging territory ${smallTerritory.index + 1} (${smallTerritory.count} customers) with territory ${bestTarget + 1}`);

        // Move all customers from small territory to target territory
        rebalancedGroups[bestTarget].push(...rebalancedGroups[smallTerritory.index]);
        rebalancedGroups[smallTerritory.index] = [];
        movementsMade = true;
      }
    }

    if (!movementsMade) {
      console.log('No beneficial movements found, stopping rebalancing');
      break;
    }
  }

  if (iteration >= maxIterations) {
    console.log('Reached maximum rebalancing iterations');
  }

  // Final validation - check if we still have constraint violations
  const finalOversized = [];
  const finalUndersized = [];

  Object.entries(rebalancedGroups).forEach(([clusterIndex, customerGroup]) => {
    if (customerGroup.length > maxCustomers) {
      finalOversized.push({
        territoryId: parseInt(clusterIndex) + 1,
        customerCount: customerGroup.length
      });
    }
    if (minCustomers > 0 && customerGroup.length < minCustomers && customerGroup.length > 0) {
      finalUndersized.push({
        territoryId: parseInt(clusterIndex) + 1,
        customerCount: customerGroup.length
      });
    }
  });

  // If there are still violations, return error with details
  if (finalOversized.length > 0 || finalUndersized.length > 0) {
    const issues = [];
    if (finalUndersized.length > 0) {
      const undersizedDetails = finalUndersized
        .map(cluster => `Territory ${cluster.territoryId} has ${cluster.customerCount} customers`)
        .join(', ');
      issues.push(`undersized territories (${undersizedDetails})`);
    }
    if (finalOversized.length > 0) {
      const oversizedDetails = finalOversized
        .map(cluster => `Territory ${cluster.territoryId} has ${cluster.customerCount} customers`)
        .join(', ');
      issues.push(`oversized territories (${oversizedDetails})`);
    }

    return {
      error: `Automated clustering resulted in ${issues.join(' and ')}. Please reduce minimum customers per territory or review customer distribution.`
    };
  }

  return rebalancedGroups;
}
