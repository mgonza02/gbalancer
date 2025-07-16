import { Assessment, AttachMoney, Business, Groups, History, LocationOn, People, Save, TrendingUp } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, Chip, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { settings } from '../config';
import SaveBalanceDialog from './SaveBalanceDialog';

const Controls = ({ controls, onControlsChange, onGenerateTerritories, error, territories, customers, loading, onLoadBalance }) => {
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const handleInputChange = (field, value) => {
    onControlsChange({
      ...controls,
      [field]: value
    });
  };
  const {currencySymbol} = settings;

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
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: 'divider',
      height: 'fit-content'
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant='h5' gutterBottom sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
          color: 'primary.main',
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          <TrendingUp />
          Territory Configuration
        </Typography>

        {/* Basic Configuration Section */}
        <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: 'primary.50',
              '&:hover': { bgcolor: 'primary.100' }
            }}
          >
            <Typography variant='h6' sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600
            }}>
              <Groups />
              Basic Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 2, sm: 3 }
            }}>
              <TextField
                label='Number of Sellers'
                type='number'
                value={controls.numSellers || ''}
                onChange={e => handleInputChange('numSellers', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: 20 }}
                fullWidth
                size='small'
                helperText='How many sales territories to create'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Territory Constraints Section */}
        <Accordion sx={{ mb: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: 'info.50',
              '&:hover': { bgcolor: 'info.100' }
            }}
          >
            <Typography variant='h6' sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600
            }}>
              <Business />
              Territory Constraints
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 2, sm: 3 }
            }}>
              <TextField
                label='Territory Size'
                type='number'
                value={controls.territorySize || ''}
                onChange={e => handleInputChange('territorySize', parseInt(e.target.value) || 0)}
                inputProps={{ min: 100, max: 10000 }}
                fullWidth
                size='small'
                helperText='Target territory size (geographic area)'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Customer Distribution Section */}
        <Accordion sx={{ mb: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: 'success.50',
              '&:hover': { bgcolor: 'success.100' }
            }}
          >
            <Typography variant='h6' sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600
            }}>
              <People />
              Customer Distribution
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 2, sm: 3 }
            }}>
              <TextField
                label='Max Customers per Territory'
                type='number'
                value={controls.maxCustomersPerPolygon || ''}
                onChange={e => handleInputChange('maxCustomersPerPolygon', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: 100 }}
                fullWidth
                size='small'
                helperText='Maximum customers any single seller should handle'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Sales Targets Section */}
        <Accordion sx={{ mb: 3, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: 'warning.50',
              '&:hover': { bgcolor: 'warning.100' }
            }}
          >
            <Typography variant='h6' sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600
            }}>
              <AttachMoney />
              Sales Targets
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 2, sm: 3 }
            }}>
              <TextField
                label='Max Sales per Territory'
                type='number'
                value={controls.maxSalesPerTerritory || ''}
                onChange={e => handleInputChange('maxSalesPerTerritory', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1000, max: 100000 }}
                fullWidth
                size='small'
                helperText='Maximum sales target per territory'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Capacity Analysis Section */}
        <Card sx={{ mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'primary.main',
              fontWeight: 600,
              mb: 2
            }}>
              <Assessment />
              Capacity Analysis
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.50' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Metric</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>Value</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn color="primary" fontSize="small" />
                        Total Customers
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {totalCustomers.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label="Info" size="small" color="primary" />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People color="primary" fontSize="small" />
                        Max Capacity
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {totalCapacity.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={totalCapacity >= totalCustomers ? "Valid" : "Insufficient"}
                        size="small"
                        color={totalCapacity >= totalCustomers ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>

                  {controls.minCustomersPerPolygon > 0 && (
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People color="warning" fontSize="small" />
                          Min Required Customers
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {minCapacity.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={minCapacity <= totalCustomers ? "Valid" : "Exceeds"}
                          size="small"
                          color={minCapacity <= totalCustomers ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  )}

                  {controls.maxTerritories > 0 && (
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business color="info" fontSize="small" />
                          Max Territories
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {controls.maxTerritories.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label="Limit" size="small" color="info" />
                      </TableCell>
                    </TableRow>
                  )}

                  {controls.minTerritoriesPerSeller > 0 && (
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business color="warning" fontSize="small" />
                          Min Territories Required
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {minTerritories.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={minTerritories <= controls.maxTerritories ? "Valid" : "Exceeds"}
                          size="small"
                          color={minTerritories <= controls.maxTerritories ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  )}

                  {totalSales > 0 && (
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney color="info" fontSize="small" />
                          Total Sales
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {currencySymbol} {totalSales.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label="Available" size="small" color="info" />
                      </TableCell>
                    </TableRow>
                  )}

                  {maxSalesCapacity > 0 && (
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney color="primary" fontSize="small" />
                          Sales Capacity
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {currencySymbol} {maxSalesCapacity.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={maxSalesCapacity >= totalSales ? "Sufficient" : "Insufficient"}
                          size="small"
                          color={maxSalesCapacity >= totalSales ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  )}

                  {minSalesRequired > 0 && (
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney color="warning" fontSize="small" />
                          Min Sales Required
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {currencySymbol} {minSalesRequired.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={minSalesRequired <= totalSales ? "Achievable" : "Insufficient"}
                          size="small"
                          color={minSalesRequired <= totalSales ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalCapacity > 0 && (
              <Box sx={{
                mt: 2,
                p: 2,
                bgcolor: isValid ? 'success.50' : 'error.50',
                borderRadius: 2,
                border: 1,
                borderColor: isValid ? 'success.200' : 'error.200'
              }}>
                <Typography variant='body2' sx={{
                  fontWeight: 500,
                  color: isValid ? 'success.800' : 'error.800'
                }}>
                  {isValid ? '✓ Valid configuration' : getValidationMessage()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Button
          variant='contained'
          onClick={onGenerateTerritories}
          disabled={!isValid || loading}
          fullWidth
          size='large'
          sx={{
            mb: 3,
            py: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)',
              background: 'linear-gradient(45deg, #1565c0 30%, #2196f3 90%)'
            },
            '&:disabled': {
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transform: 'none'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {loading ? 'Generating Territories...' : 'Generate Territories'}
        </Button>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Button
            variant='outlined'
            startIcon={<Save />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={!territories || territories.length === 0}
            fullWidth
            size='large'
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: 3,
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderWidth: 2,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderWidth: 2
              },
              '&:disabled': {
                transform: 'none'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Save Balance
          </Button>

          <Button
            variant='outlined'
            startIcon={<History />}
            onClick={() => navigate('/history')}
            fullWidth
            size='large'
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: 3,
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderWidth: 2,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderWidth: 2
              },
              '&:disabled': {
                transform: 'none'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            History
          </Button>
        </Stack>

        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 3,
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              '& .MuiAlert-message': {
                fontWeight: 500
              },
              '& .MuiAlert-icon': {
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }
            }}
          >
            {error}
          </Alert>
        )}

        {territories && territories.length > 0 && (
          <Card sx={{
            mt: 2,
            borderRadius: 3,
            bgcolor: 'success.50',
            border: 1,
            borderColor: 'success.200',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant='h6' gutterBottom sx={{
                fontWeight: 600,
                color: 'success.800',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                <Assessment />
                Territory Summary
              </Typography>

              {/* Territory Cards - Responsive Grid */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fit, minmax(300px, 1fr))'
                },
                gap: 2,
                mb: 3
              }}>
                {territories.map(territory => {
                  const isAtMin = controls.minCustomersPerPolygon > 0 && territory.customerCount === controls.minCustomersPerPolygon;
                  const isAtMax = territory.customerCount === controls.maxCustomersPerPolygon;
                  const isOverSales = controls.maxSalesPerTerritory > 0 && territory.totalSales > controls.maxSalesPerTerritory;
                  const isNearSalesLimit = controls.maxSalesPerTerritory > 0 && territory.totalSales > controls.maxSalesPerTerritory * 0.9;
                  const isUnderMinSales = controls.minSalesPerTerritory > 0 && territory.totalSales < controls.minSalesPerTerritory;

                  return (
                    <Box
                      key={territory.id}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        p: { xs: 2, sm: 3 },
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      <Typography variant='subtitle1' sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}>
                        Territory {territory.id}
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                      }}>
                        <Chip
                          icon={<People fontSize="small" />}
                          label={`${territory.customerCount} customers`}
                          size='medium'
                          color={isAtMin || isAtMax ? 'warning' : 'primary'}
                          variant='outlined'
                          sx={{
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              fontSize: { xs: '0.8rem', sm: '1rem' }
                            }
                          }}
                        />
                        {territory.totalSales && (
                          <Chip
                            icon={<AttachMoney fontSize="small" />}
                            label={`${currencySymbol} ${territory.totalSales.toLocaleString()}`}
                            size='medium'
                            color={
                              isOverSales ? 'error' :
                              isUnderMinSales ? 'warning' :
                              isNearSalesLimit ? 'warning' : 'success'
                            }
                            variant='outlined'
                            sx={{
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                fontSize: { xs: '0.8rem', sm: '1rem' }
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Summary Statistics */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' },
                gap: 3
              }}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider'
                }}>
                  <Typography variant='body2' color='success.800' sx={{
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: '0.85rem', sm: '0.875rem' }
                  }}>
                    📊 Territory Overview
                  </Typography>
                  <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    👥 Total Customers: {territories.reduce((sum, t) => sum + t.customerCount, 0)}
                  </Typography>
                  <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    🏢 Territories: {territories.length}
                  </Typography>
                  <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    📈 Customer Range: {Math.min(...territories.map(t => t.customerCount))} - {Math.max(...territories.map(t => t.customerCount))} per territory
                  </Typography>
                </Box>

                {territories.some(t => t.totalSales) && (
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider'
                  }}>
                    <Typography variant='body2' color='success.800' sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '0.85rem', sm: '0.875rem' }
                    }}>
                      💰 Sales Overview
                    </Typography>
                    <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      📊 Total Sales: S/ {territories.reduce((sum, t) => sum + (t.totalSales || 0), 0).toLocaleString()}
                    </Typography>
                    <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      � Sales Range: S/ {Math.min(...territories.map(t => t.totalSales || 0)).toLocaleString()} - ${Math.max(...territories.map(t => t.totalSales || 0)).toLocaleString()}
                    </Typography>
                    <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      � Avg Sales/Territory: S/ {Math.round(territories.reduce((sum, t) => sum + (t.totalSales || 0), 0) / territories.length).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
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
    </Card>
  );
};

export default Controls;
