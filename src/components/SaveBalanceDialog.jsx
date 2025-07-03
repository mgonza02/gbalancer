/* eslint-disable no-undef */
import { Save, Tag } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import BalanceService from '../services/balanceService';

const SaveBalanceDialog = ({ open, onClose, controls, territories, customers }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [template, setTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Predefined templates for quick naming
  const templates = [
    { value: 'balanced', label: 'Balanced Distribution', suffix: 'Balanced' },
    { value: 'geographic', label: 'Geographic Clustering', suffix: 'Geographic' },
    { value: 'optimized', label: 'Optimized Territories', suffix: 'Optimized' },
    { value: 'experimental', label: 'Experimental Setup', suffix: 'Test' },
    { value: 'production', label: 'Production Ready', suffix: 'Production' }
  ];

  // Common tags for categorization
  const commonTags = [
    'Production',
    'Testing',
    'Backup',
    'Optimized',
    'Draft',
    'Approved',
    'High-Performance',
    'Regional',
    'Seasonal',
    'Emergency'
  ];

  const handleTemplateChange = value => {
    const selectedTemplate = templates.find(t => t.value === value);
    if (selectedTemplate) {
      const timestamp = new Date().toLocaleDateString();
      setName(`${selectedTemplate.suffix} - ${timestamp}`);
      setDescription(`${selectedTemplate.label} configuration created on ${timestamp}`);
    }
    setTemplate(value);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a name for this balance configuration',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      const savedBalance = BalanceService.saveBalance(name, description, controls, territories, customers.length, tags);

      setNotification({
        open: true,
        message: `Balance configuration "${savedBalance.name}" saved successfully!`,
        severity: 'success'
      });

      // Reset form
      setName('');
      setDescription('');
      setTags([]);
      setTemplate('');

      // Close dialog after a short delay
      setTimeout(() => {
        onClose(savedBalance);
      }, 1000);
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to save: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setDescription('');
      setTags([]);
      setTemplate('');
      onClose();
    }
  };

  const getBalanceStats = () => {
    if (!territories.length) return null;

    const totalCustomers = territories.reduce((sum, t) => sum + t.customerCount, 0);
    const avgCustomersPerTerritory = Math.round(totalCustomers / territories.length);
    const minCustomers = Math.min(...territories.map(t => t.customerCount));
    const maxCustomers = Math.max(...territories.map(t => t.customerCount));

    return {
      territories: territories.length,
      totalCustomers,
      avgCustomersPerTerritory,
      minCustomers,
      maxCustomers
    };
  };

  const stats = getBalanceStats();

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Save color='primary' />
            <Typography variant='h6'>Save Balance Configuration</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Template Selection */}
            <FormControl fullWidth>
              <InputLabel>Quick Template</InputLabel>
              <Select value={template} label='Quick Template' onChange={e => handleTemplateChange(e.target.value)}>
                <MenuItem value=''>
                  <em>Custom Name</em>
                </MenuItem>
                {templates.map(template => (
                  <MenuItem key={template.value} value={template.value}>
                    {template.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Name Field */}
            <TextField
              fullWidth
              label='Configuration Name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Enter a descriptive name for this balance'
              required
              error={!name.trim()}
              helperText={!name.trim() ? 'Name is required' : ''}
            />

            {/* Description Field */}
            <TextField
              fullWidth
              label='Description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Optional description of this balance configuration'
              multiline
              rows={3}
            />

            {/* Tags Field */}
            <Autocomplete
              multiple
              freeSolo
              value={tags}
              onChange={(event, newValue) => setTags(newValue)}
              options={commonTags}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant='outlined' label={option} size='small' icon={<Tag />} {...getTagProps({ index })} />
                ))
              }
              renderInput={params => (
                <TextField {...params} label='Tags' placeholder='Add tags for categorization' helperText='Press Enter to add custom tags' />
              )}
            />

            {/* Balance Statistics */}
            {stats && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Configuration Summary
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography variant='body2'>Territories: {stats.territories}</Typography>
                  <Typography variant='body2'>Total Customers: {stats.totalCustomers}</Typography>
                  <Typography variant='body2'>Avg per Territory: {stats.avgCustomersPerTerritory}</Typography>
                  <Typography variant='body2'>
                    Range: {stats.minCustomers} - {stats.maxCustomers}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Warning for no territories */}
            {!territories.length && (
              <Alert severity='warning'>No territories are currently generated. Generate territories first before saving.</Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant='contained' disabled={!name.trim() || !territories.length || saving} startIcon={<Save />}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SaveBalanceDialog;
