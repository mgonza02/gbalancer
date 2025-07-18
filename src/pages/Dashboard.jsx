import { ChevronLeft, ChevronRight, Edit, EditOff, TableChart } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Tooltip } from '@mui/material';
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
  const [showDataGrid, setShowDataGrid] = useState(false); // Controls DataGrid panel visibility
  const [showTerritories, setShowTerritories] = useState(true); // Controls territory visibility on map
  const [selectedTerritories, setSelectedTerritories] = useState([]); // Selected territory IDs
  const [editMode, setEditMode] = useState(false); // Controls polygon editing mode

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
      setSelectedTerritories([]);

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

        // Show DataGrid panel if territories were generated successfully
        if (result.territories.length > 0) {
          setShowDataGrid(true);
          // Select all territories by default
          setSelectedTerritories(result.territories.map(t => t.id));
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

    // Select all loaded territories by default
    if (balance.territories && balance.territories.length > 0) {
      setSelectedTerritories(balance.territories.map(t => t.id));
    }

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
  };  // Handle territory polygon updates from map editing
  const handleTerritoryPolygonUpdate = (territoryId, updates) => {
    setTerritories(prev => prev.map(territory =>
      territory.id === territoryId
        ? { ...territory, ...updates, lastModified: new Date().toISOString() }
        : territory
    ));

    // Auto-disable edit mode after successful save to provide clear feedback
    setEditMode(false);
  };

  // Handle new territory creation
  const handleTerritoryCreate = (newTerritory) => {
    setTerritories(prev => [...prev, newTerritory]);

    // Add the new territory to selected territories so it's visible
    setSelectedTerritories(prev => [...prev, newTerritory.id]);

    console.log('New territory created:', newTerritory);
  };

  // Handle territory deletion
  const handleTerritoryDelete = (territoryId) => {
    setTerritories(prev => prev.filter(territory => territory.id !== territoryId));

    // Remove the deleted territory from selected territories
    setSelectedTerritories(prev => prev.filter(id => id !== territoryId));

    console.log('Territory deleted:', territoryId);
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

  // Handle DataGrid toggle
  const handleDataGridToggle = () => {
    setShowDataGrid(!showDataGrid);
  };

  // Handle territory visibility toggle
  const handleTerritoryVisibilityToggle = () => {
    setShowTerritories(!showTerritories);
  };

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ height: '100%' }}>
      {/* Controls Panel */}
      <Grid size={{ xs: 12, lg: showDataGrid ? 3 : 4, xl: showDataGrid ? 2 : 3 }}>
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

      {/* Main Map Area */}
      <Grid size={{ xs: 12, lg: showDataGrid ? 5 : 8, xl: showDataGrid ? 6 : 9 }}>
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
            position: 'relative'
          }}
        >
          {/* DataGrid Toggle Button */}
          <Box sx={{
            position: 'absolute',
            top: 36,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            gap: 1
          }}>
            <Tooltip title={editMode ? "Exit Edit Mode" : "Edit Territories"}>
              <IconButton
                onClick={() => setEditMode(!editMode)}
                disabled={territories.length === 0}
                sx={{
                  bgcolor: editMode ? 'warning.main' : 'background.paper',
                  color: editMode ? 'warning.contrastText' : 'text.primary',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: editMode ? 'warning.dark' : 'grey.100',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  }
                }}
              >
                {editMode ? <EditOff /> : <Edit />}
              </IconButton>
            </Tooltip>

            <Tooltip title={showDataGrid ? "Hide Data Grid" : "Show Data Grid"}>
              <IconButton
                onClick={handleDataGridToggle}
                disabled={territories.length === 0}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  }
                }}
              >
                {showDataGrid ? <ChevronRight /> : <TableChart />}
              </IconButton>
            </Tooltip>
          </Box>

          <MapContainer
            customers={customers}
            territories={showTerritories ? territories.filter(t => selectedTerritories.includes(t.id)) : []}
            onTerritoryUpdate={handleTerritoryPolygonUpdate}
            onTerritoryCreate={handleTerritoryCreate}
            onTerritoryDelete={handleTerritoryDelete}
            editMode={editMode}
            confirmEdits={controls.confirmPolygonEdits}
          />
        </Paper>
      </Grid>

      {/* DataGrid Panel (Right Side, Collapsible) */}
      <Grid size={{ xs: 12, lg: 4, xl: 4 }} sx={{ display: showDataGrid ? 'block' : 'none' }}>
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
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* DataGrid Header with Close Button */}
          <Box sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'grey.50'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableChart color="primary" />
              <Box>
                <Box sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Territory Data</Box>
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {territories.length} territories
                </Box>
              </Box>
            </Box>
            <Tooltip title="Hide Data Grid">
              <IconButton onClick={handleDataGridToggle} size="small">
                <ChevronLeft />
              </IconButton>
            </Tooltip>
          </Box>

          {/* DataGrid Content */}
          <Box sx={{ flex: 1, overflow: 'hidden', p: 1 }}>
            <TerritoryDataGrid
              territories={territories}
              onTerritoryUpdate={handleTerritoryUpdate}
              onSave={handleSaveTerritories}
              showTerritories={showTerritories}
              onToggleTerritories={setShowTerritories}
              selectedTerritories={selectedTerritories}
              onSelectedTerritoriesChange={setSelectedTerritories}
              onTerritoryDelete={handleTerritoryDelete} // Pass the delete handler
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
