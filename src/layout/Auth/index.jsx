import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

// ==============================|| LAYOUT - AUTH ||============================== //

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Outlet />
    </Box>
  );
}
