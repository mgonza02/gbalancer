/* eslint-disable no-undef */
import { Add, Delete, Download, Edit, ExpandMore, FilterList, History, PlayArrow, Search, Upload } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import BalanceService from '../services/balanceService';
import SaveBalanceDialog from './SaveBalanceDialog';

const BalanceHistory = ({ open, onClose, onLoadBalance, currentBalance, customers, territories }) => {
  const [balances, setBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingBalance, setEditingBalance] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [balanceToDelete, setBalanceToDelete] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load balances on component mount
  useEffect(() => {
    if (open) {
      loadBalances();
    }
  }, [open]);

  const loadBalances = async () => {
    setLoading(true);
    setError('');
    try {
      const loadedBalances = await BalanceService.getAllBalances();
      setBalances(loadedBalances);
    } catch (err) {
      setError('Failed to load balance history');
      console.error('Error loading balances:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from balances
  const allTags = useMemo(() => {
    const tagSet = new Set();
    balances.forEach(balance => {
      if (balance.tags) {
        balance.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [balances]);

  // Filter balances based on search and tags
  const filteredBalances = useMemo(() => {
    return balances.filter(balance => {
      const matchesSearch =
        searchTerm === '' ||
        balance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (balance.description && balance.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTags = selectedTags.length === 0 || (balance.tags && selectedTags.every(tag => balance.tags.includes(tag)));

      return matchesSearch && matchesTags;
    });
  }, [balances, searchTerm, selectedTags]);

  const handleLoadBalance = async balance => {
    try {
      setLoading(true);
      onLoadBalance(balance);
      onClose();
    } catch (err) {
      setError('Failed to load balance configuration');
      console.error('Error loading balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalance = balance => {
    setEditingBalance(balance);
    setSaveDialogOpen(true);
  };

  const handleSaveEdit = async updatedBalance => {
    try {
      setLoading(true);
      await BalanceService.updateBalance(editingBalance.id, updatedBalance);
      await loadBalances();
      setEditingBalance(null);
      setSaveDialogOpen(false);
    } catch (err) {
      setError('Failed to update balance');
      console.error('Error updating balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBalance = async () => {
    if (!balanceToDelete) return;

    try {
      setLoading(true);
      await BalanceService.deleteBalance(balanceToDelete.id);
      await loadBalances();
      setDeleteConfirmOpen(false);
      setBalanceToDelete(null);
    } catch (err) {
      setError('Failed to delete balance');
      console.error('Error deleting balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBalances = async () => {
    try {
      const exportData = await BalanceService.exportBalances();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export balances');
      console.error('Error exporting balances:', err);
    }
  };

  const handleImportBalances = async event => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const importData = e.target.result;
          await BalanceService.importBalances(importData);
          await loadBalances();
        } catch (err) {
          setError('Failed to import balances - invalid file format');
          console.error('Error importing balances:', err);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Failed to read import file');
      console.error('Error reading import file:', err);
      setLoading(false);
    }
  };

  const handleTagFilter = tag => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History />
            Balance History
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Search and Filter Controls */}
          <Box sx={{ mb: 3 }}>
            <Stack direction='row' spacing={2} alignItems='center'>
              <TextField
                placeholder='Search balances...'
                variant='outlined'
                size='small'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
                }}
                sx={{ flexGrow: 1 }}
              />

              <Button
                variant='outlined'
                startIcon={<FilterList />}
                onClick={e => setFilterMenuAnchor(e.currentTarget)}
                disabled={allTags.length === 0}
              >
                Tags ({selectedTags.length})
              </Button>

              <Button variant='outlined' startIcon={<Add />} onClick={() => setSaveDialogOpen(true)}>
                Save Current
              </Button>
            </Stack>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Filtering by tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedTags.map(tag => (
                    <Chip key={tag} label={tag} size='small' onDelete={() => handleTagFilter(tag)} color='primary' />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Balance List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography>Loading balances...</Typography>
            </Box>
          ) : filteredBalances.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='h6' color='text.secondary'>
                {balances.length === 0 ? 'No saved balances' : 'No balances match your filters'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {balances.length === 0
                  ? 'Save your first balance configuration to get started'
                  : 'Try adjusting your search or filter criteria'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredBalances.map(balance => (
                <Paper key={balance.id} elevation={1} sx={{ mb: 2 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box>
                            <Typography variant='h6'>{balance.name}</Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {formatDate(balance.createdAt)}
                            </Typography>
                          </Box>
                          {balance.tags && balance.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {balance.tags.map(tag => (
                                <Chip key={tag} label={tag} size='small' />
                              ))}
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title='Load Balance'>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                handleLoadBalance(balance);
                              }}
                              color='primary'
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Edit Balance'>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                handleEditBalance(balance);
                              }}
                              color='secondary'
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Delete Balance'>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                setBalanceToDelete(balance);
                                setDeleteConfirmOpen(true);
                              }}
                              color='error'
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {balance.description && (
                          <Typography variant='body2' color='text.secondary'>
                            {balance.description}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 4 }}>
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              Sellers
                            </Typography>
                            <Typography variant='h6'>{balance.summary.numSellers}</Typography>
                          </Box>
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              Territories
                            </Typography>
                            <Typography variant='h6'>{balance.summary.numTerritories}</Typography>
                          </Box>
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              Customers
                            </Typography>
                            <Typography variant='h6'>{balance.summary.totalCustomers}</Typography>
                          </Box>
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              Avg per Territory
                            </Typography>
                            <Typography variant='h6'>{balance.summary.avgCustomersPerTerritory}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button startIcon={<Download />} onClick={handleExportBalances}>
            Export All
          </Button>

          <Button startIcon={<Upload />} component='label'>
            Import
            <input type='file' accept='.json' hidden onChange={handleImportBalances} />
          </Button>

          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Tag Filter Menu */}
      <Menu anchorEl={filterMenuAnchor} open={Boolean(filterMenuAnchor)} onClose={() => setFilterMenuAnchor(null)}>
        {allTags.map(tag => (
          <MenuItem key={tag} onClick={() => handleTagFilter(tag)}>
            <Chip label={tag} size='small' color={selectedTags.includes(tag) ? 'primary' : 'default'} sx={{ mr: 1 }} />
            {tag}
          </MenuItem>
        ))}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Balance Configuration</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{balanceToDelete?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBalance} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save/Edit Dialog */}
      <SaveBalanceDialog
        open={saveDialogOpen}
        onClose={() => {
          setSaveDialogOpen(false);
          setEditingBalance(null);
        }}
        onSave={editingBalance ? handleSaveEdit : null}
        customers={customers}
        territories={territories}
        controls={currentBalance}
        editingBalance={editingBalance}
      />
    </>
  );
};

export default BalanceHistory;
