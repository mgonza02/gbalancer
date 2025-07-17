import convexHull from 'convex-hull';
import { kmeans } from 'ml-kmeans';

/**
 * Generates balanced territories using K-means clustering and convex hull calculation
 * @param {Array} customers - Array of customer objects with id, name, location, and sales
 * @param {Object} options - Configuration options
 * @param {number} options.numSellers - Number of sellers (territories)
 * @param {number} options.maxCustomersPerPolygon - Maximum customers per territory
 * @param {number} options.minCustomersPerPolygon - Minimum customers per territory
 * @param {number} options.maxSalesPerTerritory - Maximum sales per territory
 * @param {number} options.minSalesPerTerritory - Minimum sales per territory
 * @param {number} options.minTerritoriesPerSeller - Minimum territories per seller
 * @param {number} options.territorySize - Territory size (geographic area)
 * @param {number} options.maxTerritories - Maximum total territories
 * @returns {Object} - Either success object with territories or error object
 */
export const generateTerritories = async (customers, {
  minTerritories,
  maxCustomersPerPolygon,
  minCustomersPerPolygon = 0,
  maxSalesPerTerritory = 0,
  minSalesPerTerritory = 0,
  minTerritoriesPerSeller = 0,
  territorySize = 0,
  maxTerritories = 0
}) => {
  // Input validation
  if (!customers || customers.length === 0) {
    return { error: 'No customers provided' };
  }

  if (!minTerritories || minTerritories <= 0) {
    return { error: 'Number of territories must be greater than 0' };
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

  if (maxSalesPerTerritory && maxSalesPerTerritory <= 0) {
    return { error: 'Max sales per territory must be greater than 0' };
  }

  if (minSalesPerTerritory && minSalesPerTerritory <= 0) {
    return { error: 'Min sales per territory must be greater than 0' };
  }

  if (minSalesPerTerritory > 0 && maxSalesPerTerritory > 0 && minSalesPerTerritory > maxSalesPerTerritory) {
    return { error: 'Min sales per territory cannot exceed max sales per territory' };
  }

  if (minTerritoriesPerSeller && minTerritoriesPerSeller <= 0) {
    return { error: 'Min territories per seller must be greater than 0' };
  }

  if (territorySize && territorySize <= 0) {
    return { error: 'Territory size must be greater than 0' };
  }

  if (maxTerritories && maxTerritories <= 0) {
    return { error: 'Max territories must be greater than 0' };
  }

  // Validate that customers have sales data if sales constraints are specified
  if (maxSalesPerTerritory > 0 || minSalesPerTerritory > 0) {
    const customersWithoutSales = customers.filter(customer => !customer.sales || customer.sales <= 0);
    if (customersWithoutSales.length > 0) {
      return { error: 'All customers must have valid sales data when sales constraints are specified' };
    }
  }

  // Check if it's mathematically possible to assign all customers
  const totalCapacity = minTerritories * maxCustomersPerPolygon;
  if (totalCapacity < customers.length) {
    return {
      error: `Settings do not allow for all customers to be assigned. Need capacity for ${customers.length} customers but only have ${totalCapacity} slots. Increase sellers or max customers per territory.`
    };
  }

  try {
    // Prepare data for K-means (convert to coordinate arrays)
    const coordinates = customers.map(customer => [customer.location.lat, customer.location.lng]);

    // Perform K-means clustering
    const kmeansResult = kmeans(coordinates, minTerritories, {
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

    // Validate cluster sizes and sales constraints
    const oversizedClusters = [];
    const undersizedClusters = [];
    const oversalesClusters = [];
    const undersalesClusters = [];

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

      // Check sales constraints if sales limits are specified
      if (customerGroup.length > 0) {
        const totalSales = customerGroup.reduce((sum, customer) => sum + (customer.sales || 0), 0);

        if (maxSalesPerTerritory > 0 && totalSales > maxSalesPerTerritory) {
          oversalesClusters.push({
            territoryId: parseInt(clusterIndex) + 1,
            totalSales: totalSales,
            customerCount: customerGroup.length
          });
        }

        if (minSalesPerTerritory > 0 && totalSales < minSalesPerTerritory) {
          undersalesClusters.push({
            territoryId: parseInt(clusterIndex) + 1,
            totalSales: totalSales,
            customerCount: customerGroup.length
          });
        }
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

    if (oversalesClusters.length > 0) {
      const oversalesDetails = oversalesClusters
        .map(cluster => `Territory ${cluster.territoryId} has $${cluster.totalSales.toLocaleString()} in sales (${cluster.customerCount} customers)`)
        .join(', ');
      return {
        error: `Automated clustering resulted in territories exceeding sales limits (${oversalesDetails}). Max allowed: $${maxSalesPerTerritory.toLocaleString()}. Please adjust parameters or review customer distribution.`
      };
    }

    if (undersalesClusters.length > 0) {
      const undersalesDetails = undersalesClusters
        .map(cluster => `Territory ${cluster.territoryId} has $${cluster.totalSales.toLocaleString()} in sales (${cluster.customerCount} customers)`)
        .join(', ');
      return {
        error: `Automated clustering resulted in territories below minimum sales requirements (${undersalesDetails}). Min required: $${minSalesPerTerritory.toLocaleString()}. Please adjust parameters or review customer distribution.`
      };
    }

    if (undersizedClusters.length > 0 || undersalesClusters.length > 0) {
      console.log('Initial clustering resulted in undersized territories or sales imbalances, attempting rebalancing...');
      const rebalancedGroups = await rebalanceTerritories(
        customerGroups,
        coordinates,
        kmeansResult.centroids,
        minCustomersPerPolygon,
        maxCustomersPerPolygon,
        maxSalesPerTerritory,
        minSalesPerTerritory
      );

      if (rebalancedGroups.error) {
        return rebalancedGroups;
      }

      // Update customer groups with rebalanced result
      Object.assign(customerGroups, rebalancedGroups);

      // Re-validate after rebalancing
      const finalOversized = [];
      const finalUndersized = [];
      const finalOversales = [];
      const finalUndersales = [];

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

        // Check sales constraints after rebalancing
        if (customerGroup.length > 0) {
          const totalSales = customerGroup.reduce((sum, customer) => sum + (customer.sales || 0), 0);

          if (maxSalesPerTerritory > 0 && totalSales > maxSalesPerTerritory) {
            finalOversales.push({
              territoryId: parseInt(clusterIndex) + 1,
              totalSales: totalSales,
              customerCount: customerGroup.length
            });
          }

          if (minSalesPerTerritory > 0 && totalSales < minSalesPerTerritory) {
            finalUndersales.push({
              territoryId: parseInt(clusterIndex) + 1,
              totalSales: totalSales,
              customerCount: customerGroup.length
            });
          }
        }
      });

      if (finalOversized.length > 0 || finalUndersized.length > 0 || finalOversales.length > 0 || finalUndersales.length > 0) {
        const issues = [];
        if (finalOversized.length > 0) {
          issues.push(`oversized: ${finalOversized.map(c => `Territory ${c.territoryId} (${c.customerCount})`).join(', ')}`);
        }
        if (finalUndersized.length > 0) {
          issues.push(`undersized: ${finalUndersized.map(c => `Territory ${c.territoryId} (${c.customerCount})`).join(', ')}`);
        }
        if (finalOversales.length > 0) {
          issues.push(`over sales limit: ${finalOversales.map(c => `Territory ${c.territoryId} ($${c.totalSales.toLocaleString()})`).join(', ')}`);
        }
        if (finalUndersales.length > 0) {
          issues.push(`under sales limit: ${finalUndersales.map(c => `Territory ${c.territoryId} ($${c.totalSales.toLocaleString()})`).join(', ')}`);
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

      // Calculate total sales for the territory
      const totalSales = customerGroup.reduce((sum, customer) => sum + (customer.sales || 0), 0);

      territories.push({
        id: clusterIdx + 1,
        path: polygonPath,
        customers: customerGroup,
        customerCount: customerGroup.length,
        totalSales: totalSales,
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
 * Rebalance territories to meet minimum and maximum customer requirements and sales constraints
 */
async function rebalanceTerritories(customerGroups, coordinates, centroids, minCustomers, maxCustomers, maxSales = 0, minSales = 0) {
  const maxIterations = 10;
  let iteration = 0;
  let rebalancedGroups = JSON.parse(JSON.stringify(customerGroups)); // Deep copy

  console.log('Starting territory rebalancing...');

  while (iteration < maxIterations) {
    iteration++;
    console.log(`Rebalancing iteration ${iteration}`);

    // Find undersized, oversized, over-sales, and under-sales territories
    const undersized = [];
    const oversized = [];
    const oversales = [];
    const undersales = [];
    const normal = [];

    Object.entries(rebalancedGroups).forEach(([clusterIndex, customerGroup]) => {
      const totalSales = customerGroup.reduce((sum, customer) => sum + (customer.sales || 0), 0);

      const info = {
        index: parseInt(clusterIndex),
        count: customerGroup.length,
        totalSales: totalSales,
        customers: customerGroup,
        centroid: centroids[parseInt(clusterIndex)]
      };

      if (customerGroup.length < minCustomers && customerGroup.length > 0) {
        undersized.push(info);
      } else if (customerGroup.length > maxCustomers) {
        oversized.push(info);
      } else if (maxSales > 0 && totalSales > maxSales) {
        oversales.push(info);
      } else if (minSales > 0 && totalSales < minSales && customerGroup.length > 0) {
        undersales.push(info);
      } else if (customerGroup.length >= minCustomers) {
        normal.push(info);
      }
    });

    console.log(`Iteration ${iteration}: Undersized: ${undersized.length}, Oversized: ${oversized.length}, Over-sales: ${oversales.length}, Under-sales: ${undersales.length}, Normal: ${normal.length}`);

    if (undersized.length === 0 && oversized.length === 0 && oversales.length === 0 && undersales.length === 0) {
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

        // Move the closest customers, checking sales constraints
        for (let i = 0; i < toMove && i < customersWithDistance.length; i++) {
          const customerToMove = customersWithDistance[i].customer;

          // Check if adding this customer would exceed sales limit
          if (maxSales > 0) {
            const newUnderSales = underTerritory.totalSales + (customerToMove.sales || 0);
            if (newUnderSales > maxSales) {
              continue; // Skip this customer if it would exceed sales limit
            }
          }

          // Remove from oversized territory
          const sourceIndex = rebalancedGroups[overTerritory.index].findIndex(c => c.id === customerToMove.id);
          if (sourceIndex !== -1) {
            rebalancedGroups[overTerritory.index].splice(sourceIndex, 1);
            rebalancedGroups[underTerritory.index].push(customerToMove);
            overTerritory.count--;
            overTerritory.totalSales -= (customerToMove.sales || 0);
            underTerritory.count++;
            underTerritory.totalSales += (customerToMove.sales || 0);
            movementsMade = true;
          }
        }
      }
    }

    // Strategy 2: Move customers from over-sales territories to territories with sales capacity
    for (const overSalesTerritory of oversales) {
      const salesExcess = overSalesTerritory.totalSales - maxSales;

      // Find customers with highest sales to move first
      const customersWithSales = overSalesTerritory.customers.map(customer => ({
        customer,
        sales: customer.sales || 0
      }));

      customersWithSales.sort((a, b) => b.sales - a.sales);

      for (const targetTerritory of [...normal, ...undersized]) {
        if (salesExcess <= 0) break;
        if (targetTerritory.count >= maxCustomers) continue;

        const salesCapacity = maxSales > 0 ? maxSales - targetTerritory.totalSales : Infinity;
        if (salesCapacity <= 0) continue;

        // Move customers that fit within sales capacity
        for (const customerWithSales of customersWithSales) {
          const customer = customerWithSales.customer;
          if (customer.sales <= salesCapacity && targetTerritory.count < maxCustomers) {
            // Remove from over-sales territory
            const sourceIndex = rebalancedGroups[overSalesTerritory.index].findIndex(c => c.id === customer.id);
            if (sourceIndex !== -1) {
              rebalancedGroups[overSalesTerritory.index].splice(sourceIndex, 1);
              rebalancedGroups[targetTerritory.index].push(customer);
              overSalesTerritory.count--;
              overSalesTerritory.totalSales -= (customer.sales || 0);
              targetTerritory.count++;
              targetTerritory.totalSales += (customer.sales || 0);
              movementsMade = true;
              break;
            }
          }
        }
      }
    }

    // Strategy 3: Move customers from normal territories to undersized territories
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

        // Move the closest customers, checking sales constraints
        for (let i = 0; i < toMove && i < customersWithDistance.length; i++) {
          const customerToMove = customersWithDistance[i].customer;

          // Check if adding this customer would exceed sales limit
          if (maxSales > 0) {
            const newUnderSales = underTerritory.totalSales + (customerToMove.sales || 0);
            if (newUnderSales > maxSales) {
              continue; // Skip this customer if it would exceed sales limit
            }
          }

          // Remove from normal territory
          const sourceIndex = rebalancedGroups[normalTerritory.index].findIndex(c => c.id === customerToMove.id);
          if (sourceIndex !== -1) {
            rebalancedGroups[normalTerritory.index].splice(sourceIndex, 1);
            rebalancedGroups[underTerritory.index].push(customerToMove);
            normalTerritory.count--;
            normalTerritory.totalSales -= (customerToMove.sales || 0);
            underTerritory.count++;
            underTerritory.totalSales += (customerToMove.sales || 0);
            movementsMade = true;
          }
        }
      }
    }

    // Strategy 4: Move customers from normal/oversized territories to undersales territories
    for (const underSalesTerritory of undersales) {
      const salesNeeded = minSales - underSalesTerritory.totalSales;

      for (const sourceTerritory of [...normal, ...oversized]) {
        if (salesNeeded <= 0) break;
        if (underSalesTerritory.count >= maxCustomers) break;

        // Find customers with highest sales to move
        const customersWithSales = sourceTerritory.customers.map(customer => ({
          customer,
          sales: customer.sales || 0,
          distance: calculateDistance(underSalesTerritory.centroid[0], underSalesTerritory.centroid[1], customer.location.lat, customer.location.lng)
        }));

        // Sort by sales descending, then by distance ascending
        customersWithSales.sort((a, b) => b.sales - a.sales || a.distance - b.distance);

        // Move customers that help reach minimum sales
        for (const customerWithSales of customersWithSales) {
          const customer = customerWithSales.customer;

          // Check if source territory can spare this customer
          if (sourceTerritory.count <= minCustomers) break;

          // Check if adding this customer would exceed max sales limit
          if (maxSales > 0) {
            const newUnderSales = underSalesTerritory.totalSales + (customer.sales || 0);
            if (newUnderSales > maxSales) continue;
          }

          // Check if source territory would fall below min sales by losing this customer
          if (minSales > 0) {
            const sourceNewSales = sourceTerritory.totalSales - (customer.sales || 0);
            if (sourceNewSales < minSales) continue;
          }

          // Remove from source territory
          const sourceIndex = rebalancedGroups[sourceTerritory.index].findIndex(c => c.id === customer.id);
          if (sourceIndex !== -1) {
            rebalancedGroups[sourceTerritory.index].splice(sourceIndex, 1);
            rebalancedGroups[underSalesTerritory.index].push(customer);
            sourceTerritory.count--;
            sourceTerritory.totalSales -= (customer.sales || 0);
            underSalesTerritory.count++;
            underSalesTerritory.totalSales += (customer.sales || 0);
            movementsMade = true;

            // Check if we've reached minimum sales
            if (underSalesTerritory.totalSales >= minSales) break;
          }
        }
      }
    }

    // Strategy 5: Merge very small territories with nearby territories
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

        // Check sales constraint
        if (maxSales > 0) {
          const currentSales = customerGroup.reduce((sum, customer) => sum + (customer.sales || 0), 0);
          const additionalSales = smallTerritory.totalSales;
          if (currentSales + additionalSales > maxSales) return;
        }

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
        console.log(`Merging territory ${smallTerritory.index + 1} (${smallTerritory.count} customers, $${smallTerritory.totalSales.toLocaleString()}) with territory ${bestTarget + 1}`);

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
  const finalOversales = [];
  const finalUndersales = [];

  Object.entries(rebalancedGroups).forEach(([clusterIndex, customerGroup]) => {
    const totalSales = customerGroup.reduce((sum, customer) => sum + (customer.sales || 0), 0);

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
    if (maxSales > 0 && totalSales > maxSales) {
      finalOversales.push({
        territoryId: parseInt(clusterIndex) + 1,
        totalSales: totalSales
      });
    }
    if (minSales > 0 && totalSales < minSales && customerGroup.length > 0) {
      finalUndersales.push({
        territoryId: parseInt(clusterIndex) + 1,
        totalSales: totalSales
      });
    }
  });

  // If there are still violations, return error with details
  if (finalOversized.length > 0 || finalUndersized.length > 0 || finalOversales.length > 0 || finalUndersales.length > 0) {
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
    if (finalOversales.length > 0) {
      const oversalesDetails = finalOversales
        .map(cluster => `Territory ${cluster.territoryId} has $${cluster.totalSales.toLocaleString()} in sales`)
        .join(', ');
      issues.push(`territories exceeding sales limits (${oversalesDetails})`);
    }
    if (finalUndersales.length > 0) {
      const undersalesDetails = finalUndersales
        .map(cluster => `Territory ${cluster.territoryId} has $${cluster.totalSales.toLocaleString()} in sales`)
        .join(', ');
      issues.push(`territories below minimum sales requirements (${undersalesDetails})`);
    }

    return {
      error: `Automated clustering resulted in ${issues.join(' and ')}. Please reduce minimum customers per territory or adjust sales limits.`
    };
  }

  return rebalancedGroups;
}
