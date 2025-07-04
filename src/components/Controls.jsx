import { History, LocationOn, People, Save, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import BalanceHistory from './BalanceHistory';
import SaveBalanceDialog from './SaveBalanceDialog';

const Controls = ({ controls, onControlsChange, onGenerateTerritories, error, territories, customers, loading, onLoadBalance }) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const handleInputChange = (field, value) => {
    onControlsChange({
      ...controls,
      [field]: value
    });
  };

  const totalCustomers = customers?.length || 0;
  const totalSales = customers?.reduce((sum, customer) => sum + (customer.sales || 0), 0) || 0;
  const totalCapacity = (controls.numSellers || 0) * (controls.maxCustomersPerPolygon || 0);
  const minCapacity = (controls.numSellers || 0) * (controls.minCustomersPerPolygon || 0);
  const minTerritories = (controls.numSellers || 0) * (controls.minTerritoriesPerSeller || 0);
  const maxSalesCapacity = controls.maxSalesPerTerritory > 0 ? (controls.numSellers || 0) * controls.maxSalesPerTerritory : 0;
  const minSalesRequired = controls.minSalesPerTerritory > 0 ? (controls.numSellers || 0) * controls.minSalesPerTerritory : 0;

  const isValid =
    totalCapacity >= totalCustomers &&
    controls.numSellers > 0 &&
    controls.maxCustomersPerPolygon > 0 &&
    controls.minCustomersPerPolygon >= 0 &&
    controls.minCustomersPerPolygon <= controls.maxCustomersPerPolygon &&
    minCapacity <= totalCustomers &&
    controls.minTerritoriesPerSeller > 0 &&
    controls.territorySize > 0 &&
    controls.maxTerritories > 0 &&
    controls.maxSalesPerTerritory > 0 &&
    (controls.minSalesPerTerritory === 0 || controls.minSalesPerTerritory > 0) &&
    (controls.minSalesPerTerritory === 0 || controls.minSalesPerTerritory <= controls.maxSalesPerTerritory) &&
    minTerritories <= controls.maxTerritories &&
    (maxSalesCapacity === 0 || maxSalesCapacity >= totalSales) &&
    (minSalesRequired === 0 || minSalesRequired <= totalSales);

  const getValidationMessage = () => {
    if (totalCapacity < totalCustomers) {
      return '⚠ Insufficient max capacity - increase sellers or max customers';
    }
    if (maxSalesCapacity > 0 && maxSalesCapacity < totalSales) {
      return '⚠ Insufficient sales capacity - increase sellers or max sales per territory';
    }
    if (minSalesRequired > 0 && minSalesRequired > totalSales) {
      return '⚠ Total sales insufficient for minimum requirements - reduce min sales per territory or increase customer sales';
    }
    if (controls.minCustomersPerPolygon > controls.maxCustomersPerPolygon) {
      return '⚠ Minimum customers cannot exceed maximum customers';
    }
    if (controls.minSalesPerTerritory > 0 && controls.maxSalesPerTerritory > 0 && controls.minSalesPerTerritory > controls.maxSalesPerTerritory) {
      return '⚠ Minimum sales per territory cannot exceed maximum sales per territory';
    }
    if (minCapacity > totalCustomers) {
      return '⚠ Minimum requirements exceed total customers - reduce min customers or sellers';
    }
    if (minTerritories > controls.maxTerritories) {
      return '⚠ Minimum territories required exceed max territories limit';
    }
    if (!controls.minTerritoriesPerSeller || controls.minTerritoriesPerSeller <= 0) {
      return '⚠ Minimum territories per seller must be greater than 0';
    }
    if (!controls.territorySize || controls.territorySize <= 0) {
      return '⚠ Territory size must be greater than 0';
    }
    if (!controls.maxTerritories || controls.maxTerritories <= 0) {
      return '⚠ Maximum territories must be greater than 0';
    }
    if (!controls.maxSalesPerTerritory || controls.maxSalesPerTerritory <= 0) {
      return '⚠ Maximum sales per territory must be greater than 0';
    }
    return '⚠ Please check configuration';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp />
          Territory Configuration
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label='Number of Sellers'
            type='number'
            value={controls.numSellers || ''}
            onChange={e => handleInputChange('numSellers', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            size='small'
            helperText='How many sales territories to create'
          />

          <TextField
            label='Min Territories per Seller'
            type='number'
            value={controls.minTerritoriesPerSeller || ''}
            onChange={e => handleInputChange('minTerritoriesPerSeller', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            size='small'
            helperText='Minimum territories each seller must handle'
          />

          <TextField
            label='Territory Size'
            type='number'
            value={controls.territorySize || ''}
            onChange={e => handleInputChange('territorySize', parseInt(e.target.value) || 0)}
            inputProps={{ min: 100, max: 10000 }}
            fullWidth
            size='small'
            helperText='Target territory size (geographic area)'
          />

          <TextField
            label='Max Territories'
            type='number'
            value={controls.maxTerritories || ''}
            onChange={e => handleInputChange('maxTerritories', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 200 }}
            fullWidth
            size='small'
            helperText='Maximum total territories to create'
          />

          <TextField
            label='Max Customers per Territory'
            type='number'
            value={controls.maxCustomersPerPolygon || ''}
            onChange={e => handleInputChange('maxCustomersPerPolygon', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            size='small'
            helperText='Maximum customers any single seller should handle'
          />

          <TextField
            label='Min Customers per Territory'
            type='number'
            value={controls.minCustomersPerPolygon || ''}
            onChange={e => handleInputChange('minCustomersPerPolygon', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100 }}
            fullWidth
            size='small'
            helperText='Minimum customers per territory (0 = no minimum)'
            error={controls.minCustomersPerPolygon > controls.maxCustomersPerPolygon}
          />

          <TextField
            label='Max Sales per Territory'
            type='number'
            value={controls.maxSalesPerTerritory || ''}
            onChange={e => handleInputChange('maxSalesPerTerritory', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1000, max: 100000 }}
            fullWidth
            size='small'
            helperText='Maximum sales target per territory'
          />

          <TextField
            label='Min Sales per Territory'
            type='number'
            value={controls.minSalesPerTerritory || ''}
            onChange={e => handleInputChange('minSalesPerTerritory', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100000 }}
            fullWidth
            size='small'
            helperText='Minimum sales target per territory (0 = no minimum)'
            error={controls.minSalesPerTerritory > controls.maxSalesPerTerritory}
          />
        </Box>

        {/* Capacity Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Capacity Analysis:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip icon={<LocationOn />} label={`${totalCustomers} Total Customers`} size='small' color='primary' />
            <Chip icon={<People />} label={`${totalCapacity} Max Capacity`} size='small' color={isValid ? 'success' : 'error'} />
            {controls.minCustomersPerPolygon > 0 && (
              <Chip
                icon={<People />}
                label={`${minCapacity} Min Required`}
                size='small'
                color={minCapacity <= totalCustomers ? 'success' : 'warning'}
              />
            )}
            {controls.maxTerritories > 0 && (
              <Chip
                label={`${controls.maxTerritories} Max Territories`}
                size='small'
                color='info'
              />
            )}
            {controls.minTerritoriesPerSeller > 0 && (
              <Chip
                label={`${minTerritories} Min Territories`}
                size='small'
                color={minTerritories <= controls.maxTerritories ? 'success' : 'warning'}
              />
            )}
            {totalSales > 0 && (
              <Chip
                label={`$${totalSales.toLocaleString()} Total Sales`}
                size='small'
                color='info'
              />
            )}
            {maxSalesCapacity > 0 && (
              <Chip
                label={`$${maxSalesCapacity.toLocaleString()} Sales Capacity`}
                size='small'
                color={maxSalesCapacity >= totalSales ? 'success' : 'error'}
              />
            )}
            {minSalesRequired > 0 && (
              <Chip
                label={`$${minSalesRequired.toLocaleString()} Min Sales Required`}
                size='small'
                color={minSalesRequired <= totalSales ? 'success' : 'warning'}
              />
            )}
          </Box>
          {totalCapacity > 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              {isValid ? '✓ Valid configuration' : getValidationMessage()}
            </Typography>
          )}
        </Box>

        <Button variant='contained' onClick={onGenerateTerritories} disabled={!isValid || loading} fullWidth sx={{ mb: 2 }}>
          {loading ? 'Generating Territories...' : 'Generate Territories'}
        </Button>

        {/* Save and Load Controls */}
        <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
          <Button
            variant='outlined'
            startIcon={<Save />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={!territories || territories.length === 0}
            fullWidth
          >
            Save Balance
          </Button>

          <Button variant='outlined' startIcon={<History />} onClick={() => setHistoryDialogOpen(true)} fullWidth>
            History
          </Button>
        </Stack>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {territories && territories.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              Territory Summary:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {territories.map(territory => {
                const isAtMin = controls.minCustomersPerPolygon > 0 && territory.customerCount === controls.minCustomersPerPolygon;
                const isAtMax = territory.customerCount === controls.maxCustomersPerPolygon;
                const isOverSales = controls.maxSalesPerTerritory > 0 && territory.totalSales > controls.maxSalesPerTerritory;
                const isNearSalesLimit = controls.maxSalesPerTerritory > 0 && territory.totalSales > controls.maxSalesPerTerritory * 0.9;

                return (
                  <Box key={territory.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant='body2'>Territory {territory.id}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${territory.customerCount} customers`}
                        size='small'
                        color={isAtMin || isAtMax ? 'warning' : 'primary'}
                        variant='outlined'
                      />
                      {territory.totalSales && (
                        <Chip
                          label={`$${territory.totalSales.toLocaleString()}`}
                          size='small'
                          color={isOverSales ? 'error' : isNearSalesLimit ? 'warning' : 'success'}
                          variant='outlined'
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Generated {territories.length} territories covering {territories.reduce((sum, t) => sum + t.customerCount, 0)} customers
              {territories.length > 0 && (
                <span>
                  {' '}
                  • Range: {Math.min(...territories.map(t => t.customerCount))} - {Math.max(...territories.map(t => t.customerCount))}{' '}
                  customers per territory
                </span>
              )}
              {territories.some(t => t.totalSales) && (
                <span>
                  {' '}
                  • Sales: ${Math.min(...territories.map(t => t.totalSales || 0)).toLocaleString()} - ${Math.max(...territories.map(t => t.totalSales || 0)).toLocaleString()} per territory
                </span>
              )}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Save Balance Dialog */}
      <SaveBalanceDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        customers={customers}
        territories={territories}
        controls={controls}
      />

      {/* Balance History Dialog */}
      <BalanceHistory
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        onLoadBalance={onLoadBalance}
        currentBalance={controls}
        customers={customers}
        territories={territories}
      />
    </Card>
  );
};

export default Controls;
