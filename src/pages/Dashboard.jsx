import { Box, Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Project imports
import Controls from '../components/Controls';
import MapContainer from '../components/MapContainer';
import { defaultBalancerConfig } from '../config';
import { handleMakeCustomers } from '../data/mockCustomers';
import { generateTerritories } from '../services/territoryService';

const Dashboard = () => {
  const location = useLocation();
  const [customers] = useState(handleMakeCustomers());
  const [territories, setTerritories] = useState([]);
  const [controls, setControls] = useState(defaultBalancerConfig);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // console.log('App initialized with customers:', customers);

  // Load balance data from history if passed via navigation state
  useEffect(() => {
    if (location.state?.balance) {
      const { balance } = location.state;
      setControls(balance.controls || defaultBalancerConfig);
      setTerritories(balance.territories || []);
      setError('');
    }
  }, [location.state]);

  const handleGenerateTerritories = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await generateTerritories(customers, controls);

      if (result.error) {
        setError(result.error);
        setTerritories([]);
      } else {
        setTerritories(result.territories);
        setError('');
      }
    } catch (err) {
      setError('An unexpected error occurred while generating territories.');
      console.error('Territory generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBalance = balance => {
    // Update controls with the loaded balance configuration
    setControls(balance.controls);

    // Set the territories from the loaded balance
    setTerritories(balance.territories);

    // Clear any existing error
    setError('');
  };

  const handleControlsChange = newControls => {
    setControls(newControls);
    // Clear error when controls change
    if (error) {
      setError('');
    }
  };

  return (

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ height: '100%' }}>
          {/* Controls Panel */}
          <Grid  size={{ xs: 12, lg: 4, xl: 3 }}>
            <Box sx={{
              height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
              overflowY: { xs: 'visible', lg: 'auto' },
              '&::-webkit-scrollbar': {
                width: '8px',
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
            }}>
              <Controls
                controls={controls}
                onControlsChange={handleControlsChange}
                onGenerateTerritories={handleGenerateTerritories}
                onLoadBalance={handleLoadBalance}
                error={error}
                territories={territories}
                customers={customers}
                loading={loading}
              />
            </Box>
          </Grid>

          {/* Map Container */}
          <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: { xs: '60vh', sm: '70vh', lg: 'calc(100vh - 200px)' },
                minHeight: { xs: '400px', sm: '500px', lg: '600px' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <MapContainer customers={customers} territories={territories} />
            </Paper>
          </Grid>
        </Grid>
  );
};

export default Dashboard;
