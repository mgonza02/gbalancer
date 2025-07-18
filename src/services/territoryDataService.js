/**
 * Territory Data Service
 * Handles saving, loading, and managing territory data with editing capabilities
 */

const TERRITORY_STORAGE_KEY = 'gbalancer_territory_data';

class TerritoryDataService {
  /**
   * Save territory data to localStorage
   */
  static saveTerritoryData(territories) {
    try {
      const dataToSave = {
        territories: territories.map(territory => ({
          id: territory.id,
          name: territory.name,
          code: territory.code,
          zone: territory.zone,
          customerCount: territory.customerCount,
          totalSales: territory.totalSales,
          centroid: territory.centroid,
          path: territory.path,
          customers: territory.customers,
          lastModified: new Date().toISOString()
        })),
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(TERRITORY_STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('Error saving territory data:', error);
      return false;
    }
  }

  /**
   * Load territory data from localStorage
   */
  static loadTerritoryData() {
    try {
      const stored = localStorage.getItem(TERRITORY_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed.territories || null;
    } catch (error) {
      console.warn('Error loading territory data:', error);
      return null;
    }
  }

  /**
   * Check if territory data exists in storage
   */
  static hasTerritoryData() {
    try {
      const stored = localStorage.getItem(TERRITORY_STORAGE_KEY);
      return !!stored;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all territory data
   */
  static clearTerritoryData() {
    try {
      localStorage.removeItem(TERRITORY_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing territory data:', error);
      return false;
    }
  }

  /**
   * Update specific territory fields
   */
  static updateTerritoryField(territories, territoryId, field, value) {
    return territories.map(territory =>
      territory.id === territoryId
        ? { ...territory, [field]: value, lastModified: new Date().toISOString() }
        : territory
    );
  }

  /**
   * Export territory data as JSON
   */
  static exportTerritoryData(territories) {
    try {
      const exportData = {
        territories: territories,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting territory data:', error);
      return null;
    }
  }

  /**
   * Import territory data from JSON
   */
  static importTerritoryData(jsonData) {
    try {
      const parsed = JSON.parse(jsonData);

      if (!parsed.territories || !Array.isArray(parsed.territories)) {
        throw new Error('Invalid territory data format');
      }

      return parsed.territories;
    } catch (error) {
      console.error('Error importing territory data:', error);
      throw new Error(`Failed to import territory data: ${error.message}`);
    }
  }

  /**
   * Get territory statistics
   */
  static getTerritoryStats(territories) {
    if (!territories || territories.length === 0) {
      return {
        totalTerritories: 0,
        totalCustomers: 0,
        totalSales: 0,
        averageCustomersPerTerritory: 0,
        averageSalesPerTerritory: 0,
        zones: []
      };
    }

    const totalCustomers = territories.reduce((sum, t) => sum + (t.customerCount || 0), 0);
    const totalSales = territories.reduce((sum, t) => sum + (t.totalSales || 0), 0);
    const zones = [...new Set(territories.map(t => t.zone).filter(Boolean))];

    return {
      totalTerritories: territories.length,
      totalCustomers,
      totalSales,
      averageCustomersPerTerritory: Math.round(totalCustomers / territories.length),
      averageSalesPerTerritory: Math.round(totalSales / territories.length),
      zones: zones.sort()
    };
  }
}

export default TerritoryDataService;
