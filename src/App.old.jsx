import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a modern responsive theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#f48fb1',
      dark: '#c51162'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2rem'
      }
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.5rem'
      }
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.1rem'
      }
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      xxl: 2560
    }
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
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        {/* Header */}
        <Box sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 1, md: 2 },
          px: { xs: 1, md: 2 }
        }}>
          <Container maxWidth='xxl'>
            <Typography
              variant='h3'
              component='h1'
              gutterBottom
              align='center'
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Sales Territory Balancer
            </Typography>
            {/* <Typography
              variant='h6'
              align='center'
              gutterBottom
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                opacity: 0.9,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Create balanced, geographically clustered sales territories
            </Typography>
            <Typography
              variant='body1'
              align='center'
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                opacity: 0.8,
                maxWidth: '600px',
                mx: 'auto',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Load customers onto a map, specify your sales team size and territory limits, then generate optimized territories with automatic clustering.
            </Typography> */}
          </Container>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, py: { xs: 2, md: 3 } }}>
          <Container maxWidth='xxl' sx={{ height: '100%' }}>
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ height: '100%' }}>
              {/* Controls Panel */}
              <Grid size={{ xs: 12, lg: 4, xl: 3 }}>
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
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{
          bgcolor: 'grey.50',
          py: 2,
          px: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Container maxWidth='xl'>
            <Typography
              variant='body2'
              color='text.secondary'
              align='center'
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Showing {customers.length} customers across the San Francisco Bay Area
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
