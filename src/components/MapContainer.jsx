import { Add, Delete, Download, LocationOn, People, Save, ZoomOutMap } from '@mui/icons-material';
import { Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Fade, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { GoogleMap, InfoWindowF, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { settings } from '../config';

const LIBRARIES = ['geometry', 'places', 'drawing'];

const MapContainer = ({ customers, territories, onTerritoryUpdate, editMode = false, confirmEdits = true, onTerritoryCreate, onTerritoryDelete }) => {
  const [activePolygon, setActivePolygon] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [hoveredPolygon, setHoveredPolygon] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null); // Stores pending polygon changes
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [polygonRefs, setPolygonRefs] = useState(new Map()); // Store polygon references
  const [saveSuccess, setSaveSuccess] = useState(null); // Show success message after save
  const [drawingMode, setDrawingMode] = useState(false); // Controls polygon drawing mode
  const [drawingManager, setDrawingManager] = useState(null); // Drawing manager instance
  const [newPolygon, setNewPolygon] = useState(null); // Newly drawn polygon
  const [createDialogOpen, setCreateDialogOpen] = useState(false); // Create territory dialog
  const [newTerritoryName, setNewTerritoryName] = useState(''); // Name for new territory
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete confirmation dialog
  const [territoryToDelete, setTerritoryToDelete] = useState(null); // Territory marked for deletion
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: settings.googleMapsApiKey,
    libraries: LIBRARIES,
    version: 'weekly' // Use the latest weekly version
  });

  // Modern color palette with better contrast
  const territoryColors = useMemo(
    () => [
      '#E53E3E', // Red
      '#38A169', // Green
      '#3182CE', // Blue
      '#805AD5', // Purple
      '#D69E2E', // Orange
      '#DD6B20', // Orange Red
      '#319795', // Teal
      '#C53030', // Dark Red
      '#9F7AEA', // Light Purple
      '#4A5568', // Gray
      '#2B6CB0', // Dark Blue
      '#2F855A', // Dark Green
      '#B794F6', // Light Purple
      '#F56565', // Light Red
      '#48BB78',  // Light Green
      '#ED8936', // Light Orange
      '#63B3ED'   // Light Blue


    ],
    []
  );

  // Calculate map bounds and center with better precision
  const mapBounds = useMemo(() => {
    if (!customers || customers.length === 0) return null;

    const latitudes = customers.map(c => c.location.lat);
    const longitudes = customers.map(c => c.location.lng);

    const padding = 0.005; // Reduced padding for better fit
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

  // Modern map styling
  const mapStyles = useMemo(
    () => [
      // {
      //   featureType: 'administrative',
      //   elementType: 'geometry',
      //   stylers: [{ visibility: 'off' }]
      // },
      // {
      //   featureType: 'poi',
      //   stylers: [{ visibility: 'off' }]
      // },
      // {
      //   featureType: 'road',
      //   elementType: 'labels.icon',
      //   stylers: [{ visibility: 'off' }]
      // },
      // {
      //   featureType: 'road.highway',
      //   elementType: 'geometry',
      //   stylers: [{ color: '#f0f0f0' }]
      // },
      // {
      //   featureType: 'road.arterial',
      //   elementType: 'geometry',
      //   stylers: [{ color: '#f8f8f8' }]
      // },
      // {
      //   featureType: 'water',
      //   elementType: 'geometry',
      //   stylers: [{ color: '#e0f2fe' }]
      // }
    ],
    []
  );

  // Map options with modern features
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true,
      scrollwheel: true,
      gestureHandling: 'greedy',
      styles: mapStyles,
      clickableIcons: false,
      mapTypeId: 'roadmap',
      restriction: mapBounds?.bounds
        ? {
            latLngBounds: mapBounds.bounds,
            strictBounds: false
          }
        : undefined
    }),
    [mapStyles, mapBounds]
  );

  // Handle map load
  const onMapLoad = useCallback(
    map => {
      setMapInstance(map);

      // Initialize drawing manager
      const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#3182CE',
          fillOpacity: 0.3,
          strokeColor: '#3182CE',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          clickable: true,
          editable: true,
          draggable: true
        }
      });

      drawingManagerInstance.setMap(map);
      setDrawingManager(drawingManagerInstance);

      // Listen for polygon completion
      window.google.maps.event.addListener(drawingManagerInstance, 'polygoncomplete', (polygon) => {
        // Stop drawing mode
        drawingManagerInstance.setDrawingMode(null);
        setDrawingMode(false);

        // Store the new polygon
        setNewPolygon(polygon);

        // Open dialog to name the territory
        setCreateDialogOpen(true);
      });

      // Fit bounds if we have customers
      if (mapBounds && customers?.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        customers.forEach(customer => {
          bounds.extend(customer.location);
        });
        map.fitBounds(bounds);
      }
    },
    [mapBounds, customers]
  );

  // Handle polygon click with better UX
  const handlePolygonClick = useCallback(territory => {
    setActivePolygon(territory);
    setActiveMarker(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback(customer => {
    setActiveMarker(customer);
    setActivePolygon(null);
  }, []);

  // Handle map click
  const handleMapClick = useCallback(() => {
    setActivePolygon(null);
    setActiveMarker(null);
  }, []);

  // Fit bounds function
  const fitBounds = useCallback(() => {
    if (mapInstance && customers?.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      customers.forEach(customer => {
        bounds.extend(customer.location);
      });
      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, customers]);

  // Custom marker icon
  const getMarkerIcon = useCallback(
    customer => {
      // Find which territory this customer belongs to
      const territory = territories?.find(t => t.customers.some(c => c.id === customer.id));

      const colorIndex = territory ? (territory.id - 1) % territoryColors.length : 0;
      const color = territoryColors[colorIndex];

      return {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="#fff"/>
        </svg>
      `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      };
    },
    [territories, territoryColors]
  );

  // Calculate polygon area using the shoelace formula
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

  // Convert polygon area to approximate square kilometers
  const polygonAreaToKm2 = useCallback(area => {
    // Very rough approximation: 1 degree^2 ≈ 12,100 km^2 at the equator
    // This varies significantly by latitude, but gives a rough estimate
    return (area * 12100).toFixed(2);
  }, []);

  // Validate polygon path
  const isValidPolygonPath = useCallback(path => {
    return path && Array.isArray(path) && path.length >= 3 && path.every(point => point.lat !== undefined && point.lng !== undefined);
  }, []);

  // Function to check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = useCallback((point, polygon) => {
    const x = point.lat;
    const y = point.lng;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }, []);

    // Function to calculate polygon centroid
    const calculateCentroid = useCallback((path) => {
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
  // Function to recalculate customers within a territory (store pending changes)
  const recalculateCustomersInTerritory = useCallback((territoryId, newPath) => {
    if (!customers) return;

    // Find customers that are inside the new polygon
    const customersInside = customers.filter(customer =>
      isPointInPolygon(customer.location, newPath)
    );

    // Calculate total sales
    const totalSales = customersInside.reduce((sum, customer) => sum + (customer.sales || 0), 0);

    // Find the original territory for comparison
    const originalTerritory = territories.find(t => t.id === territoryId);
    const originalCustomerCount = originalTerritory ? originalTerritory.customerCount : 0;
    const originalSales = originalTerritory ? originalTerritory.totalSales : 0;

    // Always store pending changes, but don't show dialog automatically
    setPendingEdit({
      territoryId,
      newPath,
      newCustomers: customersInside,
      newCustomerCount: customersInside.length,
      newTotalSales: totalSales,
      newCentroid: calculateCentroid(newPath),
      originalCustomerCount,
      originalSales,
      territory: originalTerritory,
      originalPath: originalTerritory ? [...originalTerritory.path] : [] // Store copy of original path for revert
    });

    // Only apply changes immediately if confirmation is disabled
    if (!confirmEdits && onTerritoryUpdate) {
      onTerritoryUpdate(territoryId, {
        path: newPath,
        customers: customersInside,
        customerCount: customersInside.length,
        totalSales: totalSales,
        centroid: calculateCentroid(newPath)
      });
    }
  }, [customers, territories, isPointInPolygon, calculateCentroid, confirmEdits, onTerritoryUpdate]);

  // Handle polygon edit events with better event management
  const handlePolygonEdit = useCallback((territoryId) => {
    return (polygon) => {
      const newPath = [];
      const pathArray = polygon.getPath();

      for (let i = 0; i < pathArray.getLength(); i++) {
        const point = pathArray.getAt(i);
        newPath.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }

      recalculateCustomersInTerritory(territoryId, newPath);
    };
  }, [recalculateCustomersInTerritory]);

  // Setup event listeners for a polygon
  const setupPolygonEventListeners = useCallback((polygon, territoryId) => {
    if (!polygon) return;

    // Clear any existing listeners to avoid duplicates
    window.google.maps.event.clearInstanceListeners(polygon);
    window.google.maps.event.clearInstanceListeners(polygon.getPath());

    // Add comprehensive event listeners for all types of polygon changes
    const editHandler = () => handlePolygonEdit(territoryId)(polygon);

    // Listen for vertex drag/move events
    window.google.maps.event.addListener(polygon.getPath(), 'set_at', editHandler);

    // Listen for vertex insertion (when user clicks on an edge to add a point)
    window.google.maps.event.addListener(polygon.getPath(), 'insert_at', editHandler);

    // Listen for vertex removal (when user right-clicks on a vertex)
    window.google.maps.event.addListener(polygon.getPath(), 'remove_at', editHandler);

    // Listen for entire polygon drag
    window.google.maps.event.addListener(polygon, 'dragend', editHandler);

    // Optional: Listen for drag start for immediate feedback
    window.google.maps.event.addListener(polygon, 'dragstart', () => {
      console.log(`Started dragging territory ${territoryId}`);
    });

  }, [handlePolygonEdit]);

  // Effect to manage polygon event listeners when edit mode or active polygon changes
  useEffect(() => {
    if (editMode && activePolygon) {
      const polygon = polygonRefs.get(activePolygon.id);
      if (polygon) {
        setupPolygonEventListeners(polygon, activePolygon.id);
      }
    }
  }, [editMode, activePolygon, polygonRefs, setupPolygonEventListeners]);

  // Effect to clear pending edits when edit mode is disabled
  useEffect(() => {
    if (!editMode && pendingEdit) {
      setPendingEdit(null);
      setConfirmDialogOpen(false);
    }
  }, [editMode, pendingEdit]);

  // Effect to cleanup drawing mode when component unmounts
  useEffect(() => {
    return () => {
      if (drawingManager) {
        drawingManager.setMap(null);
      }
      if (newPolygon) {
        newPolygon.setMap(null);
      }
    };
  }, [drawingManager, newPolygon]);

  // Handle confirmation of polygon edit
  const handleConfirmEdit = useCallback(() => {
    if (pendingEdit && onTerritoryUpdate) {
      // Apply the changes
      onTerritoryUpdate(pendingEdit.territoryId, {
        path: pendingEdit.newPath,
        customers: pendingEdit.newCustomers,
        customerCount: pendingEdit.newCustomerCount,
        totalSales: pendingEdit.newTotalSales,
        centroid: pendingEdit.newCentroid
      });

      // Show success message briefly
      setSaveSuccess(pendingEdit.territoryId);
      setTimeout(() => setSaveSuccess(null), 3000);
    }

    // Clean up
    setPendingEdit(null);
    setConfirmDialogOpen(false);
  }, [pendingEdit, onTerritoryUpdate]);

  // Handle save polygon edits button click
  const handleSavePolygonEdits = useCallback(() => {
    if (pendingEdit && confirmEdits) {
      setConfirmDialogOpen(true);
    } else if (pendingEdit && !confirmEdits) {
      // If confirmation is disabled, apply changes directly
      handleConfirmEdit();
    }
  }, [pendingEdit, confirmEdits, handleConfirmEdit]);

  // Handle cancellation of polygon edit
  const handleCancelEdit = useCallback(() => {
    // Revert the polygon to its original state if we have a pending edit
    if (pendingEdit && pendingEdit.originalPath) {
      const polygon = polygonRefs.get(pendingEdit.territoryId);
      if (polygon && pendingEdit.originalPath.length > 0) {
        // Restore original path
        const path = new window.google.maps.MVCArray();
        pendingEdit.originalPath.forEach(point => {
          path.push(new window.google.maps.LatLng(point.lat, point.lng));
        });
        polygon.setPath(path);
      }
    }

    setPendingEdit(null);
    setConfirmDialogOpen(false);
  }, [pendingEdit, polygonRefs]);

  // Handle drawing mode toggle
  const handleDrawingModeToggle = useCallback(() => {
    if (!drawingManager) return;

    if (drawingMode) {
      // Stop drawing
      drawingManager.setDrawingMode(null);
      setDrawingMode(false);
    } else {
      // Start drawing
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      setDrawingMode(true);
    }
  }, [drawingManager, drawingMode]);

  // Handle new territory creation
  const handleCreateTerritory = useCallback(() => {
    if (!newPolygon || !newTerritoryName.trim()) return;

    // Get polygon path
    const path = [];
    const pathArray = newPolygon.getPath();
    for (let i = 0; i < pathArray.getLength(); i++) {
      const point = pathArray.getAt(i);
      path.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }

    // Find customers inside the polygon
    const customersInside = customers.filter(customer =>
      isPointInPolygon(customer.location, path)
    );

    // Calculate total sales
    const totalSales = customersInside.reduce((sum, customer) => sum + (customer.sales || 0), 0);

    // Generate new territory ID
    const existingIds = territories.map(t => t.id);
    const newId = Math.max(...existingIds, 0) + 1;

    // Create territory object
    const newTerritory = {
      id: newId,
      name: newTerritoryName.trim(),
      path: path,
      customers: customersInside,
      customerCount: customersInside.length,
      totalSales: totalSales,
      centroid: calculateCentroid(path),
      createdAt: new Date().toISOString(),
      isManuallyCreated: true
    };

    // Call parent callback to add territory
    if (onTerritoryCreate) {
      onTerritoryCreate(newTerritory);
    }

    // Clean up
    newPolygon.setMap(null); // Remove the drawn polygon from map
    setNewPolygon(null);
    setNewTerritoryName('');
    setCreateDialogOpen(false);

    // Show success message
    setSaveSuccess(newId);
    setTimeout(() => setSaveSuccess(null), 3000);
  }, [newPolygon, newTerritoryName, customers, territories, isPointInPolygon, calculateCentroid, onTerritoryCreate]);

  // Handle cancel territory creation
  const handleCancelCreate = useCallback(() => {
    if (newPolygon) {
      newPolygon.setMap(null); // Remove the drawn polygon from map
      setNewPolygon(null);
    }
    setNewTerritoryName('');
    setCreateDialogOpen(false);
  }, [newPolygon]);

  // Handle territory deletion request
  const handleDeleteTerritory = useCallback((territory) => {
    setTerritoryToDelete(territory);
    setDeleteDialogOpen(true);
  }, []);

  // Handle confirm territory deletion
  const handleConfirmDelete = useCallback(() => {
    if (territoryToDelete && onTerritoryDelete) {
      onTerritoryDelete(territoryToDelete.id);

      // Clear active polygon if it's the one being deleted
      if (activePolygon?.id === territoryToDelete.id) {
        setActivePolygon(null);
      }

      // Show success message
      setSaveSuccess(`Territory ${territoryToDelete.id} deleted`);
      setTimeout(() => setSaveSuccess(null), 3000);
    }

    setTerritoryToDelete(null);
    setDeleteDialogOpen(false);
  }, [territoryToDelete, onTerritoryDelete, activePolygon]);

  // Handle cancel territory deletion
  const handleCancelDelete = useCallback(() => {
    setTerritoryToDelete(null);
    setDeleteDialogOpen(false);
  }, []);

  // Handle export customers in territory as JSON
  const handleExportTerritoryCustomers = useCallback((territory) => {
    if (!territory || !territory.customers || territory.customers.length === 0) {
      console.warn('No customers to export in this territory');
      return;
    }

    // Format customers in the same structure as the upload format (matching sample-customer-data.json)
    const exportData = territory.customers.map(customer => ({
      id: customer.id,
      customer_name: customer.customer_name || customer.name,
      document_number: customer.document_number || `DOC${customer.id}`,
      lat: customer.location.lat.toString(), // String format to match sample data
      lng: customer.location.lng.toString(), // String format to match sample data
      sales: customer.sales || 0
    }));

    // Create filename with territory info and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const territoryName = territory.name ? territory.name.replace(/[^a-zA-Z0-9]/g, '_') : `Territory_${territory.id}`;
    const filename = `${territoryName}_customers_${timestamp}.json`;

    // Create and download the file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    setSaveSuccess(`Exported ${exportData.length} customers from ${territoryName}`);
    setTimeout(() => setSaveSuccess(null), 3000);

    console.log(`Exported ${exportData.length} customers from territory ${territory.id}:`, exportData);
  }, []);
  // Error handling
  if (loadError) {
    console.error('Google Maps API load error:', loadError);
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3 }
      }}>
        <Paper sx={{
          p: { xs: 2, sm: 3 },
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Alert
            severity='error'
            sx={{
              mb: 2,
              borderRadius: 2,
              fontSize: { xs: '0.85rem', sm: '0.875rem' }
            }}
          >
            Failed to load Google Maps
          </Alert>
          <Typography variant='body2' color='text.secondary' sx={{
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}>
            Please check your Google Maps API key and ensure it has the necessary permissions.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.paper'
      }}>
        <Fade in={true}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: 'primary.main',
                mb: 2
              }}
            />
            <Typography variant='h6' sx={{
              mt: 2,
              color: 'text.primary',
              fontWeight: 500,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              Loading Google Maps...
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{
              mt: 1,
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              Please wait while we initialize the map
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      position: 'relative',
      borderRadius: 'inherit',
      overflow: 'hidden'
    }}>
      <GoogleMap
        ref={mapRef}
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={mapBounds ? mapBounds.center : { lat: 37.7749, lng: -122.4194 }}
        zoom={mapBounds ? 10 : 11}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* Render customer markers */}
        {customers &&
          customers.map(customer => (
            <MarkerF
              key={customer.id}
              position={customer.location}
              title={customer.name}
              onClick={() => handleMarkerClick(customer)}
              icon={getMarkerIcon(customer)}
            />
          ))}

        {/* Render territory polygons with enhanced styling and hover effects */}
        {
          territories &&
            territories
              .map((territory, index) => {
                // Skip territories with invalid polygon paths
                if (!isValidPolygonPath(territory.path)) {
                  console.warn(`Territory ${territory.id} has invalid polygon path, skipping render`);
                  return null;
                }

                const colorIndex = index % territoryColors.length;
                const color = territoryColors[colorIndex];
                const isHovered = hoveredPolygon?.id === territory.id;
                const isActive = activePolygon?.id === territory.id;

                console.log('Territory Debug:', {
                  id: territory.id,
                  pathLength: territory.path?.length,
                  pathSample: territory.path?.slice(0, 2),
                  name: territory.name,
                  paths: territory.path,
                  customerCount: territory.customerCount,
                  centroid: territory.centroid
                });
                return (
                  <PolygonF
                    key={territory.id}
                    paths={territory.path}
                    onClick={() => handlePolygonClick(territory)}
                    onMouseEnter={() => setHoveredPolygon(territory)}
                    onMouseLeave={() => setHoveredPolygon(null)}
                    onLoad={(polygon) => {
                      // Store polygon reference for event management
                      setPolygonRefs(prev => {
                        const newMap = new Map(prev);
                        newMap.set(territory.id, polygon);
                        return newMap;
                      });

                      // If this polygon is active and we're in edit mode, set up listeners immediately
                      if (editMode && isActive) {
                        setupPolygonEventListeners(polygon, territory.id);
                      }
                    }}
                    onUnmount={() => {
                      // Clean up polygon reference when component unmounts
                      setPolygonRefs(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(territory.id);
                        return newMap;
                      });
                    }}
                    options={{
                      fillColor: color,
                      fillOpacity: isActive ? 0.35 : isHovered ? 0.25 : 0.15,
                      strokeColor: color,
                      strokeOpacity: isActive ? 1.0 : isHovered ? 0.9 : 0.8,
                      strokeWeight: isActive ? 3 : isHovered ? 2.5 : 2,
                      clickable: true,
                      draggable: editMode && isActive,
                      editable: editMode && isActive,
                      geodesic: false,
                      zIndex: isActive ? 3 : isHovered ? 2 : 1
                    }}
                  />
                );
              })
              .filter(Boolean) // Remove null values
        }

        {/* Enhanced info window for active polygon */}
        {activePolygon && (
          <InfoWindowF
            position={activePolygon.centroid}
            onCloseClick={() => setActivePolygon(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
              maxWidth: 300
            }}
          >
            <Card>
            <Box sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='h6' color='primary'>
                  Territory {activePolygon.id}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {editMode && (
                    <Chip
                      label="EDITABLE"
                      size="small"
                      color="warning"
                      variant="filled"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                  <Tooltip title="Export Customers as JSON">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleExportTerritoryCustomers(activePolygon)}
                      disabled={!activePolygon.customers || activePolygon.customers.length === 0}
                      sx={{
                        width: 24,
                        height: 24,
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white'
                        },
                        '&:disabled': {
                          opacity: 0.5
                        }
                      }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Territory">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTerritory(activePolygon)}
                      sx={{
                        width: 24,
                        height: 24,
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {editMode && (
                <Typography variant='caption' color='warning.main' sx={{ display: 'block', mb: 1 }}>
                  Click and drag points to edit the territory boundary
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People fontSize='small' color='primary' />
                <Typography variant='body2'>{activePolygon.customerCount} customers</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize='small' color='secondary' />
                <Typography variant='body2'>
                  Center: {activePolygon.centroid.lat.toFixed(4)}, {activePolygon.centroid.lng.toFixed(4)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Area: ~{polygonAreaToKm2(calculatePolygonArea(activePolygon.path))} km²
                </Typography>
              </Box>

              <Typography variant='body2' color='text.secondary' gutterBottom>
                Customers in this territory:
              </Typography>

              <Box sx={{ maxHeight: 150, overflowY: 'auto', mb: 2 }}>
                {activePolygon.customers.map(customer => (
                  <Chip
                    key={customer.id}
                    label={customer.name}
                    size='small'
                    variant='outlined'
                    sx={{ mr: 0.5, mb: 0.5 }}
                    onClick={() => handleMarkerClick(customer)}
                  />
                ))}
              </Box>

              {/* Export Section */}
              {activePolygon.customers && activePolygon.customers.length > 0 && (
                <Box sx={{
                  borderTop: 1,
                  borderColor: 'divider',
                  pt: 1,
                  mt: 1
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleExportTerritoryCustomers(activePolygon)}
                    fullWidth
                    sx={{
                      fontSize: '0.75rem',
                      py: 0.5,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    Export {activePolygon.customerCount} Customers
                  </Button>
                  <Typography variant='caption' color='text.secondary' sx={{
                    display: 'block',
                    mt: 0.5,
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}>
                    Downloads JSON file for focused planning
                  </Typography>
                </Box>
              )}
            </Box>
            </Card>
          </InfoWindowF>
        )}

        {/* Info window for active marker */}
        {activeMarker && (
          <InfoWindowF
            position={activeMarker.location}
            onCloseClick={() => setActiveMarker(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -30)
            }}
          >
            <Card>

            <Box sx={{ p: 1 }}>
              <Typography variant='h6' gutterBottom>
                {activeMarker.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {activeMarker.id}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Name: {activeMarker.customer_name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                DNI: {activeMarker.document_number}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Location: {activeMarker.location.lat.toFixed(4)}, {activeMarker.location.lng.toFixed(4)}
              </Typography>
            </Box>
            </Card>
          </InfoWindowF>
        )}

        {/* Hover tooltip for polygons */}
        {hoveredPolygon && !activePolygon && (
          <InfoWindowF
            position={hoveredPolygon.centroid}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
              maxWidth: 250,
              disableAutoPan: true
            }}
          >
            <Box sx={{ p: 1 }}>
              <Typography variant='subtitle2' color='primary'>
                Territory {hoveredPolygon.id}
              </Typography>
              <Typography variant='body2'>{hoveredPolygon.customerCount} customers</Typography>
              <Typography variant='caption' color='text.secondary'>
                Click for details
              </Typography>
            </Box>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Enhanced responsive map controls */}
      <Box sx={{
        position: 'absolute',
        top: { xs: 60, sm: 80 },
        left: { xs: 12, sm: 16 },
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Tooltip title='Fit all territories'>
          <IconButton
            onClick={fitBounds}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 3,
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ZoomOutMap fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>

        {/* Draw New Territory Button */}
        <Tooltip title={drawingMode ? "Cancel Drawing" : "Draw New Territory"}>
          <IconButton
            onClick={handleDrawingModeToggle}
            sx={{
              bgcolor: drawingMode ? 'warning.main' : 'background.paper',
              color: drawingMode ? 'warning.contrastText' : 'text.primary',
              boxShadow: 3,
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              '&:hover': {
                bgcolor: drawingMode ? 'warning.dark' : 'action.hover',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Add fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>

        {/* Save Polygon Edits Button - Only show when there are pending edits */}
        {pendingEdit && editMode && (
          <Fade in={true} timeout={300}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="subtitle2">Save Territory {pendingEdit.territoryId}</Typography>
                  <Typography variant="caption">
                    {pendingEdit.newCustomerCount} customers ({pendingEdit.newCustomerCount > pendingEdit.originalCustomerCount ? '+' : ''}{pendingEdit.newCustomerCount - pendingEdit.originalCustomerCount} change)
                  </Typography>
                </Box>
              }
              placement="right"
            >
              <Fab
                color="primary"
                size="medium"
                onClick={handleSavePolygonEdits}
                sx={{
                  boxShadow: 4,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)'
                    },
                    '70%': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)'
                    },
                    '100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
                    }
                  },
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 6,
                    animation: 'none'
                  },
                  transition: 'all 0.2s ease-in-out',
                  bgcolor: 'primary.main'
                }}
              >
                <Save />
              </Fab>
            </Tooltip>
          </Fade>
        )}
      </Box>

      {/* Enhanced responsive map legend */}
      {territories && territories.length > 0 && (
        <Fade in={true} timeout={500}>
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: { xs: 12, sm: 16 },
              right: { xs: 12, sm: 16 },
              p: { xs: 1.5, sm: 2 },
              maxWidth: { xs: 250, sm: 320 },
              maxHeight: { xs: '50vh', sm: '60vh' },
              // bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'grey.100',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: '10px',
                '&:hover': {
                  bgcolor: 'grey.600',
                },
              },
            }}
          >
            <Typography variant='subtitle2' gutterBottom fontWeight='bold' sx={{
              fontSize: { xs: '0.85rem', sm: '0.95rem' }
            }}>
              Territory Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {territories.map((territory, index) => {
                const colorIndex = index % territoryColors.length;
                const color = territoryColors[colorIndex];
                const hasEdit = pendingEdit && pendingEdit.territoryId === territory.id;

                return (
                  <Box
                    key={territory.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: activePolygon?.id === territory.id ? 'action.selected' : 'transparent',
                      border: hasEdit ? '2px solid orange' : 'none'
                    }}
                    onClick={() => handlePolygonClick(territory)}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: color,
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        boxShadow: 1
                      }}
                    />
                    <Typography variant='body2' flex={1}>
                      Territory {territory.id}
                      {hasEdit && (
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'orange',
                            ml: 1,
                            fontWeight: 'bold'
                          }}
                        >
                          (edited)
                        </Typography>
                      )}
                    </Typography>
                    <Chip
                      label={hasEdit ? pendingEdit.newCustomerCount : territory.customerCount}
                      size='small'
                      variant='outlined'
                      sx={{
                        minWidth: 'auto',
                        color: hasEdit ? 'orange' : 'inherit',
                        borderColor: hasEdit ? 'orange' : 'inherit'
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Map statistics */}
      {customers && customers.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            Total Customers: {customers.length} | Territories: {territories?.length || 0} | Avg per Territory:{' '}
            {territories?.length ? Math.round(customers.length / territories.length) : 0}
          </Typography>
          {drawingMode && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                color: 'info.main',
                fontWeight: 'bold',
                mt: 0.5
              }}
            >
              🎨 Drawing mode active - Click on map to draw territory
            </Typography>
          )}
          {pendingEdit && editMode && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                color: 'warning.main',
                fontWeight: 'bold',
                mt: 0.5
              }}
            >
              ⚠️ Territory {pendingEdit.territoryId} has unsaved changes
            </Typography>
          )}
          {saveSuccess && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                color: 'success.main',
                fontWeight: 'bold',
                mt: 0.5
              }}
            >
              ✅ Territory {saveSuccess} saved successfully{editMode === false ? ' - Edit mode disabled' : ''}
            </Typography>
          )}
        </Paper>
      )}

      {/* Confirmation dialog for polygon edits */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        aria-labelledby="confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Territory Changes
        </DialogTitle>
        <DialogContent>
          {pendingEdit && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Territory {pendingEdit.territoryId} - Changes Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to save these changes?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Edit mode will be disabled after saving changes.
                </Typography>
              </Box>

              {/* Customer Count Changes */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Customer Assignment Changes:
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Previous customers:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {pendingEdit.originalCustomerCount}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">New customers:</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color={pendingEdit.newCustomerCount > pendingEdit.originalCustomerCount ? 'success.main' :
                           pendingEdit.newCustomerCount < pendingEdit.originalCustomerCount ? 'warning.main' : 'text.primary'}
                  >
                    {pendingEdit.newCustomerCount}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Change:</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color={pendingEdit.newCustomerCount > pendingEdit.originalCustomerCount ? 'success.main' :
                           pendingEdit.newCustomerCount < pendingEdit.originalCustomerCount ? 'warning.main' : 'text.primary'}
                  >
                    {pendingEdit.newCustomerCount > pendingEdit.originalCustomerCount ? '+' : ''}
                    {pendingEdit.newCustomerCount - pendingEdit.originalCustomerCount}
                  </Typography>
                </Box>
              </Box>

              {/* Sales Changes */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  💰 Sales Impact:
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Previous sales:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ${pendingEdit.originalSales?.toLocaleString() || 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">New sales:</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color={pendingEdit.newTotalSales > pendingEdit.originalSales ? 'success.main' :
                           pendingEdit.newTotalSales < pendingEdit.originalSales ? 'warning.main' : 'text.primary'}
                  >
                    ${pendingEdit.newTotalSales?.toLocaleString() || 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Change:</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color={pendingEdit.newTotalSales > pendingEdit.originalSales ? 'success.main' :
                           pendingEdit.newTotalSales < pendingEdit.originalSales ? 'warning.main' : 'text.primary'}
                  >
                    {pendingEdit.newTotalSales > pendingEdit.originalSales ? '+' : ''}
                    ${((pendingEdit.newTotalSales || 0) - (pendingEdit.originalSales || 0)).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} color="inherit">
            Cancel Changes
          </Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create New Territory Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCancelCreate}
        aria-labelledby="create-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="create-dialog-title">
          Create New Territory
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" gutterBottom>
              Enter a name for your new territory:
            </Typography>

            <TextField
              autoFocus
              margin="dense"
              label="Territory Name"
              fullWidth
              variant="outlined"
              value={newTerritoryName}
              onChange={(e) => setNewTerritoryName(e.target.value)}
              placeholder="e.g., Downtown District, North Zone..."
              sx={{ mb: 2 }}
            />

            {newPolygon && (
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Territory Preview:
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Customers inside:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {customers.filter(customer => {
                      if (!newPolygon) return false;
                      const path = [];
                      const pathArray = newPolygon.getPath();
                      for (let i = 0; i < pathArray.getLength(); i++) {
                        const point = pathArray.getAt(i);
                        path.push({ lat: point.lat(), lng: point.lng() });
                      }
                      return isPointInPolygon(customer.location, path);
                    }).length}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total sales:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ${customers.filter(customer => {
                      if (!newPolygon) return false;
                      const path = [];
                      const pathArray = newPolygon.getPath();
                      for (let i = 0; i < pathArray.getLength(); i++) {
                        const point = pathArray.getAt(i);
                        path.push({ lat: point.lat(), lng: point.lng() });
                      }
                      return isPointInPolygon(customer.location, path);
                    }).reduce((sum, customer) => sum + (customer.sales || 0), 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCreate} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateTerritory}
            color="primary"
            variant="contained"
            disabled={!newTerritoryName.trim()}
          >
            Create Territory
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Territory Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Delete Territory
        </DialogTitle>
        <DialogContent>
          {territoryToDelete && (
            <Box>
              <Typography variant="h6" gutterBottom color="error">
                Are you sure you want to delete Territory {territoryToDelete.id}?
              </Typography>

              <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                This action cannot be undone. The territory and all its data will be permanently removed.
              </Typography>

              {/* Territory Information */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Territory Details:
                </Typography>

                {territoryToDelete.name && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Name:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {territoryToDelete.name}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Customers:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {territoryToDelete.customerCount}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Sales:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ${territoryToDelete.totalSales?.toLocaleString() || 0}
                  </Typography>
                </Box>

                {territoryToDelete.isManuallyCreated && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Type:</Typography>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      Manually Created
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ bgcolor: 'error.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                <Typography variant="subtitle2" gutterBottom color="error.main">
                  ⚠️ Impact of Deletion:
                </Typography>
                <Typography variant="body2" color="error.dark">
                  • {territoryToDelete.customerCount} customers will become unassigned
                </Typography>
                <Typography variant="body2" color="error.dark">
                  • Territory boundaries and data will be lost permanently
                </Typography>
                <Typography variant="body2" color="error.dark">
                  • This action cannot be undone
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete Territory
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapContainer;
