import {
    Analytics,
    Close as CloseIcon,
    Dashboard,
    History,
    Home,
    Menu as MenuIcon,
    TrendingUp
} from '@mui/icons-material';
import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/analytics', label: 'Analytics', icon: <Analytics /> },
    { path: '/history', label: 'History', icon: <History /> }
  ];

  const isActivePath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const NavButton = ({ item }) => {
    const isDark = theme.palette.mode === 'dark';
    const isActive = isActivePath(item.path);

    return (
      <Button
        onClick={() => handleNavigation(item.path)}
        startIcon={item.icon}
        sx={{
          color: isDark
            ? (isActive ? 'primary.main' : 'text.primary')
            : (isActive ? 'white' : 'rgba(255,255,255,0.8)'),
          bgcolor: isDark
            ? (isActive ? 'primary.50' : 'transparent')
            : (isActive ? 'rgba(255,255,255,0.1)' : 'transparent'),
          mx: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: isActive ? 600 : 500,
          border: isDark && isActive ? '1px solid' : 'none',
          borderColor: isDark && isActive ? 'primary.main' : 'transparent',
          '&:hover': {
            bgcolor: isDark
              ? 'action.hover'
              : 'rgba(255,255,255,0.1)',
            color: isDark ? 'primary.main' : 'white',
            transform: 'translateY(-1px)',
            boxShadow: isDark
              ? '0 4px 8px rgba(0,0,0,0.2)'
              : '0 2px 4px rgba(0,0,0,0.1)'
          },
          '&:active': {
            transform: 'translateY(0px)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {item.label}
      </Button>
    );
  };

  const MobileNavItem = ({ item }) => (
    <ListItemButton
      onClick={() => handleNavigation(item.path)}
      selected={isActivePath(item.path)}
      sx={{
        borderRadius: 2,
        mx: 1,
        mb: 1,
        '&.Mui-selected': {
          bgcolor: 'primary.50',
          '&:hover': {
            bgcolor: 'primary.100'
          }
        }
      }}
    >
      <ListItemIcon sx={{ color: isActivePath(item.path) ? 'primary.main' : 'text.secondary' }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          fontWeight: isActivePath(item.path) ? 600 : 500,
          color: isActivePath(item.path) ? 'primary.main' : 'text.primary'
        }}
      />
    </ListItemButton>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
          color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.contrastText',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'divider' : 'primary.dark',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 }
            }}
            onClick={() => navigate('/')}
          >
            <TrendingUp sx={{ mr: 1, fontSize: '2rem' }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              GBalancer
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigationItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
              <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LanguageSwitcher />
                <ThemeSwitcher size="medium" />
              </Box>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeSwitcher size="small" showTooltip={false} />
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 32px rgba(0,0,0,0.6)'
              : '0 0 16px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Navigation
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {navigationItems.map((item) => (
              <MobileNavItem key={item.path} item={item} />
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Settings
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageSwitcher />
              <ThemeSwitcher size="medium" />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
