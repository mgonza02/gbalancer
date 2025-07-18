import { Clear, Refresh, Save, SelectAll, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Checkbox, Chip, FormControlLabel, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

// Helper to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Enhanced zone assignment based on geographical proximity
function assignZones(territories) {
  if (!territories || territories.length === 0) return [];

  // Create clusters based on centroid proximity
  const clusters = [];
  const processed = new Set();
  const ZONE_DISTANCE_THRESHOLD = 50; // 50km threshold for same zone

  territories.forEach((territory, index) => {
    if (processed.has(index)) return;

    const cluster = [{ ...territory, territoryIndex: index }];
    processed.add(index);

    // Find nearby territories (within threshold distance)
    territories.forEach((otherTerritory, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) return;

      // Check if both territories have valid centroids
      if (!territory.centroid || !otherTerritory.centroid) return;

      const distance = calculateDistance(
        territory.centroid.lat,
        territory.centroid.lng,
        otherTerritory.centroid.lat,
        otherTerritory.centroid.lng
      );

      if (distance < ZONE_DISTANCE_THRESHOLD) {
        cluster.push({ ...otherTerritory, territoryIndex: otherIndex });
        processed.add(otherIndex);
      }
    });

    clusters.push(cluster);
  });

  // Sort clusters by average customer count (largest zones first)
  clusters.sort((a, b) => {
    const avgA = a.reduce((sum, t) => sum + (t.customerCount || 0), 0) / a.length;
    const avgB = b.reduce((sum, t) => sum + (t.customerCount || 0), 0) / b.length;
    return avgB - avgA;
  });

  // Assign zone names to territories
  const processedTerritories = [];
  const zoneNames = ['North', 'South', 'East', 'West', 'Central', 'Northwest', 'Northeast', 'Southwest', 'Southeast'];

  clusters.forEach((cluster, clusterIndex) => {
    const zoneName = clusterIndex < zoneNames.length
      ? `${zoneNames[clusterIndex]} Zone`
      : `Zone ${String.fromCharCode(65 + clusterIndex - zoneNames.length)}`; // Zone A, Zone B, etc.

    cluster.forEach(territory => {
      processedTerritories.push({
        ...territory,
        code: territory.code || `T${territory.id.toString().padStart(3, '0')}`,
        zone: zoneName,
        originalIndex: territory.territoryIndex
      });
    });
  });

  // Sort by original index to maintain order
  return processedTerritories.sort((a, b) => a.originalIndex - b.originalIndex);
}

export default function TerritoryDataGrid({ territories = [], onTerritoryUpdate, onSave, showTerritories = true, onToggleTerritories, selectedTerritories = [], onSelectedTerritoriesChange }) {
  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);

  // Update rows when territories change
  useEffect(() => {
    if (territories && territories.length > 0) {
      const processedTerritories = assignZones(territories);
      setRows(processedTerritories);
      setHasChanges(false);
      // Initialize selection model with selected territories
      if (selectedTerritories.length > 0) {
        setSelectionModel(selectedTerritories);
      } else {
        // If no specific selection, select all territories by default
        setSelectionModel(processedTerritories.map(t => t.id));
      }
    } else {
      setRows([]);
      setHasChanges(false);
      setSelectionModel([]);
    }
  }, [territories, selectedTerritories]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!filter) return rows;
    const searchTerm = filter.toLowerCase();
    return rows.filter(row =>
      row.name?.toLowerCase().includes(searchTerm) ||
      row.code?.toLowerCase().includes(searchTerm) ||
      row.zone?.toLowerCase().includes(searchTerm)
    );
  }, [filter, rows]);

  // Handle cell edit
  const handleEditCellChange = (params) => {
    const { id, field, value } = params;

    if (field === 'code' || field === 'name') {
      setRows(prev => prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      ));
      setHasChanges(true);

      if (onTerritoryUpdate) {
        onTerritoryUpdate(id, field, value);
      }
    }
  };

  // Handle save territories
  const handleSave = () => {
    if (onSave) {
      onSave(rows);
      setHasChanges(false);
    }
  };

  // Handle refresh/reset
  const handleRefresh = () => {
    const processedTerritories = assignZones(territories);
    setRows(processedTerritories);
    setHasChanges(false);
  };

  // Handle selection change
  const handleSelectionChange = (newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    if (onSelectedTerritoriesChange) {
      onSelectedTerritoriesChange(newSelectionModel);
    }
  };

  // Handle select all/none
  const handleSelectAll = () => {
    const allIds = filteredRows.map(row => row.id);
    setSelectionModel(allIds);
    if (onSelectedTerritoriesChange) {
      onSelectedTerritoriesChange(allIds);
    }
  };

  const handleSelectNone = () => {
    setSelectionModel([]);
    if (onSelectedTerritoriesChange) {
      onSelectedTerritoriesChange([]);
    }
  };

  // Get zone color
  const getZoneColor = (zone) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
    const index = zone?.charCodeAt(zone.length - 1) - 65; // Extract zone letter
    return colors[index % colors.length] || 'default';
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 60 },
    {
      field: 'lastModified',
      headerName: 'Status',
      width: 70,
      renderCell: (params) => {
        const isRecent = params.value && new Date(params.value) > new Date(Date.now() - 5 * 60 * 1000); // Modified in last 5 minutes
        return isRecent ? (
          <Tooltip title="Recently edited">
            <Chip label="EDIT" size="small" color="warning" variant="outlined" sx={{ fontSize: '0.6rem' }} />
          </Tooltip>
        ) : null;
      }
    },
    {
      field: 'code',
      headerName: 'Code',
      width: 70,
      editable: true,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 120,
      editable: true,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'zone',
      headerName: 'Zone',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getZoneColor(params.value)}
          variant="outlined"
        />
      )
    },
    {
      field: 'customerCount',
      headerName: 'Customers',
      width: 80,
      type: 'number'
    },
    {
      field: 'totalSales',
      headerName: 'Sales',
      width: 90,
      type: 'number',
      valueFormatter: (params) => {
        if (params.value) {
          return `$${params.value.toLocaleString()}`;
        }
        return '-';
      }
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Controls Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        {/* Territory Visibility Toggle */}
        <FormControlLabel
          control={
            <Checkbox
              checked={showTerritories}
              onChange={(e) => onToggleTerritories && onToggleTerritories(e.target.checked)}
              icon={<VisibilityOff />}
              checkedIcon={<Visibility />}
              size="small"
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              Show on Map
            </Typography>
          }
          sx={{
            ml: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.75rem'
            }
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save changes">
            <IconButton
              onClick={handleSave}
              size="small"
              color={hasChanges ? 'primary' : 'default'}
              disabled={!hasChanges}
            >
              <Save />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Selection Controls Row */}
      {rows.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {selectionModel.length} of {filteredRows.length} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant="text"
              startIcon={<SelectAll />}
              onClick={handleSelectAll}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
            >
              All
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<Clear />}
              onClick={handleSelectNone}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
            >
              None
            </Button>
          </Box>
        </Box>
      )}

      {rows.length > 0 && (
        <TextField
          label="Filter territories"
          variant="outlined"
          size="small"
          fullWidth
          value={filter}
          onChange={e => setFilter(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {rows.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          textAlign: 'center',
          color: 'text.secondary'
        }}>
          <Typography variant="h6" gutterBottom>
            No Territories Generated
          </Typography>
          <Typography variant="body2">
            Generate territories first to view and edit territory data
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={25}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick={false}
            selectionModel={selectionModel}
            onSelectionModelChange={handleSelectionChange}
            onCellEditCommit={handleEditCellChange}
            sx={{
              height: '100%',
              '& .MuiDataGrid-cell--editable': {
                backgroundColor: 'action.hover',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'grey.50',
              },
              '& .MuiDataGrid-row.Mui-selected': {
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.main',
                },
              }
            }}
          />
        </Box>
      )}

      {hasChanges && (
        <Typography
          variant="caption"
          color="warning.main"
          sx={{ mt: 1, display: 'block' }}
        >
          You have unsaved changes. Click the save button to persist your edits.
        </Typography>
      )}
    </Box>
  );
}
