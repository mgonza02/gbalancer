import { Alert, Box, CircularProgress } from '@mui/material';
import { GoogleMap, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useMemo, useRef, useState } from 'react';
import { settings } from '../config';

// Import sub-components
import { MapContextProvider, useMapContext } from '../contexts/MapContext';
import DialogManager from './map/DialogManager';
import InfoWindows from './map/InfoWindows';
import MapControls from './map/MapControls';
import TerritoryLegend from './map/TerritoryLegend';

const LIBRARIES = ['geometry', 'places', 'drawing'];

/**
 * Inner Map Component that uses MapContext
 */
const MapContent = ({ territories, customers, editMode, userRole, territoryColors }) => {
  const { handlePolygonClick, handleMarkerClick } = useMapContext();

  // Check if polygon path is valid
  const isValidPolygon = (path) => {
    return path && Array.isArray(path) && path.length >= 3;
  };

  // Custom marker icon
  const getMarkerIcon = useCallback(
    customer => {
      // Find which territory this customer belongs to
      const territory = territories?.find(t =>
        t.customers?.some(c => c.id === customer.id) ||
        customer.territory === t.id
      );

      const colorIndex = territory ? (territory.id - 1) % territoryColors.length : 0;
      const color = territoryColors[colorIndex];

      return {
        path: window.google?.maps?.SymbolPath?.CIRCLE || 'M 0,0 C -2,-2 -2,2 0,0 C 2,2 2,-2 0,0 z',
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8,
      };
    },
    [territories, territoryColors]
  );

  return (
    <>
      {/* Territory Polygons */}
      {territories?.map((territory, index) => {
        if (!territory.path || !isValidPolygon(territory.path)) return null;

        const colorIndex = index % territoryColors.length;
        const color = territoryColors[colorIndex];

        return (
          <PolygonF
            key={territory.id}
            path={territory.path}
            options={{
              fillColor: color,
              fillOpacity: editMode ? 0.3 : 0.2,
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              clickable: true,
              editable: editMode,
              draggable: editMode && userRole === 'admin'
            }}
            onClick={() => handlePolygonClick(territory)}
          />
        );
      })}

      {/* Customer Markers */}
      {customers?.map((customer) => (
        <MarkerF
          key={customer.id}
          position={customer.location}
          icon={getMarkerIcon(customer)}
          onClick={() => handleMarkerClick(customer)}
          title={customer.name}
        />
      ))}
    </>
  );
};

/**
 * Enhanced MapContainer Component
 * Implements SOLID principles with modular sub-components
 */
const MapContainer = ({
  customers = [],
  territories = [],
  onTerritoryUpdate,
  editMode = false,
  confirmEdits = true,
  onTerritoryCreate,
  onTerritoryDelete,
  userRole = 'user'
}) => {
  // Component state
  const [mapInstance, setMapInstance] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: settings.googleMapsApiKey,
    libraries: LIBRARIES,
    version: 'weekly'
  });

  // Modern color palette
  const territoryColors = useMemo(
    () => [
      '#E53E3E', '#38A169', '#3182CE', '#805AD5', '#D69E2E', '#DD6B20',
      '#319795', '#C53030', '#9F7AEA', '#4A5568', '#2B6CB0', '#2F855A',
      '#B794F6', '#F56565', '#48BB78', '#ED8936', '#63B3ED'
    ],
    []
  );

  // Calculate map bounds
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

    return {
      bounds,
      center: {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2
      }
    };
  }, [customers]);

  // Map styles
  const mapStyles = useMemo(
    () => [
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ visibility: 'simplified' }]
      },
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#f0f0f0' }]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#f8f8f8' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e0f2fe' }]
      }
    ],
    []
  );

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
      styles: mapStyles,
      clickableIcons: false,
      mapTypeId: 'roadmap'
    }),
    [mapStyles]
  );

  // Handle map load with drawing manager
  const onMapLoad = useCallback(
    map => {
      console.log('Map loaded, initializing drawing manager');
      setMapInstance(map);

      // Check if drawing library is loaded
      if (!window.google.maps.drawing) {
        console.error('Google Maps Drawing library not loaded');
        return;
      }

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
      console.log('Drawing manager initialized:', drawingManagerInstance);

      // Polygon completion is now handled by MapContext

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

  // Handle map click
  const handleMapClick = useCallback(() => {
    console.log('Map clicked');
  }, []);

  // Handle dialog save
  const handleDialogSave = useCallback((territoryData) => {
    console.log('Saving territory:', territoryData);
    if (onTerritoryCreate) {
      onTerritoryCreate(territoryData);
    }
  }, [onTerritoryCreate]);

  // Handle dialog delete
  const handleDialogDelete = useCallback((territory) => {
    console.log('Deleting territory:', territory);
    if (onTerritoryDelete) {
      onTerritoryDelete(territory);
    }
  }, [onTerritoryDelete]);

  // Handle territory edit
  const handleTerritoryEdit = useCallback((territory) => {
    setDialogType('edit');
    setDialogOpen(true);
  }, []);

  // Handle territory delete
  const handleTerritoryDelete = useCallback((territory) => {
    setDialogType('delete');
    setDialogOpen(true);
  }, []);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  // Error states
  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading Google Maps: {loadError.message}
        </Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MapContextProvider
      customers={customers}
      territories={territories}
      territoryColors={territoryColors}
      mapInstance={mapInstance}
      drawingManager={drawingManager}
      onTerritoryUpdate={onTerritoryUpdate}
      onTerritoryCreate={onTerritoryCreate}
      onTerritoryDelete={onTerritoryDelete}
    >
      <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
        {/* Google Map */}
        <GoogleMap
          ref={mapRef}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapBounds?.center || { lat: 40.7128, lng: -74.0060 }}
          zoom={12}
          options={mapOptions}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          <MapContent
            territories={territories}
            customers={customers}
            editMode={editMode}
            userRole={userRole}
            territoryColors={territoryColors}
          />
        </GoogleMap>

        {/* Sub-components */}
        <MapControls />
        <TerritoryLegend editMode={editMode} />
        <InfoWindows
          onEdit={handleTerritoryEdit}
          onDelete={handleTerritoryDelete}
          editMode={editMode}
          userRole={userRole}
        />
        <DialogManager
          open={dialogOpen}
          dialogType={dialogType}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
          onDelete={handleDialogDelete}
        />
      </Box>
    </MapContextProvider>
  );
};

export default MapContainer;
