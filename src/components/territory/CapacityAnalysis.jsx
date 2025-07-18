import { Assessment, AttachMoney, Business, LocationOn, People, TrendingDown, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Chip, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Enhanced Capacity Analysis Component
 * Implements Single Responsibility Principle for capacity visualization
 */
export default function CapacityAnalysis({ metrics, validation, currencySymbol }) {
  const {
    totalCustomers,
    totalSales,
    totalCapacity,
    minCapacity,
    minTerritories,
    maxSalesCapacity,
    minSalesRequired,
    customerUtilization,
    salesUtilization
  } = metrics;

  const { isValid, validationMessage } = validation;

  const getStatusColor = (value, threshold = 100) => {
    if (value < threshold * 0.7) return 'success';
    if (value < threshold * 0.9) return 'warning';
    return 'error';
  };

  const getUtilizationIcon = (utilization) => {
    return utilization > 85 ?
      <TrendingUp color="error" fontSize="small" /> :
      <TrendingDown color="success" fontSize="small" />;
  };

  return (
    <Card sx={{ mb: 3, bgcolor: 'background.default', borderRadius: 3, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          color: 'primary.main',
          fontWeight: 600,
          mb: 3
        }}>
          <Assessment />
          Capacity Analysis
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
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

              {minCapacity > 0 && (
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

              {minTerritories > 0 && (
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
                      label="Valid"
                      size="small"
                      color="success"
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

        {/* Utilization Progress Indicators */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Customer Capacity Utilization
            {getUtilizationIcon(customerUtilization)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(customerUtilization, 100)}
            color={getStatusColor(customerUtilization, 100)}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {customerUtilization.toFixed(1)}% ({totalCustomers}/{totalCapacity} customers)
          </Typography>
        </Box>

        {salesUtilization > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Sales Capacity Utilization
              {getUtilizationIcon(salesUtilization)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(salesUtilization, 100)}
              color={getStatusColor(salesUtilization, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {salesUtilization.toFixed(1)}% ({currencySymbol} {totalSales.toLocaleString()}/{currencySymbol} {maxSalesCapacity.toLocaleString()})
            </Typography>
          </Box>
        )}

        {/* Validation Status Alert */}
        {!isValid && (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            {validationMessage}
          </Alert>
        )}

        {isValid && (
          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            ✅ Configuration is valid and ready for territory generation
          </Alert>
        )}

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
              {isValid ? '✓ Valid configuration' : validationMessage}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

CapacityAnalysis.propTypes = {
  metrics: PropTypes.object.isRequired,
  validation: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string.isRequired
};
