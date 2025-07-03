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

import { useNavigate } from 'react-router-dom';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const navigate = useNavigate();

  // Mock data for the cutting planner
  const recentProjects = [
    { name: 'Kitchen Cabinet Doors', material: 'Wood', efficiency: '85.4%', date: '2024-12-20' },
    { name: 'Glass Partitions', material: 'Glass', efficiency: '92.1%', date: '2024-12-18' },
    { name: 'Metal Shelving', material: 'Metal', efficiency: '78.9%', date: '2024-12-15' }
  ];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' gutterBottom>
          Cutting Planner Dashboard
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Optimize your material usage with intelligent cutting calculations
        </Typography>
      </Grid>

      {/* Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title='Total Projects' count='47' percentage={15.3} extra='This month' color='primary' />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title='Sheets Saved' count='234' percentage={28.7} extra='vs manual planning' color='success' />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title='Avg Efficiency' count='87.2%' percentage={5.2} extra='Material usage' color='info' />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce title='Cost Savings' count='$12,450' percentage={22.1} extra='This quarter' color='warning' />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 8 }}>
        <MainCard title='Quick Actions'>
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
                    New Planning
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Start a new cutting calculation project
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
                    View History
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Browse your previous calculations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Recent Projects */}
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title='Recent Projects'>
          <List>
            {recentProjects.map((project, index) => (
              <ListItem key={index} divider={index < recentProjects.length - 1}>
                <ListItemText
                  primary={project.name}
                  secondary={
                    <Box>
                      <Box component='span' sx={{ color: 'text.secondary', fontSize: '0.875rem', display: 'block' }}>
                        {project.material} • {project.date}
                      </Box>
                      <Box component='span' sx={{ color: 'success.main', fontSize: '0.875rem', display: 'block' }}>
                        Efficiency: {project.efficiency}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Box mt={2}>
            <Button fullWidth variant='outlined' onClick={() => navigate('/view-historic')}>
              View All Projects
            </Button>
          </Box>
        </MainCard>
      </Grid>

      {/* Material Types Overview */}
      <Grid size={{ xs: 12 }}>
        <MainCard title='Supported Materials'>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant='outlined'>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.light', mx: 'auto', mb: 2 }}>
                    <Box component='span' sx={{ fontSize: '24px' }}>
                      🪟
                    </Box>
                  </Avatar>
                  <Typography variant='h6'>Glass</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Windows, partitions, displays
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
                  <Typography variant='h6'>Wood</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Panels, doors, shelving
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
                  <Typography variant='h6'>Metal</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Steel, aluminum sheets
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
                  <Typography variant='h6'>Plastic</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Acrylic, polycarbonate
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
