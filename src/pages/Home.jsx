import { Assessment, Business, Groups, History, TrendingUp } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Groups color="primary" />,
      title: 'Sales Team Management',
      description: 'Define your sales team size and territory requirements for optimal coverage.'
    },
    {
      icon: <Business color="primary" />,
      title: 'Territory Optimization',
      description: 'Create balanced territories based on customer distribution and sales targets.'
    },
    {
      icon: <Assessment color="primary" />,
      title: 'Performance Analytics',
      description: 'Analyze territory performance with detailed metrics and capacity analysis.'
    },
    {
      icon: <History color="primary" />,
      title: 'Balance History',
      description: 'Save, manage, and restore territory balance configurations for future use.'
    },
    {
      icon: <TrendingUp color="primary" />,
      title: 'Smart Clustering',
      description: 'Automatic geographic clustering ensures logical territory boundaries.'
    }
  ];

  const steps = [
    'Load customer data onto the interactive map',
    'Configure your sales team size and territory constraints',
    'Set customer and sales distribution limits',
    'Generate optimized territories with one click',
    'Analyze results and save successful configurations'
  ];

  return (
    <Box sx={{ flex: 1 }}>
      {/* Hero Section */}
      <Box sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: { xs: 6, md: 8 },
        textAlign: 'center'
      }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h2'
            component='h1'
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 3
            }}
          >
            GBalancer
          </Typography>
          <Typography
            variant='h4'
            sx={{
              mb: 2,
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              opacity: 0.95,
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            Territory Balancer
          </Typography>
          <Typography
            variant='h5'
            sx={{
              mb: 4,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Create balanced, geographically clustered sales territories with intelligent automation
          </Typography>
          <Button
            variant='contained'
            size='large'
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(0,0,0,0.25)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth='lg' sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant='h3'
          component='h2'
          align='center'
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Powerful Features
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    '& svg': { fontSize: '3rem' }
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 8 } }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h2'
            align='center'
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            How It Works
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <List>
              {steps.map((step, index) => (
                <ListItem
                  key={index}
                  sx={{
                    py: 2,
                    '&:not(:last-child)': {
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}>
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant='contained'
                size='large'
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Start Creating Territories
              </Button>

              <Button
                variant='outlined'
                size='large'
                onClick={() => navigate('/history')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderWidth: 2,
                    boxShadow: '0 4px 15px rgba(25, 118, 210, 0.2)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                View History
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
