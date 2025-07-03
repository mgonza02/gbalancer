// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// assets
import { HistoryOutlined, PlusOutlined } from '@ant-design/icons';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

/**
 * Dashboard Default Component
 *
 * TERMINOLOGY:
 * - PIECE: Each object with width and height that needs to be cut from material (user input)
 * - GUILLOTINE CUT: Each straight cut operation that divides a sheet into two parts (algorithm operation)
 *
 * This dashboard provides an overview of cutting optimization projects, showing:
 * - Statistics about pieces, sheets, and cutting efficiency
 * - Recent projects with piece counts and material efficiency
 * - Quick actions for creating new projects and viewing history
 */

export default function DashboardDefault() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);

  // Load projects from localStorage
  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('cuttingProjects') || '[]');
      setProjects(savedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  }, []);

  // Calculate statistics from real data
  const totalProjects = projects.length;
  const totalSheetsUsed = projects.reduce((sum, project) => sum + project.sheetsNeeded, 0);
  const averageEfficiency =
    projects.length > 0 ? (projects.reduce((sum, project) => sum + project.efficiency, 0) / projects.length).toFixed(1) : 0;
  const totalPieces = projects.reduce((sum, project) => sum + project.totalPieces, 0);
  const totalGuillotineCuts = projects.reduce((sum, project) => {
    // Calculate total guillotine cuts across all projects
    if (project.layout && Array.isArray(project.layout)) {
      return sum + project.layout.reduce((sheetSum, sheet) => sheetSum + (sheet.totalGuillotineCuts || 0), 0);
    }
    return sum;
  }, 0);

  // Get recent projects (last 3)
  const recentProjects = projects.slice(0, 3);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('dashboard.subtitle')}
        </Typography>
      </Grid>

      {/* Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title={t('dashboard.totalProjects')}
          count={totalProjects.toString()}
          percentage={15.3}
          extra={t('dashboard.thisMonth')}
          color='primary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title={t('dashboard.sheetsUsed')}
          count={totalSheetsUsed.toString()}
          percentage={28.7}
          extra={t('dashboard.totalCalculated')}
          color='success'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title={t('dashboard.totalPieces')}
          count={totalPieces.toString()}
          percentage={22.1}
          extra={t('dashboard.allProjects')}
          color='warning'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title={t('dashboard.guillotineCuts')}
          count={totalGuillotineCuts.toString()}
          percentage={18.9}
          extra={t('dashboard.totalOperations')}
          color='error'
        />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 8 }}>
        <MainCard title={t('dashboard.quickActions')}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigate('/new-planning')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    <PlusOutlined style={{ fontSize: '24px' }} />
                  </Avatar>
                  <Typography variant='h6' gutterBottom>
                    {t('dashboard.newPlanningTitle')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('dashboard.newPlanningDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigate('/view-historic')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    <HistoryOutlined style={{ fontSize: '24px' }} />
                  </Avatar>
                  <Typography variant='h6' gutterBottom>
                    {t('dashboard.viewHistoryTitle')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('dashboard.viewHistoryDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Recent Projects */}
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title={t('dashboard.recentProjects')}>
          {recentProjects.length === 0 ? (
            <Box textAlign='center' py={3}>
              <Typography variant='body2' color='text.secondary'>
                {t('dashboard.noProjects')}
              </Typography>
              <Typography variant='body2' color='text.secondary' mt={1}>
                {t('dashboard.createFirstProject')}
              </Typography>
            </Box>
          ) : (
            <List>
              {recentProjects.map((project, index) => (
                <ListItem key={project.id} divider={index < recentProjects.length - 1}>
                  <ListItemText
                    primary={project.name}
                    secondary={
                      <Box component='span'>
                        <Box component='span' sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                          {t(`materials.${project.materialType.toLowerCase()}`)} • {new Date(project.createdAt).toLocaleDateString()}
                        </Box>
                        <Box component='span' sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                          {project.totalPieces} {t('dashboard.pieces')} • {project.sheetsNeeded} {t('dashboard.sheets')}
                        </Box>
                        <Box component='span' sx={{ display: 'block', color: 'success.main', fontSize: '0.875rem' }}>
                          {t('dashboard.efficiency')}: {project.efficiency}%
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box mt={2}>
            <Button fullWidth variant='outlined' onClick={() => navigate('/view-historic')}>
              {t('dashboard.viewAllProjects')}
            </Button>
          </Box>
        </MainCard>
      </Grid>

      {/* Material Types Overview */}
      <Grid size={{ xs: 12 }}>
        <MainCard title={t('dashboard.supportedMaterials')}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant='outlined'>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.light', mx: 'auto', mb: 2 }}>
                    <Box component='span' sx={{ fontSize: '24px' }}>
                      🪟
                    </Box>
                  </Avatar>
                  <Typography variant='h6'>{t('dashboard.glass')}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('dashboard.glassDesc')}
                  </Typography>
                  <Typography variant='caption' display='block' color='text.disabled' mt={1}>
                    {t('dashboard.glassNote')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant='outlined'>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.light', mx: 'auto', mb: 2 }}>
                    <Box component='span' sx={{ fontSize: '24px' }}>
                      🪵
                    </Box>
                  </Avatar>
                  <Typography variant='h6'>{t('dashboard.wood')}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('dashboard.woodDesc')}
                  </Typography>
                  <Typography variant='caption' display='block' color='text.disabled' mt={1}>
                    {t('dashboard.woodNote')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant='outlined'>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mx: 'auto', mb: 2 }}>
                    <Box component='span' sx={{ fontSize: '24px' }}>
                      🔩
                    </Box>
                  </Avatar>
                  <Typography variant='h6'>{t('dashboard.metal')}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('dashboard.metalDesc')}
                  </Typography>
                  <Typography variant='caption' display='block' color='text.disabled' mt={1}>
                    {t('dashboard.metalNote')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant='outlined'>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.light', mx: 'auto', mb: 2 }}>
                    <Box component='span' sx={{ fontSize: '24px' }}>
                      🧪
                    </Box>
                  </Avatar>
                  <Typography variant='h6'>{t('dashboard.plastic')}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('dashboard.plasticDesc')}
                  </Typography>
                  <Typography variant='caption' display='block' color='text.disabled' mt={1}>
                    {t('dashboard.plasticNote')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
