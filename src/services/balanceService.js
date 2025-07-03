/* eslint-disable no-undef */
/**
 * Balance History Service
 * Handles saving, loading, and managing territory balance configurations
 */

const STORAGE_KEY = 'gbalancer_saved_balances';
const MAX_SAVED_BALANCES = 50; // Limit to prevent excessive storage usage

/**
 * @typedef {Object} SavedBalance
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {Object} controls
 * @property {number} controls.numSellers
 * @property {number} controls.maxCustomersPerPolygon
 * @property {number} controls.minCustomersPerPolygon
 * @property {Array} territories
 * @property {Object} metadata
 * @property {number} metadata.totalCustomers
 * @property {string} metadata.createdAt
 * @property {string} metadata.lastModified
 * @property {string} metadata.version
 * @property {Array<string>} [tags]
 */

class BalanceService {
  /**
   * Save a new balance configuration
   */
  static saveBalance(name, description, controls, territories, totalCustomers, tags = []) {
    const balances = this.getAllBalances();

    const newBalance = {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      controls: { ...controls },
      territories: territories.map(territory => ({
        ...territory,
        customers: territory.customers.map(customer => ({ ...customer }))
      })),
      metadata: {
        totalCustomers,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0'
      },
      tags: tags.filter(tag => tag.trim().length > 0)
    };

    // Add to beginning of list (most recent first)
    balances.unshift(newBalance);

    // Limit the number of saved balances
    if (balances.length > MAX_SAVED_BALANCES) {
      balances.splice(MAX_SAVED_BALANCES);
    }

    this.saveToStorage(balances);
    return newBalance;
  }

  /**
   * Update an existing balance configuration
   */
  static updateBalance(id, updates) {
    const balances = this.getAllBalances();
    const index = balances.findIndex(balance => balance.id === id);

    if (index === -1) {
      throw new Error('Balance configuration not found');
    }

    const updatedBalance = {
      ...balances[index],
      ...updates,
      metadata: {
        ...balances[index].metadata,
        lastModified: new Date().toISOString()
      }
    };

    balances[index] = updatedBalance;
    this.saveToStorage(balances);
    return updatedBalance;
  }

  /**
   * Delete a balance configuration
   */
  static deleteBalance(id) {
    const balances = this.getAllBalances();
    const index = balances.findIndex(balance => balance.id === id);

    if (index === -1) {
      return false;
    }

    balances.splice(index, 1);
    this.saveToStorage(balances);
    return true;
  }

  /**
   * Get all saved balance configurations
   */
  static getAllBalances() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY); // eslint-disable-line no-undef
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Error loading saved balances:', error);
      return [];
    }
  }

  /**
   * Get a specific balance configuration by ID
   */
  static getBalance(id) {
    const balances = this.getAllBalances();
    return balances.find(balance => balance.id === id) || null;
  }

  /**
   * Search balance configurations
   */
  static searchBalances(query) {
    if (!query.trim()) return this.getAllBalances();

    const searchTerm = query.toLowerCase().trim();
    const balances = this.getAllBalances();

    return balances.filter(
      balance =>
        balance.name.toLowerCase().includes(searchTerm) ||
        balance.description?.toLowerCase().includes(searchTerm) ||
        balance.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get balances filtered by tags
   */
  static getBalancesByTags(tags) {
    if (!tags.length) return this.getAllBalances();

    const balances = this.getAllBalances();
    return balances.filter(balance => balance.tags?.some(tag => tags.includes(tag)));
  }

  /**
   * Export balance configuration as JSON
   */
  static exportBalance(id) {
    const balance = this.getBalance(id);
    if (!balance) {
      throw new Error('Balance configuration not found');
    }

    return JSON.stringify(balance, null, 2);
  }

  /**
   * Import balance configuration from JSON
   */
  static importBalance(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      // Validate the imported data structure
      if (!this.isValidBalanceData(data)) {
        throw new Error('Invalid balance configuration format');
      }

      // Generate new ID and update timestamps
      const importedBalance = {
        ...data,
        id: this.generateId(),
        name: `${data.name} (Imported)`,
        metadata: {
          ...data.metadata,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      const balances = this.getAllBalances();
      balances.unshift(importedBalance);

      if (balances.length > MAX_SAVED_BALANCES) {
        balances.splice(MAX_SAVED_BALANCES);
      }

      this.saveToStorage(balances);
      return importedBalance;
    } catch (error) {
      throw new Error(`Failed to import balance configuration: ${error.message}`);
    }
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats() {
    const balances = this.getAllBalances();
    const storageData = localStorage.getItem(STORAGE_KEY) || ''; // eslint-disable-line no-undef

    return {
      totalBalances: balances.length,
      storageUsed: new Blob([storageData]).size, // eslint-disable-line no-undef
      maxBalances: MAX_SAVED_BALANCES,
      oldestBalance: balances.length > 0 ? balances[balances.length - 1].metadata.createdAt : undefined,
      newestBalance: balances.length > 0 ? balances[0].metadata.createdAt : undefined
    };
  }

  /**
   * Clear all saved balances
   */
  static clearAllBalances() {
    localStorage.removeItem(STORAGE_KEY); // eslint-disable-line no-undef
  }

  /**
   * Duplicate a balance configuration
   */
  static duplicateBalance(id, newName) {
    const original = this.getBalance(id);
    if (!original) {
      throw new Error('Balance configuration not found');
    }

    const duplicate = {
      ...original,
      id: this.generateId(),
      name: newName || `${original.name} (Copy)`,
      metadata: {
        ...original.metadata,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };

    const balances = this.getAllBalances();
    balances.unshift(duplicate);

    if (balances.length > MAX_SAVED_BALANCES) {
      balances.splice(MAX_SAVED_BALANCES);
    }

    this.saveToStorage(balances);
    return duplicate;
  }

  // Private helper methods
  static generateId() {
    return `balance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static saveToStorage(balances) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(balances)); // eslint-disable-line no-undef
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Try to free up space by removing old balances
        const reducedBalances = balances.slice(0, Math.floor(MAX_SAVED_BALANCES * 0.7));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedBalances)); // eslint-disable-line no-undef
        throw new Error('Storage quota exceeded. Older balances have been removed.');
      }
      throw error;
    }
  }

  static isValidBalanceData(data) {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      data.controls &&
      typeof data.controls.numSellers === 'number' &&
      typeof data.controls.maxCustomersPerPolygon === 'number' &&
      typeof data.controls.minCustomersPerPolygon === 'number' &&
      Array.isArray(data.territories) &&
      data.metadata &&
      typeof data.metadata.totalCustomers === 'number'
    );
  }
}

export default BalanceService;
