import { Box, Container, Link, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.100',
        py: 3,
        px: 2,
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto'
      }}
    >
      <Container maxWidth='xl'>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 2
        }}>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            © 2025 GBalancer. All rights reserved.
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}>
            <Link
              href="#"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Support
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
