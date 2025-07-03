// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}>
      <Typography variant='caption'>
        &copy; {new Date().getFullYear()} GCut by{' '}
        <Link href='https://gfel.in/gcut' target='_blank' underline='hover'>
          GMDev SAC
        </Link>
        {' - Developed by Gonzalo Melgarejo'}
      </Typography>
      <Stack direction='row' sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href='https://gfel.in/gcut' target='_blank' variant='caption' color='text.primary'>
          About
        </Link>
        <Link href='https://gfel.in/gcut' target='_blank' variant='caption' color='text.primary'>
          Privacy
        </Link>
        <Link href='https://gfel.in/gcut' target='_blank' variant='caption' color='text.primary'>
          Terms
        </Link>
      </Stack>
    </Stack>
  );
}
