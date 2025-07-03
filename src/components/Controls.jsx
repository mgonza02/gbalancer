import React from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Chip } from '@mui/material';
import { TrendingUp, People, LocationOn } from '@mui/icons-material';

const Controls = ({ 
  controls, 
  onControlsChange, 
  onGenerateTerritories, 
  error, 
  territories, 
  customers,
  loading 
}) => {
  const handleInputChange = (field, value) => {
    onControlsChange({
      ...controls,
      [field]: value
    });
  };

  const totalCustomers = customers?.length || 0;
  const totalCapacity = (controls.numSellers || 0) * (controls.maxCustomersPerPolygon || 0);
  const isValid = totalCapacity >= totalCustomers && controls.numSellers > 0 && controls.maxCustomersPerPolygon > 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp />
          Territory Configuration
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label="Number of Sellers"
            type="number"
            value={controls.numSellers || ''}
            onChange={(e) => handleInputChange('numSellers', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            size="small"
            helperText="How many sales territories to create"
          />
          
          <TextField
            label="Max Customers per Territory"
            type="number"
            value={controls.maxCustomersPerPolygon || ''}
            onChange={(e) => handleInputChange('maxCustomersPerPolygon', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            size="small"
            helperText="Maximum customers any single seller should handle"
          />
        </Box>

        {/* Capacity Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Capacity Analysis:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              icon={<LocationOn />} 
              label={`${totalCustomers} Total Customers`} 
              size="small" 
              color="primary" 
            />
            <Chip 
              icon={<People />} 
              label={`${totalCapacity} Total Capacity`} 
              size="small" 
              color={isValid ? 'success' : 'error'} 
            />
          </Box>
          {totalCapacity > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isValid ? '✓ Sufficient capacity' : '⚠ Insufficient capacity - increase sellers or max customers'}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={onGenerateTerritories}
          disabled={!isValid || loading}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? 'Generating Territories...' : 'Generate Territories'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {territories && territories.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Territory Summary:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {territories.map((territory) => (
                <Box key={territory.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Territory {territory.id}
                  </Typography>
                  <Chip 
                    label={`${territory.customerCount} customers`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Generated {territories.length} territories covering {territories.reduce((sum, t) => sum + t.customerCount, 0)} customers
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Controls;
