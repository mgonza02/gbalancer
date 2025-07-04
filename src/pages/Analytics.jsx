import {
  Assessment,
  Business,
  People,
  TrendingUp
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const Analytics = () => {
  // Mock data for analytics
  const territoryMetrics = [
    {
      id: 1,
      name: 'Territory 1',
      customers: 45,
      sales: 125000,
      performance: 'Excellent',
      efficiency: 92
    },
    {
      id: 2,
      name: 'Territory 2',
      customers: 38,
      sales: 98000,
      performance: 'Good',
      efficiency: 85
    },
    {
      id: 3,
      name: 'Territory 3',
      customers: 52,
      sales: 142000,
      performance: 'Excellent',
      efficiency: 95
    },
    {
      id: 4,
      name: 'Territory 4',
      customers: 31,
      sales: 78000,
      performance: 'Average',
      efficiency: 78
    }
  ];

  const summaryStats = [
    {
      icon: <People color="primary" />,
      title: 'Total Customers',
      value: '166',
      change: '+5.2%',
      color: 'primary'
    },
    {
      icon: <Business color="success" />,
      title: 'Active Territories',
      value: '4',
      change: '0%',
      color: 'success'
    },
    {
      icon: <TrendingUp color="info" />,
      title: 'Total Sales',
      value: '$443K',
      change: '+12.8%',
      color: 'info'
    },
    {
      icon: <Assessment color="warning" />,
      title: 'Avg Efficiency',
      value: '87.5%',
      change: '+3.1%',
      color: 'warning'
    }
  ];

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'Excellent': return 'success';
      case 'Good': return 'info';
      case 'Average': return 'warning';
      default: return 'error';
    }
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
            Territory Analytics
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Comprehensive insights into territory performance and efficiency
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      mr: 2,
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${stat.color}.50`,
                      '& svg': { fontSize: '2rem' }
                    }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={stat.change}
                    size='small'
                    color={stat.change.startsWith('+') ? 'success' : 'error'}
                    sx={{ fontWeight: 500 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Territory Performance Table */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Territory Performance Overview
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Territory</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Customers</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Sales</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Performance</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Efficiency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {territoryMetrics.map((territory) => (
                        <TableRow
                          key={territory.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {territory.name}
                          </TableCell>
                          <TableCell align="right">
                            {territory.customers}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            ${territory.sales.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={territory.performance}
                              size="small"
                              color={getPerformanceColor(territory.performance)}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Typography variant='body2' sx={{ fontWeight: 500, mr: 1 }}>
                                {territory.efficiency}%
                              </Typography>
                              <Box sx={{
                                width: 60,
                                height: 8,
                                bgcolor: 'grey.200',
                                borderRadius: 4,
                                overflow: 'hidden'
                              }}>
                                <Box sx={{
                                  width: `${territory.efficiency}%`,
                                  height: '100%',
                                  bgcolor: territory.efficiency >= 90 ? 'success.main' :
                                           territory.efficiency >= 80 ? 'info.main' : 'warning.main',
                                  borderRadius: 4
                                }} />
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
                height: 'fit-content'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Insights
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Best Performing Territory
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: 'success.main', mb: 3 }}>
                    Territory 3 (95% efficiency)
                  </Typography>

                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Average Customers per Territory
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: 'info.main', mb: 3 }}>
                    41.5 customers
                  </Typography>

                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Total Revenue Coverage
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: 'primary.main' }}>
                    $443,000
                  </Typography>
                </Box>

                <Paper
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'success.50',
                    border: 1,
                    borderColor: 'success.200'
                  }}
                >
                  <Typography variant='body2' sx={{ fontWeight: 500, color: 'success.800' }}>
                    💡 All territories are performing within expected parameters.
                    Consider expanding Territory 3's coverage area.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Analytics;
