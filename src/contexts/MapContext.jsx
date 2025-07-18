import { useJsApiLoader } from '@react-google-maps/api';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { settings } from '../config';
import TerritoryDataService from '../services/territoryDataService';

const LIBRARIES = ['geometry', 'places', 'drawing'];

const MapContext = createContext();

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapContextProvider');
  }
  return context;
};

/**
 * Map Context Provider
 * Implements Single Responsibility Principle by managing map state and instances
 */
export const MapContextProvider = ({
  children,
  customers,
  territories,
  territoryColors,
  mapInstance: externalMapInstance,
  drawingManager: externalDrawingManager,
  onTerritoryUpdate,
  onTerritoryCreate,
  onTerritoryDelete
}) => {
  // Core map state
  const [mapInstance, setMapInstance] = useState(externalMapInstance || null);
  const [activePolygon, setActivePolygon] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [hoveredPolygon, setHoveredPolygon] = useState(null);
  const [polygonRefs, setPolygonRefs] = useState(new Map());
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const mapRef = useRef(null);

  // Drawing state
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingManager, setDrawingManager] = useState(externalDrawingManager || null);
  const [newPolygon, setNewPolygon] = useState(null);

  // Refs for stable access to current values in event handlers
  const onTerritoryCreateRef = useRef(onTerritoryCreate);
  const territoriesRef = useRef(territories);
  const defaultTerritoryColorsRef = useRef(territoryColors);
  const customersRef = useRef(customers);

  // Update refs when props change
  useEffect(() => {
    onTerritoryCreateRef.current = onTerritoryCreate;
  }, [onTerritoryCreate]);

  useEffect(() => {
    territoriesRef.current = territories;
  }, [territories]);

  useEffect(() => {
    defaultTerritoryColorsRef.current = territoryColors;
  }, [territoryColors]);

  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);


  // Modern color palette with better contrast
  const defaultTerritoryColors = useMemo(
    () => territoryColors || [
      '#E53E3E', '#38A169', '#3182CE', '#805AD5', '#D69E2E', '#DD6B20',
      '#319795', '#C53030', '#9F7AEA', '#4A5568', '#2B6CB0', '#2F855A',
      '#B794F6', '#F56565', '#48BB78', '#ED8936', '#63B3ED', '#A0AEC0',
      '#CBD5E0', '#EDF2F7', '#F7FAFC', '#E2E8F0', '#Cbd5e0', '#A0AEC0',
      '#718096', '#A0AEC0', '#CBD5E0', '#EDF2F7', '#F7FAFC', '#E2E8F0'
    ],
    [territoryColors]
  );


  const calculateCentroid = useCallback(path => {
    if (!path || path.length === 0) return { lat: 0, lng: 0 };

    let lat = 0;
    let lng = 0;

    path.forEach(point => {
      lat += point.lat;
      lng += point.lng;
    });

    return {
      lat: lat / path.length,
      lng: lng / path.length
    };
  }, []);

  const calculatePolygonArea = useCallback(path => {
    if (!path || path.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < path.length; i++) {
      const j = (i + 1) % path.length;
      area += path[i].lat * path[j].lng;
      area -= path[j].lat * path[i].lng;
    }
    return Math.abs(area) / 2;
  }, []);

  const polygonAreaToKm2 = useCallback(area => {
    return (area * 12100).toFixed(2);
  }, []);

  // Polygon click handler
  const handlePolygonClick = useCallback((territory) => {
    console.log('Polygon clicked in MapContext:', territory);
    setActivePolygon(territory);
    // Close customer info if open
    setSelectedCustomer(null);
  }, []);

  // Customer marker click handler
  const handleMarkerClick = useCallback((customer) => {
    console.log('Marker clicked in MapContext:', customer);
    setSelectedCustomer(customer);
    // Close polygon info if open
    setActivePolygon(null);
  }, []);

  // Polygon drag tracking functions
  const startPolygonDrag = useCallback((polygonRef, initialPosition) => {
    setPolygonDragState({
      isDragging: true,
      dragStartTime: Date.now(),
      dragStartPosition: initialPosition
    });

    console.log('Polygon drag started at:', initialPosition);
  }, []);
  // Update map instance when external prop changes
  useEffect(() => {
    if (externalMapInstance) {
      setMapInstance(externalMapInstance);
    }
  }, [externalMapInstance]);

  // Update drawing manager when external prop changes
  useEffect(() => {
    if (externalDrawingManager) {
      setDrawingManager(externalDrawingManager);
    }
  }, [externalDrawingManager]);

  // Handle polygon completion events
  useEffect(() => {
    if (!drawingManager || !window.google?.maps?.event) return;

    console.log('Setting up polygon completion handler in MapContext');

    // Remove any existing listeners first to prevent duplicates
    window.google.maps.event.clearListeners(drawingManager, 'polygoncomplete');

    const handlePolygonComplete = (polygon) => {
      console.log('Polygon completed in MapContext');

      // Stop drawing mode immediately
      drawingManager.setDrawingMode(null);
      setDrawingMode(false);

      // Get the polygon path
      const path = polygon.getPath();
      const pathArray = [];

      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        pathArray.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }

      console.log('Polygon path extracted:', pathArray.length, 'points');

      // Don't store the Google Maps polygon object to avoid circular references
      // Instead, just use a flag to indicate a polygon was created
      setNewPolygon(true);

      // Calculate territory data
      const centroid = calculateCentroid(pathArray);
      const area = calculatePolygonArea(pathArray);

      // Find customers inside the polygon
      const currentCustomers = customersRef.current || [];
      console.log('Available customers for polygon detection:', currentCustomers.length);

      if (currentCustomers.length > 0) {
        console.log('First customer sample:', {
          id: currentCustomers[0].id,
          name: currentCustomers[0].customer_name || currentCustomers[0].name,
          location: currentCustomers[0].location
        });
      }

      console.log('Polygon bounds:', {
        minLat: Math.min(...pathArray.map(p => p.lat)),
        maxLat: Math.max(...pathArray.map(p => p.lat)),
        minLng: Math.min(...pathArray.map(p => p.lng)),
        maxLng: Math.max(...pathArray.map(p => p.lng))
      });

      const customersInsidePolygon = currentCustomers.filter(customer => {
        if (!customer.location || typeof customer.location.lat !== 'number' || typeof customer.location.lng !== 'number') {
          console.warn('Invalid customer location:', customer.id, customer.location);
          return false;
        }

        const isInside = isPointInPolygon(customer.location, pathArray);
        if (isInside) {
          console.log('Customer inside polygon:', customer.customer_name || customer.name || customer.id, customer.location);
        }
        return isInside;
      });

      console.log('Customers found inside polygon:', customersInsidePolygon.length);

      // Calculate total sales from customers inside the polygon
      const totalSales = customersInsidePolygon.reduce((sum, customer) => {
        return sum + (customer.sales || 0);
      }, 0);

      console.log('Territory data calculated:', {
        centroid,
        area,
        customersFound: customersInsidePolygon.length,
        totalSales
      });

      // Call the onTerritoryCreate callback if provided
      if (onTerritoryCreateRef.current) {
        const currentTerritories = territoriesRef.current || [];
        const currentColors = defaultTerritoryColorsRef.current || [];
        const currentTerritoryCount = currentTerritories.length;
        const colorIndex = currentTerritoryCount % currentColors.length;

        const territoryData = {
          id: Date.now(), // Generate temporary ID
          name: `Territory ${currentTerritoryCount + 1}`,
          path: pathArray,
          centroid: centroid,
          area: area,
          customers: customersInsidePolygon,
          customerCount: customersInsidePolygon.length,
          totalSales: totalSales,
          zone: 'A',
          color: currentColors[colorIndex]
        };

        console.log('Calling onTerritoryCreate with territory data');
        try {
          onTerritoryCreateRef.current(territoryData);
          console.log('Territory created successfully');
        } catch (error) {
          console.error('Error creating territory:', error);
        }
      }
    };    // Add the event listener
    const listener = window.google.maps.event.addListener(drawingManager, 'polygoncomplete', handlePolygonComplete);

    // Cleanup function
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [drawingManager]); // Simplified dependency array to prevent excessive re-renders

  // Edit state
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [originalPolygonState, setOriginalPolygonState] = useState(null);
  const [polygonDragState, setPolygonDragState] = useState({
    isDragging: false,
    dragStartTime: null,
    dragStartPosition: null
  });

  // UI state
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [storageQuotaWarning, setStorageQuotaWarning] = useState(null);

  // Google Maps API loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: settings.googleMapsApiKey,
    libraries: LIBRARIES,
    version: 'weekly'
  });

  // Check storage quota on component mount
  useEffect(() => {
    const checkStorageQuota = () => {
      try {
        const quotaInfo = TerritoryDataService.checkStorageQuota();
        if (quotaInfo.isNearQuota) {
          setStorageQuotaWarning({
            type: 'warning',
            message: `Storage is ${quotaInfo.usagePercent.toFixed(1)}% full. Consider cleaning up data.`,
            quotaInfo
          });
        }
      } catch (error) {
        console.warn('Could not check storage quota:', error);
      }
    };

    checkStorageQuota();
  }, []);

  // Calculate map bounds and center
  const mapBounds = useMemo(() => {
    if (!customers || customers.length === 0) return null;

    const latitudes = customers.map(c => c.location.lat);
    const longitudes = customers.map(c => c.location.lng);
    const padding = 0.005;

    const bounds = {
      north: Math.max(...latitudes) + padding,
      south: Math.min(...latitudes) - padding,
      east: Math.max(...longitudes) + padding,
      west: Math.min(...longitudes) - padding
    };

    const center = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    };

    return { bounds, center };
  }, [customers]);

  // Map options
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true,
      scrollwheel: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
      mapTypeId: 'roadmap',
      restriction: mapBounds?.bounds
        ? {
            latLngBounds: mapBounds.bounds,
            strictBounds: false
          }
        : undefined
    }),
    [mapBounds]
  );

  // Utility functions
  const isPointInPolygon = useCallback((point, polygon) => {
    const x = point.lat;
    const y = point.lng;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }, []);


  const endPolygonDrag = useCallback((polygonRef, finalPosition) => {
    const dragDuration = Date.now() - polygonDragState.dragStartTime;
    const dragDistance = polygonDragState.dragStartPosition ?
      Math.sqrt(
        Math.pow(finalPosition.lat - polygonDragState.dragStartPosition.lat, 2) +
        Math.pow(finalPosition.lng - polygonDragState.dragStartPosition.lng, 2)
      ) : 0;

    console.log('Polygon drag ended:', {
      duration: dragDuration,
      distance: dragDistance,
      significant: dragDistance > 0.0001 // Threshold for significant drag
    });

    setPolygonDragState({
      isDragging: false,
      dragStartTime: null,
      dragStartPosition: null
    });

    // If drag was significant, mark territory as having changes
    if (dragDistance > 0.0001) {
      setPendingEdit(prev => ({ ...prev, hasChanges: true }));
    }
  }, [polygonDragState]);

  const trackPolygonDrag = useCallback((polygonRef, currentPosition) => {
    if (polygonDragState.isDragging) {
      console.log('Polygon being dragged to:', currentPosition);
      // Update pending edit with current position
      setPendingEdit(prev => ({ ...prev, currentPath: polygonRef.getPath()?.getArray() }));
    }
  }, [polygonDragState]);

  // Store original polygon state when editing starts
  const storeOriginalPolygonState = useCallback((territoryId) => {
    const territory = territories.find(t => t.id === territoryId);
    if (territory) {
      setOriginalPolygonState({
        territoryId,
        originalPath: [...territory.path],
        originalCustomers: [...territory.customers],
        originalCustomerCount: territory.customerCount,
        originalTotalSales: territory.totalSales
      });
    }
  }, [territories]);

  // Filtered territories based on search
  const filteredTerritories = useMemo(() => {
    if (!territories || !searchQuery.trim()) return territories;

    const query = searchQuery.toLowerCase();
    return territories.filter(territory =>
      territory.id.toString().includes(query) ||
      territory.name?.toLowerCase().includes(query) ||
      territory.customers?.some(customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.customer_name?.toLowerCase().includes(query)
      )
    );
  }, [territories, searchQuery]);

  // Cleanup function for drawing state
  const cleanupDrawingState = useCallback(() => {
    // Reset the polygon flag
    setNewPolygon(null);

    if (drawingManager && mapInstance) {
      try {
        drawingManager.setDrawingMode(null);
      } catch (error) {
        console.warn('Error during drawing cleanup:', error);
      }
    }

    setDrawingMode(false);
  }, [drawingManager, mapInstance]);

  // Enhanced cancel edit function with polygon restoration
  const cancelEdit = useCallback(() => {
    if (!originalPolygonState) return;

    const { territoryId, originalPath } = originalPolygonState;

    // Find the current polygon reference
    const polygonRef = polygonRefs.get(territoryId);

    if (polygonRef && originalPath) {
      try {
        // Restore original polygon path
        const path = new window.google.maps.MVCArray();
        originalPath.forEach(point => {
          path.push(new window.google.maps.LatLng(point.lat, point.lng));
        });

        polygonRef.setPath(path);

        console.log('Polygon restored to original state for territory:', territoryId);

        // Clear edit state
        setEditingTerritory(null);
        setPendingEdit(null);
        setOriginalPolygonState(null);
        setPolygonDragState({
          isDragging: false,
          dragStartTime: null,
          dragStartPosition: null
        });

        // Update UI to show restoration
        setSaveSuccess({ type: 'info', message: 'Changes canceled, polygon restored' });
        setTimeout(() => setSaveSuccess(null), 3000);

      } catch (error) {
        console.error('Error restoring polygon:', error);
        setSaveSuccess({ type: 'error', message: 'Error restoring polygon' });
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    }
  }, [originalPolygonState, polygonRefs]);

  // Enhanced save territories function with quota handling
  const saveTerritoriesData = useCallback(async (territories) => {
    try {
      const result = TerritoryDataService.saveTerritoryData(territories);

      if (result === true) {
        setSaveSuccess({ type: 'success', message: 'Territory data saved successfully' });
        setStorageQuotaWarning(null);
        return true;
      } else if (result.success && result.warning) {
        setSaveSuccess({ type: 'warning', message: result.warning });
        return true;
      } else if (result.success === false) {
        setSaveSuccess({ type: 'error', message: result.error });
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error saving territories:', error);
      setSaveSuccess({ type: 'error', message: 'Failed to save territory data' });
      return false;
    }
  }, []);

  // Load territories data
  const loadTerritoriesData = useCallback(() => {
    try {
      const territories = TerritoryDataService.loadTerritoryData();
      return territories;
    } catch (error) {
      console.error('Error loading territories:', error);
      setSaveSuccess({ type: 'error', message: 'Failed to load territory data' });
      return null;
    }
  }, []);

  // Get storage information
  const getStorageInfo = useCallback(() => {
    return TerritoryDataService.getStorageInfo();
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupDrawingState();
      if (drawingManager) {
        drawingManager.setMap(null);
      }
    };
  }, [cleanupDrawingState, drawingManager]);

  // Context value
  const value = useMemo(() => ({
    // Core state
    mapInstance,
    setMapInstance,
    activePolygon,
    setActivePolygon,
    activeMarker,
    setActiveMarker,
    hoveredPolygon,
    setHoveredPolygon,
    polygonRefs,
    setPolygonRefs,
    selectedCustomer,
    setSelectedCustomer,
    mapRef,

    // Drawing state
    drawingMode,
    setDrawingMode,
    drawingManager,
    setDrawingManager,
    newPolygon,
    setNewPolygon,

    // Edit state
    editingTerritory,
    setEditingTerritory,
    pendingEdit,
    setPendingEdit,
    originalPolygonState,
    setOriginalPolygonState,
    storeOriginalPolygonState,
    polygonDragState,
    setPolygonDragState,

    // UI state
    saveSuccess,
    setSaveSuccess,
    searchQuery,
    setSearchQuery,
    storageQuotaWarning,
    setStorageQuotaWarning,

    // Data
    customers,
    territories,
    filteredTerritories,
    territoryColors: defaultTerritoryColors,
    mapBounds,
    mapOptions,

    // API state
    isLoaded,
    loadError,

    // Callbacks
    onTerritoryUpdate,
    onTerritoryCreate,
    onTerritoryDelete,

    // Utility functions
    isPointInPolygon,
    calculateCentroid,
    calculatePolygonArea,
    polygonAreaToKm2,
    cleanupDrawingState,

    // Event handlers
    handlePolygonClick,
    handleMarkerClick,

    // Drag tracking functions
    startPolygonDrag,
    endPolygonDrag,
    trackPolygonDrag,
    cancelEdit,

    // Storage functions
    saveTerritoriesData,
    loadTerritoriesData,
    getStorageInfo
  }), [
    mapInstance, activePolygon, activeMarker, hoveredPolygon, polygonRefs, selectedCustomer,
    drawingMode, drawingManager, newPolygon, editingTerritory, pendingEdit,
    originalPolygonState, polygonDragState, saveSuccess, searchQuery, storageQuotaWarning,
    customers, territories, filteredTerritories, defaultTerritoryColors, mapBounds, mapOptions, isLoaded,
    loadError, onTerritoryUpdate, onTerritoryCreate, onTerritoryDelete,
    isPointInPolygon, calculateCentroid, calculatePolygonArea, polygonAreaToKm2,
    cleanupDrawingState, handlePolygonClick, handleMarkerClick, storeOriginalPolygonState, startPolygonDrag, endPolygonDrag,
    trackPolygonDrag, cancelEdit, saveTerritoriesData, loadTerritoriesData, getStorageInfo
  ]);

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};
