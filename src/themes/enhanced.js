import { createTheme } from '@mui/material/styles';

/**
 * Enhanced Theme Configuration
 * Implements consistent design tokens and improved accessibility
 */
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#dc004e',
      light: '#f48fb1',
      dark: '#c51162',
      contrastText: '#ffffff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      50: '#e8f5e8',
      100: '#c8e6c9',
      200: '#a5d6a7'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      50: '#fff3e0',
      100: '#ffe0b2',
      200: '#ffcc80'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9'
    },
    background: {
      default: mode === 'light' ? '#fafafa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#1a1a1a' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#b3b3b3',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            transform: 'none',
            boxShadow: 'none',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:before': {
            display: 'none',
          },
          '&:first-of-type': {
            borderRadius: 12,
          },
          '&:last-of-type': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& .MuiAlert-icon': {
            marginRight: 12,
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12)',
    '0 2px 6px rgba(0,0,0,0.12)',
    '0 3px 12px rgba(0,0,0,0.12)',
    '0 4px 16px rgba(0,0,0,0.12)',
    '0 6px 24px rgba(0,0,0,0.12)',
    '0 8px 32px rgba(0,0,0,0.12)',
    '0 12px 48px rgba(0,0,0,0.12)',
    '0 16px 64px rgba(0,0,0,0.12)',
    '0 24px 80px rgba(0,0,0,0.12)',
    '0 32px 96px rgba(0,0,0,0.12)',
    '0 40px 112px rgba(0,0,0,0.12)',
    '0 48px 128px rgba(0,0,0,0.12)',
    '0 56px 144px rgba(0,0,0,0.12)',
    '0 64px 160px rgba(0,0,0,0.12)',
    '0 72px 176px rgba(0,0,0,0.12)',
    '0 80px 192px rgba(0,0,0,0.12)',
    '0 88px 208px rgba(0,0,0,0.12)',
    '0 96px 224px rgba(0,0,0,0.12)',
    '0 104px 240px rgba(0,0,0,0.12)',
    '0 112px 256px rgba(0,0,0,0.12)',
    '0 120px 272px rgba(0,0,0,0.12)',
    '0 128px 288px rgba(0,0,0,0.12)',
    '0 136px 304px rgba(0,0,0,0.12)',
    '0 144px 320px rgba(0,0,0,0.12)',
  ],
});

/**
 * Create enhanced theme with improved design tokens
 */
export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));

export default createAppTheme;
