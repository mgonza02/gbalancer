import { LocationOn, People, ZoomOutMap } from '@mui/icons-material';
import { Alert, Box, Chip, CircularProgress, Fade, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { GoogleMap, InfoWindowF, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useMemo, useRef, useState } from 'react';
import { settings } from '../config';

const LIBRARIES = ['geometry', 'places'];

const MapContainer = ({ customers, territories }) => {
  const [activePolygon, setActivePolygon] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [hoveredPolygon, setHoveredPolygon] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
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
      '#48BB78' // Light Green
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
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ visibility: 'off' }]
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
                    options={{
                      fillColor: color,
                      fillOpacity: isActive ? 0.35 : isHovered ? 0.25 : 0.15,
                      strokeColor: color,
                      strokeOpacity: isActive ? 1.0 : isHovered ? 0.9 : 0.8,
                      strokeWeight: isActive ? 3 : isHovered ? 2.5 : 2,
                      clickable: true,
                      draggable: false,
                      editable: false,
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
            <Box sx={{ p: 1 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Territory {activePolygon.id}
              </Typography>

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

              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
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
            </Box>
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
            <Box sx={{ p: 1 }}>
              <Typography variant='h6' gutterBottom>
                {activeMarker.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {activeMarker.id}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Location: {activeMarker.location.lat.toFixed(4)}, {activeMarker.location.lng.toFixed(4)}
              </Typography>
            </Box>
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
        top: { xs: 12, sm: 16 },
        left: { xs: 12, sm: 16 },
        zIndex: 10
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
              bgcolor: 'rgba(255, 255, 255, 0.95)',
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
                      bgcolor: activePolygon?.id === territory.id ? 'action.selected' : 'transparent'
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
                    </Typography>
                    <Chip label={territory.customerCount} size='small' variant='outlined' sx={{ minWidth: 'auto' }} />
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
        </Paper>
      )}
    </Box>
  );
};

export default MapContainer;
