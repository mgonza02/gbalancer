import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState } from 'react';

// Project imports
import Controls from './components/Controls';
import MapContainer from './components/MapContainer';
import { defaultBalancerConfig } from './config';
import mockCustomers from './data/mockCustomers';
import { generateTerritories } from './services/territoryService';

// Create a simple theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});

function App() {
  const [customers] = useState(mockCustomers);
  const [territories, setTerritories] = useState([]);
  const [controls, setControls] = useState(defaultBalancerConfig);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth='xl' sx={{ py: 2 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h3' component='h1' gutterBottom align='center'>
            Sales Territory Balancer
          </Typography>
          <Typography variant='h6' color='text.secondary' align='center' gutterBottom>
            Create balanced, geographically clustered sales territories
          </Typography>
          <Typography variant='body1' color='text.secondary' align='center'>
            Load customers onto a map, specify your sales team size and territory limits, then generate optimized territories with automatic
            clustering.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Controls Panel */}
          <Grid size={{ xs: 12, md: 4 }}>
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
          </Grid>

          {/* Map Container */}
          <Grid
            size={{
              xs: 12,
              md: 8
            }}
          >
            <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <MapContainer customers={customers} territories={territories} />
            </Paper>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Showing {customers.length} customers across the San Francisco Bay Area
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
