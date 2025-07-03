// material-ui
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// project imports
import MainCard from 'components/MainCard';
import CuttingPlanVisualization from 'components/CuttingPlanVisualization';
import CuttingOptimizationService from 'utils/CuttingOptimizationService';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// ==============================|| NEW PLANNING PAGE ||============================== //

export default function NewPlanning() {
  const { t } = useTranslation();
  const [sheetType, setSheetType] = useState('glass');
  const [sheetWidth, setSheetWidth] = useState('');
  const [sheetHeight, setSheetHeight] = useState('');
  const [pieces, setPieces] = useState([{ id: 1, width: '', height: '', quantity: 1 }]);
  const [result, setResult] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [originalProjectId, setOriginalProjectId] = useState(null);

  // Initialize optimization service
  const optimizationService = new CuttingOptimizationService();

  // Check for project to recalculate on component mount
  useEffect(() => {
    const projectToRecalculate = localStorage.getItem('projectToRecalculate');
    if (projectToRecalculate) {
      try {
        const project = JSON.parse(projectToRecalculate);
        loadProjectForRecalculation(project);
        // Clear the stored project data
        localStorage.removeItem('projectToRecalculate');
      } catch (error) {
        console.error('Error loading project for recalculation:', error);
      }
    }
  }, []);

  const loadProjectForRecalculation = project => {
    setSheetType(project.materialType);
    setSheetWidth(project.sheetWidth.toString());
    setSheetHeight(project.sheetHeight.toString());

    // Convert pieces to the format expected by the form
    const formattedPieces = project.pieces.map((piece, index) => ({
      id: index + 1,
      width: piece.width.toString(),
      height: piece.height.toString(),
      quantity: piece.quantity
    }));

    setPieces(formattedPieces);
    setProjectName(project.name);
    setIsRecalculating(true);
    setOriginalProjectId(project.id);

    // Show notification
    setSnackbar({
      open: true,
      message: `Loaded project "${project.name}" for recalculation`,
      severity: 'info'
    });
  };

  const handleAddPiece = () => {
    const newId = pieces.length > 0 ? Math.max(...pieces.map(p => p.id)) + 1 : 1;
    setPieces([...pieces, { id: newId, width: '', height: '', quantity: 1 }]);
  };

  const handleRemovePiece = id => {
    setPieces(pieces.filter(piece => piece.id !== id));
  };

  const handlePieceChange = (id, field, value) => {
    setPieces(pieces.map(piece => (piece.id === id ? { ...piece, [field]: value } : piece)));
  };

  const calculateSheets = () => {
    // Validate inputs
    if (!sheetWidth || !sheetHeight || pieces.length === 0) return;

    const sheetW = parseFloat(sheetWidth);
    const sheetH = parseFloat(sheetHeight);

    // Validate pieces using the optimization service
    const validation = optimizationService.validateCuts(pieces, sheetW, sheetH);

    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: `Validation Error: ${validation.errors.join(', ')}`,
        severity: 'error'
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      setSnackbar({
        open: true,
        message: `Warning: ${validation.warnings.join(', ')}`,
        severity: 'warning'
      });
    }

    const sheetArea = sheetW * sheetH;
    let totalPieceArea = 0;
    let totalPieces = 0;

    pieces.forEach(piece => {
      if (piece.width && piece.height && piece.quantity) {
        const pieceArea = parseFloat(piece.width) * parseFloat(piece.height) * parseInt(piece.quantity);
        totalPieceArea += pieceArea;
        totalPieces += parseInt(piece.quantity);
      }
    });

    // Generate optimal layout using the optimization service
    const optimizationResult = optimizationService.findBestLayout(pieces, sheetW, sheetH);
    const { layout } = optimizationResult;
    const { stats } = optimizationResult;

    const sheetsNeeded = layout.length;
    const efficiency = stats.averageEfficiency.toFixed(2);

    setResult({
      sheetsNeeded,
      totalPieces,
      totalPieceArea: totalPieceArea.toFixed(2),
      sheetArea: sheetArea.toFixed(2),
      efficiency,
      layout,
      optimizationStats: stats,
      algorithm: optimizationResult.algorithm
    });

    // Show success message with algorithm used
    setSnackbar({
      open: true,
      message: `Layout optimized using ${optimizationResult.algorithm}. Total guillotine cuts: ${stats.totalGuillotineCuts}`,
      severity: 'success'
    });
  };

  const handleSaveProject = () => {
    if (!result) {
      setSnackbar({
        open: true,
        message: 'Please calculate results before saving',
        severity: 'error'
      });
      return;
    }
    setSaveDialogOpen(true);
  };

  const saveProject = () => {
    if (!projectName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a project name',
        severity: 'error'
      });
      return;
    }

    try {
      // Get existing projects from localStorage
      const existingProjects = JSON.parse(localStorage.getItem('cuttingProjects') || '[]');

      // Create new project object
      const newProject = {
        id: isRecalculating && originalProjectId ? originalProjectId : Date.now().toString(),
        name: projectName.trim(),
        materialType: sheetType,
        sheetWidth: parseFloat(sheetWidth),
        sheetHeight: parseFloat(sheetHeight),
        sheetsNeeded: result.sheetsNeeded,
        totalPieces: result.totalPieces,
        efficiency: parseFloat(result.efficiency),
        totalPieceArea: parseFloat(result.totalPieceArea),
        sheetArea: parseFloat(result.sheetArea),
        pieces: pieces.filter(piece => piece.width && piece.height && piece.quantity),
        layout: result.layout,
        createdAt: isRecalculating
          ? existingProjects.find(p => p.id === originalProjectId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedProjects;
      if (isRecalculating && originalProjectId) {
        // Update existing project
        updatedProjects = existingProjects.map(project => (project.id === originalProjectId ? newProject : project));
      } else {
        // Add new project to the beginning of the array
        updatedProjects = [newProject, ...existingProjects];
      }

      // Save to localStorage
      localStorage.setItem('cuttingProjects', JSON.stringify(updatedProjects));

      // Reset form and close dialog
      setSaveDialogOpen(false);
      setProjectName('');
      setSnackbar({
        open: true,
        message: isRecalculating ? 'Project updated successfully!' : 'Project saved successfully!',
        severity: 'success'
      });

      // Optionally reset the form
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      setSnackbar({
        open: true,
        message: 'Error saving project. Please try again.',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setSheetType('glass');
    setSheetWidth('');
    setSheetHeight('');
    setPieces([{ id: 1, width: '', height: '', quantity: 1 }]);
    setResult(null);
    setIsRecalculating(false);
    setOriginalProjectId(null);
    setProjectName('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid size={12}>
        <Box display='flex' alignItems='center' gap={2}>
          <Typography variant='h4' gutterBottom>
            {isRecalculating ? t('newPlanning.title') : t('newPlanning.title')}
          </Typography>
          {isRecalculating && (
            <>
              <Chip label={t('common.recalculating')} color='info' size='small' variant='outlined' />
              <Button variant='outlined' size='small' startIcon={<RefreshIcon />} onClick={resetForm}>
                {t('newPlanning.title')}
              </Button>
            </>
          )}
        </Box>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {isRecalculating ? t('newPlanning.subtitle') : t('newPlanning.subtitle')}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <MainCard title={t('newPlanning.projectInfo')}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>{t('newPlanning.materialType')}</InputLabel>
                <Select value={sheetType} label={t('newPlanning.materialType')} onChange={e => setSheetType(e.target.value)}>
                  <MenuItem value='glass'>{t('materials.glass')}</MenuItem>
                  <MenuItem value='wood'>{t('materials.wood')}</MenuItem>
                  <MenuItem value='metal'>{t('materials.metal')}</MenuItem>
                  <MenuItem value='plastic'>{t('materials.plastic')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t('newPlanning.width')}
                type='number'
                value={sheetWidth}
                placeholder={t('newPlanning.widthPlaceholder')}
                onChange={e => setSheetWidth(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Typography variant='body2' color='text.secondary'>
                      mm
                    </Typography>
                  )
                }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t('newPlanning.height')}
                type='number'
                value={sheetHeight}
                placeholder={t('newPlanning.heightPlaceholder')}
                onChange={e => setSheetHeight(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Typography variant='body2' color='text.secondary'>
                      mm
                    </Typography>
                  )
                }}
              />
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title={t('newPlanning.pieces')}>
          <TableContainer component={Paper} elevation={0}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>{t('newPlanning.width')} (mm)</TableCell>
                  <TableCell>{t('newPlanning.height')} (mm)</TableCell>
                  <TableCell>{t('newPlanning.quantity')}</TableCell>
                  <TableCell>{t('dashboard.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pieces.map(piece => (
                  <TableRow key={piece.id}>
                    <TableCell>
                      <TextField
                        size='small'
                        type='number'
                        value={piece.width}
                        onChange={e => handlePieceChange(piece.id, 'width', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        type='number'
                        value={piece.height}
                        onChange={e => handlePieceChange(piece.id, 'height', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        type='number'
                        value={piece.quantity}
                        onChange={e => handlePieceChange(piece.id, 'quantity', e.target.value)}
                        fullWidth
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color='error' size='small' onClick={() => handleRemovePiece(piece.id)} disabled={pieces.length === 1}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2} display='flex' justifyContent='space-between' alignItems='center'>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleAddPiece}>
              {t('newPlanning.addPiece')}
            </Button>

            <Button
              variant='contained'
              color='primary'
              startIcon={<CalculateIcon />}
              onClick={calculateSheets}
              disabled={!sheetWidth || !sheetHeight || pieces.some(piece => !piece.width || !piece.height)}
              sx={{ mr: 2 }}
            >
              {t('newPlanning.calculate')}
            </Button>

            {result && (
              <Button variant='contained' color='success' startIcon={<SaveIcon />} onClick={handleSaveProject}>
                {isRecalculating ? t('common.update') : t('newPlanning.saveProject')}
              </Button>
            )}
          </Box>
        </MainCard>
      </Grid>

      {result && (
        <Grid size={12}>
          <MainCard title={t('newPlanning.results')}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='text.secondary' gutterBottom>
                      Sheets Needed
                    </Typography>
                    <Typography variant='h4' color='primary'>
                      {result.sheetsNeeded}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='text.secondary' gutterBottom>
                      Total Pieces
                    </Typography>
                    <Typography variant='h4'>{result.totalPieces}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='text.secondary' gutterBottom>
                      Material Efficiency
                    </Typography>
                    <Typography variant='h4' color='success.main'>
                      {result.efficiency}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography color='text.secondary' gutterBottom>
                      Total Piece Area
                    </Typography>
                    <Typography variant='h6'>{result.totalPieceArea} mm²</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Optimization Info */}
              {result.algorithm && (
                <Grid size={12}>
                  <Box display='flex' alignItems='center' gap={1} mt={1}>
                    <Chip label={`Optimized with: ${result.algorithm}`} color='info' size='small' variant='outlined' />
                    {result.optimizationStats && (
                      <Typography variant='body2' color='text.secondary'>
                        • {result.optimizationStats.totalPieces} pieces across {result.optimizationStats.totalSheets} sheets •{' '}
                        {result.optimizationStats.totalGuillotineCuts} guillotine cuts total •{' '}
                        {result.optimizationStats.totalWasteArea.toFixed(0)} mm² waste
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Visualization Section */}
            <Box mt={3}>
              <CuttingPlanVisualization
                sheetWidth={parseInt(sheetWidth)}
                sheetHeight={parseInt(sheetHeight)}
                cuts={pieces.map((piece, index) => ({
                  id: index,
                  width: parseInt(piece.width),
                  height: parseInt(piece.height),
                  quantity: parseInt(piece.quantity)
                }))}
                layout={result.layout}
                title='Cutting Plan Layout'
                projectData={{
                  name: projectName || `Project-${new Date().toISOString().split('T')[0]}`,
                  materialType: sheetType,
                  sheetWidth: parseInt(sheetWidth),
                  sheetHeight: parseInt(sheetHeight),
                  sheetsNeeded: result.sheetsNeeded,
                  totalPieces: result.totalPieces,
                  efficiency: parseFloat(result.efficiency),
                  totalPieceArea: parseFloat(result.totalPieceArea),
                  sheetArea: parseFloat(result.sheetArea),
                  pieces: pieces.filter(piece => piece.width && piece.height && piece.quantity),
                  createdAt: new Date().toISOString()
                }}
                enablePDFExport={true}
              />
            </Box>
          </MainCard>
        </Grid>
      )}

      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{isRecalculating ? 'Update Project' : 'Save Project'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Project Name'
            fullWidth
            variant='outlined'
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder='Enter a name for this cutting project'
            sx={{ mt: 2 }}
          />
          {result && (
            <Box mt={2}>
              <Typography variant='body2' color='text.secondary'>
                Project Summary:
              </Typography>
              <Typography variant='body2'>• Material: {sheetType}</Typography>
              <Typography variant='body2'>• Sheets needed: {result.sheetsNeeded}</Typography>
              <Typography variant='body2'>• Total pieces: {result.totalPieces}</Typography>
              <Typography variant='body2'>• Efficiency: {result.efficiency}%</Typography>
              <Typography variant='body2' color='text.secondary'>
                • Guillotine cuts: {result.optimizationStats?.totalGuillotineCuts || 0}
              </Typography>
            </Box>
          )}
          {isRecalculating && (
            <Box mt={2}>
              <Alert severity='info' variant='outlined'>
                This will update the existing project with new calculations.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveProject} variant='contained' startIcon={<SaveIcon />} disabled={!projectName.trim()}>
            {isRecalculating ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
