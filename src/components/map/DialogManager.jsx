import {
  Add,
  Cancel,
  Delete,
  Edit,
  Save,
  Warning
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useMapContext } from '../../contexts/MapContext';

/**
 * Dialog Manager Component for Territory Operations
 * Implements Single Responsibility Principle for dialog management
 */
export default function DialogManager({
  open = false,
  dialogType = 'create', // 'create', 'edit', 'delete'
  onClose,
  onSave,
  onDelete,
  territoryData = null // Add territoryData prop for territory information
}) {
  const {
    activePolygon,
    drawingMode,
    newPolygon,
    territoryColors,
    territories
  } = useMapContext();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    maxCapacity: 100
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      const currentTerritory = territoryData || activePolygon;

      if (dialogType === 'edit' && currentTerritory) {
        setFormData({
          name: currentTerritory.name || '',
          description: currentTerritory.description || '',
          priority: currentTerritory.priority || 'medium',
          maxCapacity: currentTerritory.maxCapacity || 100
        });
      } else if (dialogType === 'create') {
        setFormData({
          name: '',
          description: '',
          priority: 'medium',
          maxCapacity: 100
        });
      }
      setValidationErrors({});
    }
  }, [open, dialogType, activePolygon, territoryData]);

  // Handle form field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [validationErrors]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Territory name is required';
    }

    if (formData.maxCapacity < 1 || formData.maxCapacity > 1000) {
      errors.maxCapacity = 'Capacity must be between 1 and 1000';
    }

    // Check for duplicate names (except current territory)
    if (territories) {
      const currentTerritory = territoryData || activePolygon;
      const duplicateName = territories.find(t =>
        t.name === formData.name.trim() &&
        t.id !== currentTerritory?.id
      );
      if (duplicateName) {
        errors.name = 'Territory name already exists';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, territories, activePolygon, territoryData]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    const currentTerritory = territoryData || activePolygon;
    const territoryToSave = {
      ...formData,
      id: currentTerritory?.id || Date.now(),
      path: currentTerritory?.path || [],
      centroid: currentTerritory?.centroid || null,
      area: currentTerritory?.area || 0,
      customers: currentTerritory?.customers || [],
      customerCount: currentTerritory?.customerCount || 0,
      totalSales: currentTerritory?.totalSales || 0,
      color: currentTerritory?.color || '#4CAF50',
      zone: currentTerritory?.zone || 'A',
      lastModified: new Date().toISOString()
    };

    if (onSave) {
      onSave(territoryToSave);
    }

    onClose();
  }, [formData, validateForm, activePolygon, territoryData, onSave, onClose]);

  // Handle delete
  const handleDelete = useCallback(() => {
    const currentTerritory = territoryData || activePolygon;
    if (onDelete && currentTerritory) {
      onDelete(currentTerritory);
    }
    onClose();
  }, [onDelete, activePolygon, territoryData, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Get dialog configuration
  const getDialogConfig = useCallback(() => {
    switch (dialogType) {
      case 'create':
        return {
          title: 'Create New Territory',
          icon: <Add />,
          confirmText: 'Create Territory',
          confirmIcon: <Save />,
          color: 'primary'
        };
      case 'edit':
        return {
          title: 'Edit Territory',
          icon: <Edit />,
          confirmText: 'Save Changes',
          confirmIcon: <Save />,
          color: 'primary'
        };
      case 'delete':
        return {
          title: 'Delete Territory',
          icon: <Warning />,
          confirmText: 'Delete Territory',
          confirmIcon: <Delete />,
          color: 'error'
        };
      default:
        return {
          title: 'Territory',
          icon: null,
          confirmText: 'Save',
          confirmIcon: <Save />,
          color: 'primary'
        };
    }
  }, [dialogType]);

  const config = getDialogConfig();

  // Territory color for display
  const currentTerritory = territoryData || activePolygon;
  const territoryColor = territories && currentTerritory ?
    territoryColors[territories.findIndex(t => t.id === currentTerritory.id) % territoryColors.length] :
    currentTerritory?.color || '#4CAF50';

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          ...(dialogType === 'delete' && {
            borderTop: 4,
            borderTopColor: 'error.main'
          })
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {config.icon}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {config.title}
          </Typography>
          {currentTerritory && (
            <Chip
              label={currentTerritory.name || `Territory ${currentTerritory.id}`}
              size="small"
              sx={{
                bgcolor: territoryColor,
                color: 'white',
                '& .MuiChip-label': {
                  fontWeight: 600
                }
              }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {dialogType === 'delete' ? (
          // Delete Confirmation
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. All customer assignments and territory data will be permanently deleted.
            </Alert>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete <strong>{currentTerritory?.name || `Territory ${currentTerritory?.id}`}</strong>?
            </Typography>

            {currentTerritory?.customerCount > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                This territory contains <strong>{currentTerritory.customerCount} customers</strong>
                that will become unassigned.
              </Alert>
            )}

            {/* Territory Stats */}
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Territory Statistics:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Customers
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currentTerritory?.customerCount || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${currentTerritory?.totalSales?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          // Create/Edit Form
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Drawing Status */}
            {dialogType === 'create' && drawingMode && (
              <Alert severity="info">
                Draw the territory boundary on the map, then return here to complete the setup.
              </Alert>
            )}

            {/* Territory Name */}
            <TextField
              label="Territory Name"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              placeholder="e.g., Downtown District, North Region"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            {/* Description */}
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Optional description of the territory coverage area..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Priority */}
              <TextField
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </TextField>

              {/* Max Capacity */}
              <TextField
                label="Max Capacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => handleFieldChange('maxCapacity', parseInt(e.target.value))}
                error={!!validationErrors.maxCapacity}
                helperText={validationErrors.maxCapacity}
                inputProps={{ min: 1, max: 1000 }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>

            {/* Current Stats (Edit Mode) */}
            {dialogType === 'edit' && currentTerritory && (
              <>
                <Divider />
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Current Statistics:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Customers
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentTerritory.customerCount || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Sales
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${currentTerritory.totalSales?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Utilization
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {Math.round(((currentTerritory.customerCount || 0) / (currentTerritory.maxCapacity || 100)) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCancel}
          startIcon={<Cancel />}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>

        <Button
          onClick={dialogType === 'delete' ? handleDelete : handleSave}
          variant="contained"
          color={config.color}
          startIcon={config.confirmIcon}
          disabled={dialogType === 'create' && !newPolygon}
          sx={{
            borderRadius: 2,
            minWidth: 140
          }}
        >
          {config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
