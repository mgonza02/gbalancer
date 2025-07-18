import { Assessment, AttachMoney, People } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Territory Summary Component
 * Implements Single Responsibility Principle for territory visualization
 */
export default function TerritorySummary({ territories, controls, currencySymbol }) {
  if (!territories || territories.length === 0) {
    return null;
  }

  return (
    <Accordion sx={{ boxShadow: 'none', border: 1, borderColor: 'divider' }}>
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
          <Assessment />
          Territory Summary
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
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
                    📊 Total Sales: {currencySymbol} {territories.reduce((sum, t) => sum + (t.totalSales || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    💹 Sales Range: {currencySymbol} {Math.min(...territories.map(t => t.totalSales || 0)).toLocaleString()} - {currencySymbol} {Math.max(...territories.map(t => t.totalSales || 0)).toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='success.700' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    📈 Avg Sales/Territory: {currencySymbol} {Math.round(territories.reduce((sum, t) => sum + (t.totalSales || 0), 0) / territories.length).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
}

TerritorySummary.propTypes = {
  territories: PropTypes.array.isRequired,
  controls: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string.isRequired
};
