import {
    CheckCircle,
    Delete,
    Storage,
    Warning
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    Stack,
    Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import TerritoryDataService from '../services/territoryDataService';

/**
 * Storage Quota Monitor Component
 * Shows storage usage and provides cleanup tools
 */
export default function StorageQuotaMonitor({ open, onClose }) {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load storage info
  const loadStorageInfo = useCallback(async () => {
    setLoading(true);
    try {
      const info = TerritoryDataService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load info when dialog opens
  useEffect(() => {
    if (open) {
      loadStorageInfo();
    }
  }, [open, loadStorageInfo]);

  // Handle cleanup
  const handleCleanup = useCallback(async () => {
    if (window.confirm('This will remove old cached data. Territory data will be preserved. Continue?')) {
      try {
        const cleanedSpace = TerritoryDataService.cleanupOldData();
        alert(`Cleaned up ${cleanedSpace} bytes of old data`);
        loadStorageInfo();
      } catch (error) {
        alert('Error during cleanup: ' + error.message);
      }
    }
  }, [loadStorageInfo]);

  // Handle clear all data
  const handleClearAll = useCallback(async () => {
    if (window.confirm('This will permanently delete ALL territory data. This cannot be undone. Continue?')) {
      try {
        TerritoryDataService.clearTerritoryData();
        alert('All territory data cleared successfully');
        loadStorageInfo();
      } catch (error) {
        alert('Error clearing data: ' + error.message);
      }
    }
  }, [loadStorageInfo]);

  // Format bytes to human readable
  const formatBytes = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Get severity color based on usage
  const getSeverity = useCallback((usagePercent) => {
    if (usagePercent > 90) return 'error';
    if (usagePercent > 80) return 'warning';
    if (usagePercent > 60) return 'info';
    return 'success';
  }, []);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage />
          <Typography variant="h6">Storage Quota Monitor</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Loading storage information...
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Storage Usage Overview */}
            <Card>
              <CardHeader title="Storage Usage" />
              <CardContent>
                {storageInfo && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Usage: {formatBytes(storageInfo.totalSize)} / {formatBytes(storageInfo.estimatedQuota)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {storageInfo.usagePercent.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(storageInfo.usagePercent, 100)}
                        color={getSeverity(storageInfo.usagePercent)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {/* Usage Status */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={storageInfo.usagePercent > 90 ? <Warning /> : <CheckCircle />}
                        label={storageInfo.usagePercent > 90 ? 'Critical' : 'Good'}
                        color={getSeverity(storageInfo.usagePercent)}
                        size="small"
                      />
                      <Chip
                        label={`${formatBytes(storageInfo.remainingSpace)} remaining`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    {/* Alerts */}
                    {storageInfo.usagePercent > 90 && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <strong>Critical:</strong> Storage is nearly full. Data saving may fail.
                      </Alert>
                    )}
                    {storageInfo.usagePercent > 80 && storageInfo.usagePercent <= 90 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <strong>Warning:</strong> Storage is getting full. Consider cleanup.
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Territory Data Info */}
            <Card>
              <CardHeader title="Territory Data" />
              <CardContent>
                <Stack spacing={2}>
                  {storageInfo?.territoriesCount && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Territories: {storageInfo.territoriesCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data Size: {formatBytes(storageInfo.dataSize || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Saved: {storageInfo.lastSaved ? new Date(storageInfo.lastSaved).toLocaleString() : 'Never'}
                      </Typography>
                    </Box>
                  )}

                  {storageInfo?.version?.includes('minimal') && (
                    <Alert severity="info">
                      <strong>Note:</strong> Data is stored in minimal format. Customer details may be missing.
                    </Alert>
                  )}

                  {storageInfo?.hasSessionData && (
                    <Alert severity="warning">
                      <strong>Warning:</strong> Data is stored in session storage (temporary).
                    </Alert>
                  )}

                  {storageInfo?.hasBackup && (
                    <Alert severity="info">
                      <strong>Info:</strong> Backup data is available.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Cleanup Tools */}
            <Card>
              <CardHeader title="Cleanup Tools" />
              <CardContent>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={handleCleanup}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Clean Up Old Data
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Removes old cached data while preserving territory information
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleClearAll}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Clear All Territory Data
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Permanently deletes all territory data (cannot be undone)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader title="Recommendations" />
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • Export your territory data regularly as backup
                  </Typography>
                  <Typography variant="body2">
                    • Remove unnecessary territories to save space
                  </Typography>
                  <Typography variant="body2">
                    • Use cleanup tools when storage gets full
                  </Typography>
                  <Typography variant="body2">
                    • Consider using external storage for large datasets
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={loadStorageInfo} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
