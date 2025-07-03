// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

export default function SamplePage() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title='Sample Page'>
          <Box sx={{ p: 2 }}>
            <Typography variant='h5' gutterBottom>
              Welcome to the Sample Page
            </Typography>
            <Typography variant='body1' paragraph>
              This is a sample page to demonstrate the template structure. You can use this as a starting point to build new pages for your
              application.
            </Typography>
            <Typography variant='body1' paragraph>
              The template includes:
            </Typography>
            <Typography component='div' variant='body1'>
              <ul>
                <li>Dark/Light mode switching</li>
                <li>Multilanguage support (English/Spanish)</li>
                <li>Modern Material-UI components</li>
                <li>Responsive layout</li>
                <li>Navigation structure</li>
              </ul>
            </Typography>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Features
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Modern React dashboard template with all essential features for rapid development.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant='outlined' size='small'>
                Learn More
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Customization
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Easily customize themes, colors, and components to match your brand.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant='outlined' size='small'>
                Customize
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
