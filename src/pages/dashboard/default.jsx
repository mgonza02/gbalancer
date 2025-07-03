// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

import { useTranslation } from 'react-i18next';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

/**
 * Dashboard Default Component
 *
 * Clean dashboard ready for new application development
 * Features included:
 * - Dark/Light mode support
 * - Multilanguage support
 * - Modern Material-UI template
 */

export default function DashboardDefault() {
  const { t } = useTranslation();

  return (
    <Container maxWidth='xl'>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <MainCard>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant='h2' component='h1' gutterBottom>
                {t('dashboard.welcome')}
              </Typography>
              <Typography variant='h5' color='text.secondary' paragraph>
                {t('dashboard.subtitle')}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {t('dashboard.description')}
              </Typography>
            </Box>
          </MainCard>
        </Grid>

        {/* Content Area - Ready for new features */}
        <Grid item xs={12} md={8}>
          <MainCard title={t('dashboard.mainContent')}>
            <Box sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant='h6' color='text.secondary'>
                {t('dashboard.emptyState')}
              </Typography>
            </Box>
          </MainCard>
        </Grid>

        {/* Sidebar Area */}
        <Grid item xs={12} md={4}>
          <MainCard title={t('dashboard.sidePanel')}>
            <Box sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant='h6' color='text.secondary'>
                {t('dashboard.sidebarEmpty')}
              </Typography>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Container>
  );
}
