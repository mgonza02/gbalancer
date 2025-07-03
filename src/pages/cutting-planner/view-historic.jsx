// material-ui
import {
  Calculate as CalculateIcon,
  CalendarMonth as CalendarIcon,
  ContentCopy as CloneIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

// project imports
import CuttingPlanVisualization from 'components/CuttingPlanVisualization';
import MainCard from 'components/MainCard';
import PDFExportService from 'utils/PDFExportService';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// ==============================|| VIEW HISTORIC PAGE ||==============================

/**
 * ViewHistoric Component
 *
 * TERMINOLOGY:
 * - PIECE: Each object with width and height that needs to be cut from material (user input)
 * - GUILLOTINE CUT: Each straight cut operation that divides a sheet into two parts (algorithm operation)
 *
 * This component displays historical cutting optimization projects, showing:
 * - Project statistics including pieces, sheets, and cutting efficiency
 * - Detailed piece requirements and guillotine cut information
 * - Project management actions (view, clone, export, delete)
 */

export default function ViewHistoric() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [historicData, setHistoricData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [projectToClone, setProjectToClone] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exportingPDF, setExportingPDF] = useState(null);

  // Load projects from localStorage on component mount
  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('cuttingProjects') || '[]');
      setHistoricData(savedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setHistoricData([]);
    }
  }, []);

  const handleDeleteProject = projectId => {
    try {
      const updatedProjects = historicData.filter(project => project.id !== projectId);
      localStorage.setItem('cuttingProjects', JSON.stringify(updatedProjects));
      setHistoricData(updatedProjects);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);

      setSnackbar({
        open: true,
        message: t('viewHistoric.notifications.projectDeleted'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      setSnackbar({
        open: true,
        message: t('messages.unexpectedError'),
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = project => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleCloneProject = project => {
    setProjectToClone(project);
    setNewProjectName(`${project.name} - Copy`);
    setCloneDialogOpen(true);
  };

  const handleCancelClone = () => {
    setCloneDialogOpen(false);
    setProjectToClone(null);
    setNewProjectName('');
  };

  const confirmCloneProject = () => {
    if (!newProjectName.trim()) {
      setSnackbar({
        open: true,
        message: t('viewHistoric.notifications.nameRequired'),
        severity: 'error'
      });
      return;
    }

    try {
      const existingProjects = JSON.parse(localStorage.getItem('cuttingProjects') || '[]');

      // Check if name already exists
      const nameExists = existingProjects.some(project => project.name.toLowerCase() === newProjectName.trim().toLowerCase());

      if (nameExists) {
        setSnackbar({
          open: true,
          message: t('viewHistoric.notifications.nameExists'),
          severity: 'error'
        });
        return;
      }

      // Create cloned project
      const clonedProject = {
        ...projectToClone,
        id: Date.now().toString(),
        name: newProjectName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to the beginning of the array
      const updatedProjects = [clonedProject, ...existingProjects];
      localStorage.setItem('cuttingProjects', JSON.stringify(updatedProjects));
      setHistoricData(updatedProjects);

      // Close dialog and reset state
      setCloneDialogOpen(false);
      setProjectToClone(null);
      setNewProjectName('');

      setSnackbar({
        open: true,
        message: t('viewHistoric.notifications.projectCloned'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error cloning project:', error);
      setSnackbar({
        open: true,
        message: t('viewHistoric.notifications.cloneFailed'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleExportPDF = async project => {
    setExportingPDF(project.id);
    try {
      const pdfService = new PDFExportService();

      const result = await pdfService.exportVisualizationToPDF(
        project,
        null, // No visualization element for table export
        {
          fileName: `cutting-plan-${project.name}-${new Date().toISOString().split('T')[0]}.pdf`,
          includeStats: true,
          includeDetails: true,
          orientation: 'portrait'
        }
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: t('viewHistoric.notifications.pdfExported'),
          severity: 'success'
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setSnackbar({
        open: true,
        message: t('viewHistoric.notifications.exportFailed'),
        severity: 'error'
      });
    } finally {
      setExportingPDF(null);
    }
  };

  const handleRecalculateProject = project => {
    // Store the project data in localStorage for the new planning page to pick up
    localStorage.setItem('projectToRecalculate', JSON.stringify(project));
    // Navigate to new planning page
    navigate('/new-planning');
  };

  const handleViewDetails = project => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
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

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant='h4' gutterBottom>
          {t('viewHistoric.title')}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {t('viewHistoric.subtitle')}
        </Typography>
      </Grid>

      <Grid size={12}>
        <MainCard title={t('viewHistoric.recentProjects')}>
          {historicData.length === 0 ? (
            <Box textAlign='center' py={4}>
              <Typography variant='h6' color='text.secondary'>
                {t('viewHistoric.noProjects')}
              </Typography>
              <Typography variant='body2' color='text.secondary' mt={1}>
                {t('viewHistoric.createFirst')}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('viewHistoric.projectName')}</TableCell>
                    <TableCell>{t('viewHistoric.material')}</TableCell>
                    <TableCell>{t('viewHistoric.dateCreated')}</TableCell>
                    <TableCell align='center'>{t('viewHistoric.sheetsUsed')}</TableCell>
                    <TableCell align='center'>{t('viewHistoric.totalPieces')}</TableCell>
                    <TableCell align='center'>{t('viewHistoric.efficiency')}</TableCell>
                    <TableCell align='center'>{t('viewHistoric.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicData.map(project => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant='subtitle2'>{project.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`materials.${project.materialType}`)}
                          color={getMaterialColor(project.materialType)}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell>
                        <Box display='flex' alignItems='center' gap={1}>
                          <CalendarIcon fontSize='small' color='disabled' />
                          {formatDate(project.createdAt)}
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='h6' color='primary'>
                          {project.sheetsNeeded}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{project.totalPieces}</TableCell>
                      <TableCell align='center'>
                        <Chip label={`${project.efficiency}%`} color={getEfficiencyColor(project.efficiency)} size='small' />
                      </TableCell>
                      <TableCell align='center'>
                        <Box display='flex' justifyContent='center' gap={1}>
                          <IconButton
                            color='primary'
                            size='small'
                            onClick={() => handleViewDetails(project)}
                            title={t('viewHistoric.viewDetails')}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color='info'
                            size='small'
                            onClick={() => handleRecalculateProject(project)}
                            title={t('viewHistoric.recalculate')}
                          >
                            <CalculateIcon />
                          </IconButton>
                          <IconButton
                            color='secondary'
                            size='small'
                            onClick={() => handleCloneProject(project)}
                            title={t('viewHistoric.clone')}
                          >
                            <CloneIcon />
                          </IconButton>
                          <IconButton
                            color='success'
                            size='small'
                            onClick={() => handleExportPDF(project)}
                            disabled={exportingPDF === project.id}
                            title={t('viewHistoric.exportPDF')}
                          >
                            {exportingPDF === project.id ? <CircularProgress size={16} /> : <DownloadIcon />}
                          </IconButton>
                          <IconButton
                            color='error'
                            size='small'
                            onClick={() => handleDeleteClick(project)}
                            title={t('viewHistoric.deleteProject')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      {/* Summary Cards */}
      {historicData.length > 0 && (
        <Grid size={12}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color='text.secondary' gutterBottom>
                    {t('viewHistoric.totalProjects')}
                  </Typography>
                  <Typography variant='h4' color='primary'>
                    {historicData.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color='text.secondary' gutterBottom>
                    {t('viewHistoric.totalSheetsUsed')}
                  </Typography>
                  <Typography variant='h4'>{historicData.reduce((sum, project) => sum + project.sheetsNeeded, 0)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color='text.secondary' gutterBottom>
                    {t('viewHistoric.totalPieces')}
                  </Typography>
                  <Typography variant='h4'>{historicData.reduce((sum, project) => sum + project.totalPieces, 0)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card>
                <CardContent>
                  <Typography color='text.secondary' gutterBottom>
                    {t('viewHistoric.averageEfficiency')}
                  </Typography>
                  <Typography variant='h4' color='success.main'>
                    {historicData.length > 0
                      ? (historicData.reduce((sum, project) => sum + project.efficiency, 0) / historicData.length).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Project Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{selectedProject?.name || selectedProject?.projectName}</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' gutterBottom>
                  {t('viewHistoric.projectInfo')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('newPlanning.materialType')}
                      secondary={
                        <Box component='span'>
                          <Chip
                            label={t(`materials.${selectedProject.materialType}`)}
                            color={getMaterialColor(selectedProject.materialType)}
                            size='small'
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('viewHistoric.dateCreated')} secondary={formatDate(selectedProject.createdAt)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('viewHistoric.sheetDimensions')}
                      secondary={`${selectedProject.sheetWidth} x ${selectedProject.sheetHeight} mm`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('viewHistoric.sheetsNeeded')} secondary={selectedProject.sheetsNeeded} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('viewHistoric.totalPieces')} secondary={selectedProject.totalPieces} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('viewHistoric.efficiency')} secondary={`${selectedProject.efficiency}%`} />
                  </ListItem>
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' gutterBottom>
                  {t('viewHistoric.pieceRequirements')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('newPlanning.width')}</TableCell>
                        <TableCell>{t('newPlanning.height')}</TableCell>
                        <TableCell>{t('newPlanning.quantity')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProject.pieces?.map((piece, index) => (
                        <TableRow key={index}>
                          <TableCell>{piece.width} mm</TableCell>
                          <TableCell>{piece.height} mm</TableCell>
                          <TableCell>{piece.quantity}</TableCell>
                        </TableRow>
                      )) ||
                        selectedProject.cuts?.map((cut, index) => (
                          <TableRow key={index}>
                            <TableCell>{cut.width} mm</TableCell>
                            <TableCell>{cut.height} mm</TableCell>
                            <TableCell>{cut.quantity}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Visualization Section */}
              {selectedProject.layout && (
                <Grid size={12}>
                  <CuttingPlanVisualization
                    sheetWidth={selectedProject.sheetWidth}
                    sheetHeight={selectedProject.sheetHeight}
                    pieces={(selectedProject.pieces || selectedProject.cuts || []).map((piece, index) => ({
                      id: index,
                      width: piece.width,
                      height: piece.height,
                      quantity: piece.quantity
                    }))}
                    layout={selectedProject.layout}
                    title={t('visualization.title')}
                    projectData={selectedProject}
                    enablePDFExport={true}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth='sm' fullWidth>
        <DialogTitle>{t('viewHistoric.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography variant='body1' gutterBottom>
            {t('viewHistoric.deleteConfirmation')}
          </Typography>
          {projectToDelete && (
            <Box mt={2}>
              <Typography variant='subtitle2' color='text.secondary'>
                {t('viewHistoric.projectDetails')}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.name')}:</strong> {projectToDelete.name}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.material')}:</strong> {t(`materials.${projectToDelete.materialType}`)}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.created')}:</strong> {formatDate(projectToDelete.createdAt)}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('newPlanning.sheetsNeeded')}:</strong> {projectToDelete.sheetsNeeded}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.efficiency')}:</strong> {projectToDelete.efficiency}%
              </Typography>
            </Box>
          )}
          <Box mt={2}>
            <Typography variant='body2' color='error'>
              {t('viewHistoric.cannotUndo')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>{t('common.cancel')}</Button>
          <Button onClick={() => handleDeleteProject(projectToDelete?.id)} variant='contained' color='error' startIcon={<DeleteIcon />}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Project Dialog */}
      <Dialog open={cloneDialogOpen} onClose={handleCancelClone} maxWidth='sm' fullWidth>
        <DialogTitle>{t('viewHistoric.cloneProject')}</DialogTitle>
        <DialogContent>
          <Typography variant='body1' gutterBottom>
            {t('viewHistoric.cloneDescription')}
          </Typography>
          {projectToClone && (
            <Box mt={2}>
              <Typography variant='subtitle2' color='text.secondary'>
                {t('viewHistoric.originalProject')}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.name')}:</strong> {projectToClone.name}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.material')}:</strong> {t(`materials.${projectToClone.materialType}`)}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('newPlanning.sheetsNeeded')}:</strong> {projectToClone.sheetsNeeded}
              </Typography>
              <Typography variant='body2'>
                <strong>{t('viewHistoric.efficiency')}:</strong> {projectToClone.efficiency}%
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin='dense'
            label={t('viewHistoric.newProjectName')}
            fullWidth
            variant='outlined'
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            placeholder={t('viewHistoric.enterCloneName')}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClone}>{t('common.cancel')}</Button>
          <Button
            onClick={confirmCloneProject}
            variant='contained'
            color='primary'
            startIcon={<CloneIcon />}
            disabled={!newProjectName.trim()}
          >
            {t('viewHistoric.clone')}
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
