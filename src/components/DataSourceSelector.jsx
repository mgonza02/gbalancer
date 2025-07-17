import { Api, CloudUpload, CheckCircle as SampleData, Upload } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { handleMakeCustomers } from '../data/mockCustomers';

const DataSourceSelector = ({ onCustomerDataLoad, currentDataSource, disabled = false }) => {
  const [selectedSource, setSelectedSource] = useState(currentDataSource || 'sample');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API form state
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [bearerToken, setBearerToken] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
    setError('');
  };

  const handleSampleDataLoad = async () => {
    setLoading(true);
    setError('');

    try {
      const sampleData = handleMakeCustomers();

      // Save to localStorage
      localStorage.setItem('customerData', JSON.stringify(sampleData));

      // Notify parent component
      onCustomerDataLoad(sampleData, 'sample');

    } catch (err) {
      setError('Failed to load sample data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Please select a JSON file');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Read and parse the file
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      // Validate data structure
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON file must contain an array of customer objects');
      }

      // Validate each customer object has required fields
      const validatedData = jsonData.map((customer, index) => {
        if (!customer.id) {
          throw new Error(`Customer at index ${index} is missing required 'id' field`);
        }
        if (!customer.customer_name && !customer.name) {
          throw new Error(`Customer at index ${index} is missing required 'customer_name' or 'name' field`);
        }
        if (!customer.lat || !customer.lng) {
          return null;
          // throw new Error(`Customer at index ${index} is missing required 'lat' or 'lng' coordinates`);
        }
        const lat = parseFloat(customer.lat);
        const lng = parseFloat(customer.lng);
        if (isNaN(lat) || isNaN(lng)|| lat ===0 || lng === 0) {
          return null;
          // throw new Error(`Customer at index ${index} has invalid 'lat' or 'lng' coordinates`);
        }
        if (!customer.sales) {
          throw new Error(`Customer at index ${index} is missing required 'sales' field`);
        }

        // Normalize the data structure
        return {
          id: customer.id,
          customer_name: customer.customer_name || customer.name,
          document_number: customer.document_number || '',
          lat: customer.lat,
          lng: customer.lng,
          sales: customer.sales,
          location: {
            lat: parseFloat(customer.lat),
            lng: parseFloat(customer.lng)
          }
        };
      }).filter(Boolean); // Remove any null entries

      // Save to localStorage
      localStorage.setItem('customerData', JSON.stringify(validatedData));

      // Notify parent component
      onCustomerDataLoad(validatedData, 'upload');

      setSelectedFile(file);

    } catch (err) {
      setError('Failed to process file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApiDataFetch = async () => {
    if (!apiEndpoint.trim()) {
      setError('Please enter an API endpoint');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (bearerToken.trim()) {
        headers['Authorization'] = `Bearer ${bearerToken.trim()}`;
      }

      const response = await fetch(apiEndpoint.trim(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();

      // Validate data structure
      if (!Array.isArray(jsonData)) {
        throw new Error('API response must contain an array of customer objects');
      }

      // Validate each customer object has required fields
      const validatedData = jsonData.map((customer, index) => {
        if (!customer.id) {
          throw new Error(`Customer at index ${index} is missing required 'id' field`);
        }
        if (!customer.customer_name && !customer.name) {
          throw new Error(`Customer at index ${index} is missing required 'customer_name' or 'name' field`);
        }
        if (!customer.lat || !customer.lng) {
          throw new Error(`Customer at index ${index} is missing required 'lat' or 'lng' coordinates`);
        }
        if (!customer.sales) {
          throw new Error(`Customer at index ${index} is missing required 'sales' field`);
        }

        // Normalize the data structure
        return {
          id: customer.id,
          customer_name: customer.customer_name || customer.name,
          document_number: customer.document_number || '',
          lat: customer.lat,
          lng: customer.lng,
          sales: customer.sales,
          location: {
            lat: parseFloat(customer.lat),
            lng: parseFloat(customer.lng)
          }
        };
      });

      // Save to localStorage
      localStorage.setItem('customerData', JSON.stringify(validatedData));

      // Notify parent component
      onCustomerDataLoad(validatedData, 'api');

    } catch (err) {
      setError('Failed to fetch data from API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadData = () => {
    switch (selectedSource) {
      case 'sample':
        handleSampleDataLoad();
        break;
      case 'upload':
        // File upload is handled by the input onChange
        break;
      case 'api':
        handleApiDataFetch();
        break;
      default:
        setError('Please select a data source');
    }
  };

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: 'divider',
      mb: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
          color: 'primary.main',
          mb: 2
        }}>
          <CloudUpload />
          Customer Data Source
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Data Source</InputLabel>
          <Select
            value={selectedSource}
            onChange={handleSourceChange}
            disabled={disabled}
          >
            <MenuItem value="sample">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SampleData />
                Sample Data
              </Box>
            </MenuItem>
            <MenuItem value="upload">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload />
                Upload JSON File
              </Box>
            </MenuItem>
            <MenuItem value="api">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Api />
                From API
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Loading customer data...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Sample Data Option */}
        {selectedSource === 'sample' && (
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Load pre-configured sample customer data for testing and demonstration purposes.
            </Typography>
            <Button
              variant='contained'
              onClick={handleSampleDataLoad}
              disabled={loading || disabled}
              sx={{ mb: 2 }}
            >
              Load Sample Data
            </Button>
          </Box>
        )}

        {/* File Upload Option */}
        {selectedSource === 'upload' && (
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Upload a JSON file containing customer data. File must be less than 5MB and contain an array of customer objects.
            </Typography>
            <Stack spacing={2}>
              <input
                accept='.json'
                style={{ display: 'none' }}
                id='customer-file-upload'
                type='file'
                onChange={handleFileUpload}
                disabled={loading || disabled}
              />
              <label htmlFor='customer-file-upload'>
                <Button
                  variant='contained'
                  component='span'
                  disabled={loading || disabled}
                  startIcon={<Upload />}
                >
                  Choose JSON File
                </Button>
              </label>
              {selectedFile && (
                <Typography variant='body2' color='text.secondary'>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        {/* API Option */}
        {selectedSource === 'api' && (
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Fetch customer data from an API endpoint. The API should return a JSON array of customer objects.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label='API Endpoint'
                placeholder='https://api.example.com/customers'
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                disabled={loading || disabled}
                fullWidth
                required
              />
              <TextField
                label='Bearer Token (Optional)'
                placeholder='your-auth-token'
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                disabled={loading || disabled}
                fullWidth
                type='password'
              />
              <Button
                variant='contained'
                onClick={handleApiDataFetch}
                disabled={loading || disabled || !apiEndpoint.trim()}
              >
                Fetch Data
              </Button>
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant='caption' color='text.secondary'>
          <strong>Required JSON Structure:</strong> Each customer object must have: id, customer_name (or name), lat, lng, sales
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DataSourceSelector;
