import { useMemo } from 'react';
import { settings } from '../config';

/**
 * Custom hook for territory controls business logic
 * Implements Single Responsibility Principle by separating business logic from UI
 */
export function useControls(controls, customers) {
  const { currencySymbol } = settings;

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalCustomers = customers?.length || 0;
    const totalSales = customers?.reduce((sum, customer) => sum + (customer.sales || 0), 0) || 0;
    const totalCapacity = (controls.minTerritories || 0) * (controls.maxCustomersPerPolygon || 0);
    const minCapacity = (controls.numSellers || 0) * (controls.minCustomersPerPolygon || 0);
    const minTerritories = (controls.numSellers || 0) * (controls.minTerritoriesPerSeller || 0);
    const maxSalesCapacity = controls.maxSalesPerTerritory > 0 ? (controls.numSellers || 0) * controls.maxSalesPerTerritory : 0;
    const minSalesRequired = controls.minSalesPerTerritory > 0 ? (controls.numSellers || 0) * controls.minSalesPerTerritory : 0;

    // Calculate utilization rates
    const customerUtilization = totalCapacity > 0 ? (totalCustomers / totalCapacity) * 100 : 0;
    const salesUtilization = maxSalesCapacity > 0 ? (totalSales / maxSalesCapacity) * 100 : 0;

    return {
      totalCustomers,
      totalSales,
      totalCapacity,
      minCapacity,
      minTerritories,
      maxSalesCapacity,
      minSalesRequired,
      customerUtilization,
      salesUtilization,
      currencySymbol
    };
  }, [controls, customers, currencySymbol]);

  // Validation logic
  const validation = useMemo(() => {
    const {
      totalCustomers,
      totalSales,
      totalCapacity,
      minCapacity,
      minTerritories,
      maxSalesCapacity,
      minSalesRequired
    } = metrics;

    const isValid =
      totalCapacity >= totalCustomers &&
      controls.numSellers > 0 &&
      controls.maxCustomersPerPolygon > 0 &&
      controls.minCustomersPerPolygon >= 0 &&
      controls.minCustomersPerPolygon <= controls.maxCustomersPerPolygon &&
      minCapacity <= totalCustomers &&
      controls.minTerritoriesPerSeller > 0 &&
      controls.territorySize > 0 &&
      controls.maxTerritories > 0 &&
      controls.maxSalesPerTerritory > 0 &&
      (controls.minSalesPerTerritory === 0 || controls.minSalesPerTerritory > 0) &&
      (controls.minSalesPerTerritory === 0 || controls.minSalesPerTerritory <= controls.maxSalesPerTerritory) &&
      minTerritories <= controls.maxTerritories &&
      (maxSalesCapacity === 0 || maxSalesCapacity >= totalSales) &&
      (minSalesRequired === 0 || minSalesRequired <= totalSales);

    const getValidationMessage = () => {
      if (totalCapacity < totalCustomers) {
        return '⚠ Insufficient max capacity - increase sellers or max customers';
      }
      if (maxSalesCapacity > 0 && maxSalesCapacity < totalSales) {
        return '⚠ Insufficient sales capacity - increase sellers or max sales per territory';
      }
      if (minSalesRequired > 0 && minSalesRequired > totalSales) {
        return '⚠ Total sales insufficient for minimum requirements - reduce min sales per territory or increase customer sales';
      }
      if (controls.minCustomersPerPolygon > controls.maxCustomersPerPolygon) {
        return '⚠ Minimum customers cannot exceed maximum customers';
      }
      if (controls.minSalesPerTerritory > 0 && controls.maxSalesPerTerritory > 0 && controls.minSalesPerTerritory > controls.maxSalesPerTerritory) {
        return '⚠ Minimum sales per territory cannot exceed maximum sales per territory';
      }
      if (minCapacity > totalCustomers) {
        return '⚠ Minimum requirements exceed total customers - reduce min customers or sellers';
      }
      if (minTerritories > controls.maxTerritories) {
        return '⚠ Minimum territories required exceed max territories limit';
      }
      if (!controls.minTerritoriesPerSeller || controls.minTerritoriesPerSeller <= 0) {
        return '⚠ Minimum territories per seller must be greater than 0';
      }
      if (!controls.territorySize || controls.territorySize <= 0) {
        return '⚠ Territory size must be greater than 0';
      }
      if (!controls.maxTerritories || controls.maxTerritories <= 0) {
        return '⚠ Maximum territories must be greater than 0';
      }
      if (!controls.maxSalesPerTerritory || controls.maxSalesPerTerritory <= 0) {
        return '⚠ Maximum sales per territory must be greater than 0';
      }
      return '⚠ Please check configuration';
    };

    return {
      isValid,
      validationMessage: getValidationMessage()
    };
  }, [controls, metrics]);

  return {
    metrics,
    validation,
    currencySymbol
  };
}

/**
 * Custom hook for input change handling
 * Implements Open/Closed Principle by allowing extension without modification
 */
export function useControlsInput(controls, onControlsChange) {
  const handleInputChange = (field, value) => {
    onControlsChange({
      ...controls,
      [field]: value,
      minTerritories: field === 'numSellers'
        ? ((controls.minTerritoriesPerSeller || 0) * value)
        : (field === "minTerritoriesPerSeller"
          ? (controls.numSellers || 0) * value
          : controls.minTerritories)
    });
  };

  return { handleInputChange };
}
