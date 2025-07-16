// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

// assets
import avatar from 'assets/images/users/avatar-group.png';
import AnimateButton from 'components/@extended/AnimateButton';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

export default function NavCard() {
  const theme = useTheme();

  return (
    <MainCard
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
        m: 3,
        border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
        borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent'
      }}
    >
      <Stack alignItems='center' spacing={2.5}>
        <CardMedia component='img' image={avatar} sx={{ width: 112 }} />
        <Stack alignItems='center'>
          <Typography variant='h5'>GBalancer</Typography>
          <Typography variant='h6' color='secondary'>
            Cutting Optimization
          </Typography>
        </Stack>
        <AnimateButton>
          <Button component={Link} target='_blank' href='https://gfel.in/gbalancer' variant='contained' color='primary' size='small'>
            Visit Website
          </Button>
        </AnimateButton>
      </Stack>
    </MainCard>
  );
}
