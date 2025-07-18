import { Box, Grid, Paper, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Project imports
import Controls from '../components/Controls';
import DataSourceSelector from '../components/DataSourceSelector';
import MapContainer from '../components/MapContainer';
import TerritoryDataGrid from '../components/TerritoryDataGrid';
import { defaultBalancerConfig } from '../config';
import { handleMakeCustomers } from '../data/mockCustomers';
import {
    hasCustomerData,
    loadCustomerData,
    normalizeCustomerData,
    saveCustomerData
} from '../services/customerDataService';
import TerritoryDataService from '../services/territoryDataService';
import { generateTerritories } from '../services/territoryService';

const Dashboard = () => {
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [controls, setControls] = useState(defaultBalancerConfig);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('sample');
  const [customerDataLoaded, setCustomerDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for Map, 1 for Data Grid

  // Initialize customer data on component mount
  useEffect(() => {
    const initializeCustomerData = () => {
      // First check if we have data in localStorage
      if (hasCustomerData()) {
        const savedData = loadCustomerData();
        if (savedData && Array.isArray(savedData)) {
          const normalizedData = normalizeCustomerData(savedData);
          setCustomers(normalizedData);
          setCustomerDataLoaded(true);
          setDataSource('stored'); // Indicate data came from storage
          return;
        }
      }

      // If no saved data, load sample data by default
      const sampleData = handleMakeCustomers();
      const normalizedData = normalizeCustomerData(sampleData);
      setCustomers(normalizedData);
      setCustomerDataLoaded(true);
      setDataSource('sample');

      // Save sample data to localStorage
      saveCustomerData(normalizedData);
    };

    initializeCustomerData();
  }, []);

  // Handle customer data loading from DataSourceSelector
  const handleCustomerDataLoad = (newCustomerData, source) => {
    try {
      const normalizedData = normalizeCustomerData(newCustomerData);
      setCustomers(normalizedData);
      setDataSource(source);
      setCustomerDataLoaded(true);
      setError('');

      // Clear any existing territories since data has changed
      setTerritories([]);

      console.log(`Customer data loaded from ${source}:`, normalizedData.length, 'customers');
    } catch (err) {
      setError('Failed to load customer data: ' + err.message);
      console.error('Customer data load error:', err);
    }
  };

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
    if (!customerDataLoaded || customers.length === 0) {
      setError('Please load customer data first');
      return;
    }

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

        // Auto-save newly generated territories
        TerritoryDataService.saveTerritoryData(result.territories);

        // Switch to Data Grid tab if territories were generated successfully
        if (result.territories.length > 0) {
          setActiveTab(1);
        }
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

  // Handle territory field updates from DataGrid
  const handleTerritoryUpdate = (territoryId, field, value) => {
    setTerritories(prev =>
      TerritoryDataService.updateTerritoryField(prev, territoryId, field, value)
    );
  };

  // Handle save territories from DataGrid
  const handleSaveTerritories = (updatedTerritories) => {
    setTerritories(updatedTerritories);
    const saved = TerritoryDataService.saveTerritoryData(updatedTerritories);
    if (saved) {
      console.log('Territories saved successfully');
    } else {
      setError('Failed to save territory data');
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
              {/* Data Source Selector */}
              <DataSourceSelector
                onCustomerDataLoad={handleCustomerDataLoad}
                currentDataSource={dataSource}
                disabled={loading}
              />

              {/* Territory Controls */}
              <Controls
                controls={controls}
                onControlsChange={handleControlsChange}
                onGenerateTerritories={handleGenerateTerritories}
                onLoadBalance={handleLoadBalance}
                error={error}
                territories={territories}
                customers={customers}
                loading={loading}
                customerDataLoaded={customerDataLoaded}
              />
            </Box>
          </Grid>

          {/* Main Content Area with Tabs */}
          <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: { xs: '70vh', sm: '75vh', lg: 'calc(100vh - 200px)' },
                minHeight: { xs: '500px', sm: '600px', lg: '700px' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Tabs Header */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="territory views">
                  <Tab label="Map View" />
                  <Tab label="Data Grid" disabled={territories.length === 0} />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 0 && (
                  <MapContainer customers={customers} territories={territories} />
                )}
                {activeTab === 1 && (
                  <Box sx={{ height: '100%', p: 2 }}>
                    <TerritoryDataGrid
                      territories={territories}
                      onTerritoryUpdate={handleTerritoryUpdate}
                      onSave={handleSaveTerritories}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
  );
};

export default Dashboard;
