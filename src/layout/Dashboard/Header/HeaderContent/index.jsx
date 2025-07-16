// material-ui
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import LanguageSwitcher from 'components/LanguageSwitcher';
import ThemeSwitcher from 'components/ThemeSwitcher';
import MobileSection from './MobileSection';
import Notification from './Notification';
import Profile from './Profile';
import Search from './Search';

// project import
import { GithubOutlined } from '@ant-design/icons';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const theme = useTheme();
  const downLG = useMediaQuery(theme => theme.breakpoints.down('lg'));

  return (
    <>
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <Stack direction="row" alignItems="center" spacing={1}>
        <LanguageSwitcher />
        <ThemeSwitcher />

        <IconButton
          component={Link}
          href='https://gfel.in/gbalancer'
          target='_blank'
          disableRipple
          color='secondary'
          title='Visit gbalancer Website'
          sx={{
            color: 'text.primary',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100',
            border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
            borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent',
            boxShadow: theme.customShadows?.themeSwitcher || (theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 4px rgba(0,0,0,0.1)'),
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.200',
              borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'transparent',
              boxShadow: theme.customShadows?.themeSwitcherHover || (theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0,0,0,0.4)'
                : '0 4px 8px rgba(0,0,0,0.15)'),
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <GithubOutlined />
        </IconButton>

        <Notification />
      </Stack>

      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
