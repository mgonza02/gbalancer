import { LocationOn, People, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, TextField, Typography } from '@mui/material';

const Controls = ({ controls, onControlsChange, onGenerateTerritories, error, territories, customers, loading }) => {
  const handleInputChange = (field, value) => {
    onControlsChange({
      ...controls,
      [field]: value
    });
  };

  const totalCustomers = customers?.length || 0;
  const totalCapacity = (controls.numSellers || 0) * (controls.maxCustomersPerPolygon || 0);
  const minCapacity = (controls.numSellers || 0) * (controls.minCustomersPerPolygon || 0);
  const isValid =
    totalCapacity >= totalCustomers &&
    controls.numSellers > 0 &&
    controls.maxCustomersPerPolygon > 0 &&
    controls.minCustomersPerPolygon >= 0 &&
    controls.minCustomersPerPolygon <= controls.maxCustomersPerPolygon &&
    minCapacity <= totalCustomers;

  const getValidationMessage = () => {
    if (totalCapacity < totalCustomers) {
      return '⚠ Insufficient max capacity - increase sellers or max customers';
    }
    if (controls.minCustomersPerPolygon > controls.maxCustomersPerPolygon) {
      return '⚠ Minimum customers cannot exceed maximum customers';
    }
    if (minCapacity > totalCustomers) {
      return '⚠ Minimum requirements exceed total customers - reduce min customers or sellers';
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

                return (
                  <Box key={territory.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2'>Territory {territory.id}</Typography>
                    <Chip
                      label={`${territory.customerCount} customers`}
                      size='small'
                      color={isAtMin || isAtMax ? 'warning' : 'primary'}
                      variant='outlined'
                    />
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
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Controls;
