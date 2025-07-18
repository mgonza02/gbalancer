import { AttachMoney, Close, Delete, Edit, Person } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useMapContext } from '../../contexts/MapContext';

/**
 * Info Windows Component for Territory and Customer Details
 * Implements Single Responsibility Principle for map info display
 */
export default function InfoWindows({
  onEdit,
  onDelete,
  editMode = false,
  userRole = 'user'
}) {
  const {
    activePolygon,
    setActivePolygon,
    selectedCustomer,
    setSelectedCustomer,
    territoryColors,
    territories
  } = useMapContext();

  // Handle close info window
  const handleCloseTerritory = useCallback(() => {
    setActivePolygon(null);
  }, [setActivePolygon]);

  const handleCloseCustomer = useCallback(() => {
    setSelectedCustomer(null);
  }, [setSelectedCustomer]);

  // Handle edit territory
  const handleEditTerritory = useCallback(() => {
    if (activePolygon && onEdit) {
      onEdit(activePolygon);
    }
  }, [activePolygon, onEdit]);

  // Handle delete territory
  const handleDeleteTerritory = useCallback(() => {
    if (activePolygon && onDelete) {
      onDelete(activePolygon);
    }
  }, [activePolygon, onDelete]);

  // Territory color
  const territoryColor = useMemo(() => {
    if (!activePolygon || !territories) return '#4CAF50';
    const index = territories.findIndex(t => t.id === activePolygon.id);
    return territoryColors[index % territoryColors.length];
  }, [activePolygon, territories, territoryColors]);

  // Territory metrics
  const territoryMetrics = useMemo(() => {
    if (!activePolygon) return null;

    return {
      customers: activePolygon.customerCount || 0,
      sales: activePolygon.totalSales || 0,
      avgOrderValue: activePolygon.totalSales && activePolygon.customerCount
        ? activePolygon.totalSales / activePolygon.customerCount
        : 0,
      density: activePolygon.customerDensity || 0
    };
  }, [activePolygon]);

  // Customer metrics
  const customerMetrics = useMemo(() => {
    if (!selectedCustomer) return null;

    return {
      totalOrders: selectedCustomer.orderHistory?.length || 0,
      totalSpent: selectedCustomer.orderHistory?.reduce((sum, order) => sum + order.amount, 0) || 0,
      avgOrderValue: selectedCustomer.orderHistory?.length
        ? selectedCustomer.orderHistory.reduce((sum, order) => sum + order.amount, 0) / selectedCustomer.orderHistory.length
        : 0,
      lastOrder: selectedCustomer.orderHistory?.length
        ? new Date(Math.max(...selectedCustomer.orderHistory.map(o => new Date(o.date)))).toLocaleDateString()
        : 'Never'
    };
  }, [selectedCustomer]);

  return (
    <>
      {/* Territory Info Window */}
      {activePolygon && (
        <Card
          sx={{
            position: 'absolute',
            top: { xs: 240, sm: 280 },
            left: { xs: 12, sm: 16 },
            zIndex: 10,
            width: { xs: 280, sm: 320 },
            maxWidth: '90vw',
            boxShadow: 3,
            borderRadius: 2,
            borderTop: 4,
            borderTopColor: territoryColor
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: territoryColor,
                  width: 32,
                  height: 32,
                  mr: 1,
                  fontSize: '0.875rem'
                }}
              >
                {activePolygon.id}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Territory {activePolygon.id}
                  {activePolygon.name && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      - {activePolygon.name}
                    </Typography>
                  )}
                </Typography>

                {editMode && (
                  <Chip
                    label="EDIT MODE"
                    size="small"
                    color="warning"
                    variant="filled"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>

              <IconButton
                size="small"
                onClick={handleCloseTerritory}
                sx={{ ml: 1 }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Territory Metrics */}
            {territoryMetrics && (
              <>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    icon={<Person />}
                    label={`${territoryMetrics.customers} customers`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    icon={<AttachMoney />}
                    label={`$${territoryMetrics.sales.toLocaleString()}`}
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                </Stack>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Avg Order Value
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${territoryMetrics.avgOrderValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Customer Density
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {territoryMetrics.density.toFixed(2)}/km²
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Description */}
            {activePolygon.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {activePolygon.description}
                </Typography>
              </>
            )}

            {/* Action Buttons */}
            {userRole === 'admin' && !editMode && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={handleEditTerritory}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteTerritory}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer Info Window */}
      {selectedCustomer && (
        <Card
          sx={{
            position: 'absolute',
            top: { xs: 240, sm: 280 },
            right: { xs: 12, sm: 16 },
            zIndex: 10,
            width: { xs: 280, sm: 320 },
            maxWidth: '90vw',
            boxShadow: 3,
            borderRadius: 2,
            borderTop: 4,
            borderTopColor: 'info.main'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'info.main',
                  width: 32,
                  height: 32,
                  mr: 1
                }}
              >
                <Person />
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedCustomer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer.email}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={handleCloseCustomer}
                sx={{ ml: 1 }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Customer Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Address:</strong> {selectedCustomer.address || 'N/A'}
              </Typography>
              {selectedCustomer.territory && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Territory:</strong> {selectedCustomer.territory}
                </Typography>
              )}
            </Box>

            {/* Customer Metrics */}
            {customerMetrics && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Order History
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {customerMetrics.totalOrders}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Spent
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${customerMetrics.totalSpent.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Avg Order Value
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${customerMetrics.avgOrderValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last Order
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {customerMetrics.lastOrder}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Customer Status */}
            <Box sx={{ mt: 2 }}>
              <Chip
                label={selectedCustomer.status || 'Active'}
                size="small"
                color={selectedCustomer.status === 'inactive' ? 'error' : 'success'}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
}
