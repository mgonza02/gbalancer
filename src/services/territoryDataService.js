/**
 * Territory Data Service
 * Handles saving, loading, and managing territory data with quota management
 */

const TERRITORY_STORAGE_KEY = 'gbalancer_territory_data';
const TERRITORY_BACKUP_KEY = 'gbalancer_territory_backup';
const TERRITORY_METADATA_KEY = 'gbalancer_territory_metadata';

class TerritoryDataService {
  /**
   * Check localStorage quota and usage
   */
  static checkStorageQuota() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }

    // Estimate quota (most browsers allow 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB in bytes
    const usagePercent = (totalSize / estimatedQuota) * 100;

    return {
      totalSize,
      estimatedQuota,
      usagePercent,
      remainingSpace: estimatedQuota - totalSize,
      isNearQuota: usagePercent > 80
    };
  }

  /**
   * Compress territory data for storage
   */
  static compressData(territories) {
    return territories.map(territory => ({
      id: territory.id,
      name: territory.name,
      code: territory.code,
      zone: territory.zone,
      customerCount: territory.customerCount,
      totalSales: territory.totalSales,
      centroid: territory.centroid,
      // Reduce path precision to save space
      path: territory.path?.map(point => ({
        lat: Math.round(point.lat * 100000) / 100000,
        lng: Math.round(point.lng * 100000) / 100000
      })) || [],
      // Store only essential customer data
      customers: territory.customers?.map(customer => ({
        id: customer.id,
        name: customer.name,
        location: {
          lat: Math.round(customer.location.lat * 100000) / 100000,
          lng: Math.round(customer.location.lng * 100000) / 100000
        }
      })) || [],
      lastModified: new Date().toISOString()
    }));
  }

  /**
   * Clean up old data to free space
   */
  static cleanupOldData() {
    const keysToCheck = [
      'gbalancer_old_data',
      'gbalancer_cache_',
      'gbalancer_temp_'
    ];

    let cleanedSpace = 0;

    // Remove old cache entries
    Object.keys(localStorage).forEach(key => {
      if (keysToCheck.some(prefix => key.startsWith(prefix))) {
        const itemSize = localStorage[key].length;
        localStorage.removeItem(key);
        cleanedSpace += itemSize;
      }
    });

    console.log(`Cleaned up ${cleanedSpace} bytes of old data`);
    return cleanedSpace;
  }

  /**
   * Save territory data to localStorage with quota management
   */
  static saveTerritoryData(territories) {
    try {
      // Check current quota usage
      const quotaInfo = this.checkStorageQuota();

      // Compress data to reduce size
      const compressedTerritories = this.compressData(territories);

      const dataToSave = {
        territories: compressedTerritories,
        savedAt: new Date().toISOString(),
        version: '2.0'
      };

      const dataString = JSON.stringify(dataToSave);
      const dataSize = dataString.length;

      // If data is too large or quota is near limit, try cleanup
      if (dataSize > quotaInfo.remainingSpace || quotaInfo.isNearQuota) {
        console.warn('Storage quota exceeded, attempting cleanup...');

        // Try to clean up old data
        this.cleanupOldData();

        // Create backup of current data before overwriting
        const existingData = localStorage.getItem(TERRITORY_STORAGE_KEY);
        if (existingData) {
          try {
            localStorage.setItem(TERRITORY_BACKUP_KEY, existingData);
          } catch (backupError) {
            console.warn('Could not create backup:', backupError);
          }
        }
      }

      // Try to save the data
      localStorage.setItem(TERRITORY_STORAGE_KEY, dataString);

      // Save metadata
      const metadata = {
        lastSaved: new Date().toISOString(),
        dataSize,
        territoriesCount: territories.length,
        version: '2.0'
      };
      localStorage.setItem(TERRITORY_METADATA_KEY, JSON.stringify(metadata));

      console.log(`Territory data saved successfully (${dataSize} bytes)`);
      return true;

    } catch (error) {
      console.error('Error saving territory data:', error);

      // If quota exceeded, try emergency cleanup
      if (error.name === 'QuotaExceededError') {
        return this.handleQuotaExceeded(territories);
      }

      return false;
    }
  }

  /**
   * Handle quota exceeded error with fallback strategies
   */
  static handleQuotaExceeded(territories) {
    console.warn('Quota exceeded, trying emergency strategies...');

    try {
      // Strategy 1: Remove customer data and keep only territory boundaries
      const minimalData = territories.map(territory => ({
        id: territory.id,
        name: territory.name,
        code: territory.code,
        zone: territory.zone,
        customerCount: territory.customerCount,
        totalSales: territory.totalSales,
        centroid: territory.centroid,
        path: territory.path?.map(point => ({
          lat: Math.round(point.lat * 10000) / 10000, // Even more compression
          lng: Math.round(point.lng * 10000) / 10000
        })) || [],
        customers: [], // Remove customer data
        lastModified: new Date().toISOString()
      }));

      const minimalDataString = JSON.stringify({
        territories: minimalData,
        savedAt: new Date().toISOString(),
        version: '2.0-minimal',
        note: 'Customer data removed due to storage constraints'
      });

      localStorage.setItem(TERRITORY_STORAGE_KEY, minimalDataString);

      // Show warning to user
      console.warn('Data saved in minimal format (customer data removed to fit quota)');

      // Try to save metadata
      const metadata = {
        lastSaved: new Date().toISOString(),
        dataSize: minimalDataString.length,
        territoriesCount: territories.length,
        version: '2.0-minimal',
        warning: 'Customer data removed due to storage constraints'
      };
      localStorage.setItem(TERRITORY_METADATA_KEY, JSON.stringify(metadata));

      return {
        success: true,
        warning: 'Data saved in minimal format. Customer data was removed to fit storage quota.'
      };

    } catch (fallbackError) {
      console.error('Emergency save failed:', fallbackError);

      // Final fallback: Use session storage or clear everything
      try {
        sessionStorage.setItem(TERRITORY_STORAGE_KEY, JSON.stringify({
          territories: territories.slice(0, 5), // Keep only first 5 territories
          savedAt: new Date().toISOString(),
          version: '2.0-session',
          note: 'Saved to session storage due to quota exceeded'
        }));

        return {
          success: false,
          error: 'Data saved to session storage (temporary). Please export your data and reduce territory count.'
        };
      } catch (sessionError) {
        return {
          success: false,
          error: 'Storage quota exceeded. Please export your data and clear browser storage.'
        };
      }
    }
  }

  /**
   * Load territory data from localStorage with fallback support
   */
  static loadTerritoryData() {
    try {
      // Try primary storage first
      let stored = localStorage.getItem(TERRITORY_STORAGE_KEY);
      let isFromSession = false;

      // Fallback to session storage if needed
      if (!stored) {
        stored = sessionStorage.getItem(TERRITORY_STORAGE_KEY);
        isFromSession = true;
      }

      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Check version for backward compatibility
      const version = parsed.version || '1.0';

      if (isFromSession) {
        console.warn('Data loaded from session storage (temporary)');
      }

      if (version.includes('minimal')) {
        console.warn('Data loaded in minimal format (customer data may be missing)');
      }

      return parsed.territories || null;
    } catch (error) {
      console.warn('Error loading territory data:', error);

      // Try to load from backup
      try {
        const backup = localStorage.getItem(TERRITORY_BACKUP_KEY);
        if (backup) {
          console.log('Loading from backup...');
          const parsed = JSON.parse(backup);
          return parsed.territories || null;
        }
      } catch (backupError) {
        console.warn('Backup data also corrupted:', backupError);
      }

      return null;
    }
  }

  /**
   * Get storage metadata and health info
   */
  static getStorageInfo() {
    try {
      const metadata = JSON.parse(localStorage.getItem(TERRITORY_METADATA_KEY) || '{}');
      const quotaInfo = this.checkStorageQuota();

      return {
        ...metadata,
        ...quotaInfo,
        hasBackup: !!localStorage.getItem(TERRITORY_BACKUP_KEY),
        hasSessionData: !!sessionStorage.getItem(TERRITORY_STORAGE_KEY)
      };
    } catch (error) {
      return {
        error: 'Could not retrieve storage info',
        ...this.checkStorageQuota()
      };
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
   * Clear all territory data including backups
   */
  static clearTerritoryData() {
    try {
      localStorage.removeItem(TERRITORY_STORAGE_KEY);
      localStorage.removeItem(TERRITORY_BACKUP_KEY);
      localStorage.removeItem(TERRITORY_METADATA_KEY);
      sessionStorage.removeItem(TERRITORY_STORAGE_KEY);

      // Also clean up any old cache entries
      this.cleanupOldData();

      console.log('All territory data cleared successfully');
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
