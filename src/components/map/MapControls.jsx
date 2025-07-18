import { Add, ZoomOutMap } from '@mui/icons-material';
import { Box, Fade, IconButton, Tooltip } from '@mui/material';
import { useCallback } from 'react';
import { useMapContext } from '../../contexts/MapContext';

/**
 * Map Controls Component
 * Implements Single Responsibility Principle for map interaction controls
 */
export default function MapControls({ editMode = false, confirmEdits = true }) {
  const {
    mapInstance,
    customers,
    drawingMode,
    setDrawingMode,
    drawingManager,
    setDrawingManager,
    newPolygon,
    setNewPolygon,
    pendingEdit,
    setPendingEdit,
    originalPolygonState,
    polygonRefs,
    cleanupDrawingState,
    cancelEdit
  } = useMapContext();

  // Fit bounds function
  const fitBounds = useCallback(() => {
    if (mapInstance && customers?.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      customers.forEach(customer => {
        bounds.extend(customer.location);
      });
      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, customers]);

  // Handle drawing mode toggle
  const handleDrawingModeToggle = useCallback(() => {
    console.log('Drawing mode toggle clicked');
    console.log('Drawing manager:', drawingManager);
    console.log('Map instance:', mapInstance);
    console.log('Current drawing mode:', drawingMode);

    if (!drawingManager || !mapInstance) {
      console.warn('Drawing manager or map not initialized');
      return;
    }

    if (drawingMode) {
      console.log('Disabling drawing mode');
      drawingManager.setDrawingMode(null);
      setDrawingMode(false);
      cleanupDrawingState();
    } else {
      console.log('Enabling drawing mode');
      if (newPolygon) {
        newPolygon.setMap(null);
        setNewPolygon(null);
      }

      try {
        // First clear any existing drawing mode
        drawingManager.setDrawingMode(null);

        // Then set polygon drawing mode
        setTimeout(() => {
          console.log('Setting polygon drawing mode');
          drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
          setDrawingMode(true);
          console.log('Drawing mode enabled');
        }, 50);
      } catch (error) {
        console.error('Error enabling drawing mode:', error);
      }
    }
  }, [drawingManager, drawingMode, newPolygon, setNewPolygon, mapInstance, cleanupDrawingState, setDrawingMode]);

  // Handle cancel edit with enhanced restoration
  const handleCancelEdit = useCallback(() => {
    if (confirmEdits) {
      if (window.confirm('Are you sure you want to cancel editing? All changes will be lost.')) {
        cancelEdit();
      }
    } else {
      cancelEdit();
    }
  }, [cancelEdit, confirmEdits]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 60, sm: 80 },
        left: { xs: 12, sm: 16 },
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Fit Bounds Button */}
      <Tooltip title="Fit all territories">
        <IconButton
          onClick={fitBounds}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 3,
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ZoomOutMap fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>

      {/* Drawing Mode Toggle Button */}
      <Tooltip title={drawingMode ? 'Cancel Drawing' : 'Draw New Territory'}>
        <IconButton
          onClick={handleDrawingModeToggle}
          sx={{
            bgcolor: drawingMode ? 'warning.main' : 'background.paper',
            color: drawingMode ? 'warning.contrastText' : 'text.primary',
            boxShadow: 3,
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            '&:hover': {
              bgcolor: drawingMode ? 'warning.dark' : 'action.hover',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Add fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>

      {/* Cancel Edit Button */}
      {pendingEdit && editMode && (
        <Fade in={true} timeout={300}>
          <Tooltip title="Cancel Changes and Restore Original">
            <IconButton
              onClick={handleCancelEdit}
              sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                boxShadow: 3,
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                '&:hover': {
                  bgcolor: 'error.dark',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Undo fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        </Fade>
      )}
    </Box>
  );
}
