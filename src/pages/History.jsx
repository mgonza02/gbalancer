import { Add, Delete, Download, Edit, ExpandMore, FilterList, History as HistoryIcon, PlayArrow, Search, Upload } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SaveBalanceDialog from '../components/SaveBalanceDialog';
import BalanceService from '../services/balanceService';

const History = () => {
  const navigate = useNavigate();
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
    loadBalances();
  }, []);

  const loadBalances = async () => {
    setLoading(true);
    setError('');

    try {
      const savedBalances = await BalanceService.getAllBalances();
      setBalances(savedBalances);
    } catch (err) {
      console.error('Error loading balances:', err);
      setError('Failed to load balance history');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBalance = (balance) => {
    // Navigate to dashboard with the balance data
    navigate('/dashboard', { state: { balance } });
  };

  const handleDeleteBalance = async (balanceId) => {
    try {
      await BalanceService.deleteBalance(balanceId);
      setBalances(balances.filter(b => b.id !== balanceId));
      setDeleteConfirmOpen(false);
      setBalanceToDelete(null);
    } catch (err) {
      console.error('Error deleting balance:', err);
      setError('Failed to delete balance');
    }
  };

  const handleEditBalance = (balance) => {
    setEditingBalance(balance);
    setSaveDialogOpen(true);
  };

  const handleSaveBalance = async (updatedBalance) => {
    try {
      const saved = await BalanceService.updateBalance(updatedBalance.id, updatedBalance);
      setBalances(balances.map(b => b.id === saved.id ? saved : b));
      setSaveDialogOpen(false);
      setEditingBalance(null);
    } catch (err) {
      console.error('Error updating balance:', err);
      setError('Failed to update balance');
    }
  };

  const handleExportBalance = (balance) => {
    const dataStr = JSON.stringify(balance, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `balance_${balance.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportBalance = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedBalance = JSON.parse(e.target.result);
          // Add imported balance to the list
          const saved = await BalanceService.saveBalance({
            ...importedBalance,
            name: `${importedBalance.name} (Imported)`,
            id: undefined, // Let the service generate a new ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          setBalances([saved, ...balances]);
        } catch (err) {
          console.error('Error importing balance:', err);
          setError('Failed to import balance - invalid file format');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  // Filter balances based on search term and selected tags
  const filteredBalances = useMemo(() => {
    let filtered = balances;

    if (searchTerm) {
      filtered = filtered.filter(balance =>
        balance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(balance =>
        selectedTags.every(tag => balance.tags?.includes(tag))
      );
    }

    return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [balances, searchTerm, selectedTags]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    balances.forEach(balance => {
      balance.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [balances]);

  const handleTagFilter = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setFilterMenuAnchor(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ flex: 1, py: { xs: 2, md: 3 } }}>
      <Container maxWidth='xl'>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='h3'
            component='h1'
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Balance History
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Manage and restore your saved territory balance configurations
          </Typography>
        </Box>

        {/* Search and Actions */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search balances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 300, flex: 1 }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{ minWidth: 'auto' }}
              >
                Filter
              </Button>

              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-balance-file"
                type="file"
                onChange={handleImportBalance}
              />
              <label htmlFor="import-balance-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  sx={{ minWidth: 'auto' }}
                >
                  Import
                </Button>
              </label>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/dashboard')}
                sx={{ minWidth: 'auto' }}
              >
                New Balance
              </Button>
            </Box>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Filter by Tags
            </Typography>
          </MenuItem>
          {allTags.map(tag => (
            <MenuItem
              key={tag}
              onClick={() => handleTagFilter(tag)}
              sx={{
                bgcolor: selectedTags.includes(tag) ? 'primary.50' : 'transparent',
                '&:hover': { bgcolor: selectedTags.includes(tag) ? 'primary.100' : 'action.hover' }
              }}
            >
              <Chip
                label={tag}
                size="small"
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              {tag}
            </MenuItem>
          ))}
        </Menu>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading balance history...</Typography>
          </Box>
        )}

        {/* Balance List */}
        {!loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredBalances.length === 0 ? (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {balances.length === 0 ? 'No Balance History' : 'No matches found'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {balances.length === 0
                      ? 'Start by creating and saving your first territory balance configuration.'
                      : 'Try adjusting your search terms or filters.'
                    }
                  </Typography>
                  {balances.length === 0 && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/dashboard')}
                      sx={{ mt: 2 }}
                    >
                      Create Balance
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredBalances.map((balance) => (
                <Card key={balance.id} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {balance.name}
                        </Typography>

                        {balance.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {balance.description}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {balance.tags?.map(tag => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Load Balance">
                          <IconButton
                            onClick={() => handleLoadBalance(balance)}
                            color="primary"
                            size="small"
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Balance">
                          <IconButton
                            onClick={() => handleEditBalance(balance)}
                            color="default"
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Export Balance">
                          <IconButton
                            onClick={() => handleExportBalance(balance)}
                            color="default"
                            size="small"
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Balance">
                          <IconButton
                            onClick={() => {
                              setBalanceToDelete(balance);
                              setDeleteConfirmOpen(true);
                            }}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">Balance Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Number of Sellers</Typography>
                              <Typography variant="body2">{balance.controls?.numSellers || 0}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Max Customers per Territory</Typography>
                              <Typography variant="body2">{balance.controls?.maxCustomersPerPolygon || 0}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Territories Generated</Typography>
                              <Typography variant="body2">{balance.territories?.length || 0}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                              <Typography variant="body2">{formatDate(balance.updatedAt)}</Typography>
                            </Box>
                          </Box>

                          {balance.territories && balance.territories.length > 0 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Territory Distribution
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {balance.territories.map((territory, index) => (
                                  <Chip
                                    key={index}
                                    label={`T${territory.id}: ${territory.customerCount} customers`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Balance</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{balanceToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              onClick={() => handleDeleteBalance(balanceToDelete.id)}
              color="error"
              variant="contained"
            >
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
          onSave={handleSaveBalance}
          initialData={editingBalance}
          customers={editingBalance?.customers || []}
          territories={editingBalance?.territories || []}
          controls={editingBalance?.controls || {}}
        />
      </Container>
    </Box>
  );
};

export default History;
