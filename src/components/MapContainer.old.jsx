import { LocationOn, People } from '@mui/icons-material';
import { Box, Chip, CircularProgress, Paper, Typography } from '@mui/material';
import { GoogleMap, InfoWindowF, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api';
import { useMemo, useState } from 'react';
import { settings } from '../config';
const libraries = ['geometry']; // or other libraries

const MapContainer = ({ customers, territories }) => {
  const [activePolygon, setActivePolygon] = useState(null);
  const { googleMapsApiKey } = settings;
  console.log('api', googleMapsApiKey);
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries
  });

  // Color palette for territories
  const territoryColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#FF9FF3',
    '#54A0FF',
    '#5F27CD',
    '#00D2D3',
    '#FF9F43',
    '#2ED573',
    '#FFA502',
    '#FF6348',
    '#70A1FF',
    '#5352ED'
  ];

  // Calculate map bounds and center based on all customers
  const mapBounds = useMemo(() => {
    if (!customers || customers.length === 0) return null;

    const latitudes = customers.map(c => c.location.lat);
    const longitudes = customers.map(c => c.location.lng);

    const bounds = {
      north: Math.max(...latitudes) + 0.01,
      south: Math.min(...latitudes) - 0.01,
      east: Math.max(...longitudes) + 0.01,
      west: Math.min(...longitudes) - 0.01
    };

    const center = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    };

    return { bounds, center };
  }, [customers]);

  const handlePolygonClick = territory => {
    setActivePolygon(territory);
  };

  const handleMapClick = () => {
    setActivePolygon(null);
  };

  if (loadError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='h6' color='error' gutterBottom>
            Error loading Google Maps
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Please check your Google Maps API key in the .env.local file
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant='body2' sx={{ mt: 2 }}>
            Loading Google Maps...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px', width: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={mapBounds ? mapBounds.center : { lat: 37.7749, lng: -122.4194 }}
        zoom={mapBounds ? 10 : 11}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true
        }}
      >
        {/* Render customer markers */}
        {customers && customers.map(customer => <MarkerF key={customer.id} position={customer.location} title={customer.name} />)}

        {/* Render territory polygons */}
        {territories &&
          territories.map((territory, index) => {
            const colorIndex = index % territoryColors.length;
            const color = territoryColors[colorIndex];

            return (
              <PolygonF
                key={territory.id}
                paths={territory.path}
                onClick={() => handlePolygonClick(territory)}
                options={{
                  fillColor: color,
                  fillOpacity: 0.2,
                  strokeColor: color,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: true,
                  draggable: false,
                  editable: false,
                  geodesic: false,
                  zIndex: 1
                }}
              />
            );
          })}

        {/* Info window for active polygon */}
        {activePolygon && (
          <InfoWindowF position={activePolygon.centroid} onCloseClick={() => setActivePolygon(null)}>
            <Box sx={{ p: 1, minWidth: 200 }}>
              <Typography variant='h6' gutterBottom>
                Territory {activePolygon.id}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People fontSize='small' />
                <Typography variant='body2'>{activePolygon.customerCount} customers</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn fontSize='small' />
                <Typography variant='body2'>
                  Center: {activePolygon.centroid.lat.toFixed(4)}, {activePolygon.centroid.lng.toFixed(4)}
                </Typography>
              </Box>

              <Typography variant='body2' color='text.secondary' gutterBottom>
                Customers in this territory:
              </Typography>

              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                {activePolygon.customers.map(customer => (
                  <Chip key={customer.id} label={customer.name} size='small' variant='outlined' sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </Box>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Map legend */}
      {territories && territories.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            p: 2,
            maxWidth: 250,
            bgcolor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Typography variant='subtitle2' gutterBottom>
            Territories
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {territories.map((territory, index) => {
              const colorIndex = index % territoryColors.length;
              const color = territoryColors[colorIndex];

              return (
                <Box key={territory.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: color,
                      borderRadius: '50%',
                      border: '1px solid #fff'
                    }}
                  />
                  <Typography variant='body2'>
                    Territory {territory.id} ({territory.customerCount})
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MapContainer;
