// PDF Export Test Page
import { Add as AddIcon, Clear as ClearIcon, PictureAsPdf as PdfIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

// project imports
import MainCard from 'components/MainCard';
import PDFExportService from 'utils/PDFExportService';
import { addSampleProjects, clearAllProjects } from 'utils/sampleProjectData';

// ==============================|| PDF EXPORT TEST PAGE ||==============================

export default function PDFExportTest() {
  const [projects, setProjects] = useState([]);
  const [isExporting, setIsExporting] = useState(null);
  const [exportResults, setExportResults] = useState([]);

  // Load projects from localStorage
  const loadProjects = () => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('cuttingProjects') || '[]');
      setProjects(savedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddSampleData = () => {
    try {
      addSampleProjects();
      loadProjects();
    } catch (error) {
      console.error('Error adding sample data:', error);
    }
  };

  const handleClearData = () => {
    try {
      clearAllProjects();
      loadProjects();
      setExportResults([]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const handleExportPDF = async project => {
    setIsExporting(project.id);
    try {
      const pdfService = new PDFExportService();
      const result = await pdfService.exportVisualizationToPDF(
        project,
        null, // No specific visualization element
        {
          fileName: `test-export-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
          includeStats: true,
          includeDetails: true,
          orientation: 'portrait',
          paperSize: 'a4'
        }
      );

      // Add result to the list
      setExportResults(prev => [
        {
          projectName: project.name,
          timestamp: new Date().toLocaleString(),
          success: result.success,
          fileName: result.fileName,
          error: result.error,
          message: result.message
        },
        ...prev.slice(0, 9)
      ]); // Keep last 10 results
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportResults(prev => [
        {
          projectName: project.name,
          timestamp: new Date().toLocaleString(),
          success: false,
          error: error.message,
          message: 'Export failed with exception'
        },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setIsExporting(null);
    }
  };

  const getMaterialColor = material => {
    const colors = {
      glass: 'info',
      wood: 'success',
      metal: 'warning',
      plastic: 'secondary'
    };
    return colors[material] || 'default';
  };

  const getEfficiencyColor = efficiency => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 80) return 'warning';
    return 'error';
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant='h4' gutterBottom>
          PDF Export Test Page
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Test the enhanced PDF export functionality with sample cutting plans
        </Typography>
      </Grid>

      {/* Controls */}
      <Grid size={12}>
        <MainCard title='Test Controls'>
          <Box display='flex' gap={2} flexWrap='wrap'>
            <Button variant='contained' startIcon={<AddIcon />} onClick={handleAddSampleData} color='primary'>
              Add Sample Projects
            </Button>

            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadProjects} color='secondary'>
              Reload Projects
            </Button>

            <Button variant='outlined' startIcon={<ClearIcon />} onClick={handleClearData} color='error'>
              Clear All Data
            </Button>
          </Box>

          <Box mt={2}>
            <Alert severity='info'>
              <strong>Instructions:</strong>
              <br />
              1. Click "Add Sample Projects" to populate test data
              <br />
              2. Use the "Export PDF" buttons to test the enhanced PDF generation
              <br />
              3. Each sheet will be rendered on its own page in portrait format with high-quality visualizations
              <br />
              4. Check the browser's download folder for the generated PDFs
            </Alert>
          </Box>
        </MainCard>
      </Grid>

      {/* Projects List */}
      <Grid size={{ xs: 12, md: 8 }}>
        <MainCard title={`Available Projects (${projects.length})`}>
          {projects.length === 0 ? (
            <Box textAlign='center' py={4}>
              <Typography variant='body2' color='text.secondary'>
                No projects found. Click "Add Sample Projects" to create test data.
              </Typography>
            </Box>
          ) : (
            <List>
              {projects.map(project => (
                <ListItem
                  key={project.id}
                  divider
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display='flex' alignItems='center' gap={1}>
                        <Box component='span' sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                          {project.name}
                        </Box>
                        <Chip label={project.materialType} color={getMaterialColor(project.materialType)} size='small' />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box component='span' sx={{ fontSize: '0.875rem', display: 'block' }}>
                          Sheet: {project.sheetWidth} × {project.sheetHeight} mm
                        </Box>
                        <Box component='span' sx={{ fontSize: '0.875rem', display: 'block' }}>
                          Sheets: {project.sheetsNeeded} | Pieces: {project.totalPieces}
                        </Box>
                        <Box display='flex' alignItems='center' gap={1} mt={0.5}>
                          <Box component='span' sx={{ fontSize: '0.875rem' }}>
                            Efficiency:
                          </Box>
                          <Chip label={`${project.efficiency}%`} color={getEfficiencyColor(project.efficiency)} size='small' />
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge='end' onClick={() => handleExportPDF(project)} disabled={isExporting === project.id} color='primary'>
                      {isExporting === project.id ? <CircularProgress size={24} /> : <PdfIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </MainCard>
      </Grid>

      {/* Export Results */}
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title='Export Results'>
          {exportResults.length === 0 ? (
            <Box textAlign='center' py={4}>
              <Typography variant='body2' color='text.secondary'>
                No exports yet. Try exporting a project to see results here.
              </Typography>
            </Box>
          ) : (
            <List dense>
              {exportResults.map((result, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: 1,
                    borderColor: result.success ? 'success.main' : 'error.main',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: result.success ? 'success.50' : 'error.50'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        component='span'
                        sx={{ fontSize: '1rem', fontWeight: 500, color: result.success ? 'success.dark' : 'error.dark' }}
                      >
                        {result.projectName}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box component='span' sx={{ fontSize: '0.75rem', display: 'block' }}>
                          {result.timestamp}
                        </Box>
                        <Box
                          component='span'
                          sx={{ fontSize: '0.875rem', color: result.success ? 'success.dark' : 'error.dark', display: 'block' }}
                        >
                          {result.message}
                        </Box>
                        {result.fileName && (
                          <Box component='span' sx={{ fontSize: '0.75rem', display: 'block', fontFamily: 'monospace' }}>
                            {result.fileName}
                          </Box>
                        )}
                        {result.error && (
                          <Box
                            component='span'
                            sx={{ fontSize: '0.75rem', color: 'error.main', fontFamily: 'monospace', mt: 0.5, display: 'block' }}
                          >
                            {result.error}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </MainCard>
      </Grid>

      {/* Feature Information */}
      <Grid size={12}>
        <MainCard title='Enhanced PDF Export Features'>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='h6' gutterBottom>
                Complete Page Layout
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary='Each sheet renders on its own page' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Professional header with branding' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Detailed statistics panel' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='High-quality SVG visualizations' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Comprehensive cut lists' />
                </ListItem>
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='h6' gutterBottom>
                Visualization Quality
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary='3x scale rendering for clarity' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Waste area highlighting' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Color-coded cut identification' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Precise measurements and labels' />
                </ListItem>
                <ListItem>
                  <ListItemText primary='Professional styling and gradients' />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
