// ==============================|| OVERRIDES - CSS BASELINE ||============================== //

export default function CssBaseline(theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box'
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize,
          lineHeight: theme.typography.body1.lineHeight,
          transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out'
        },
        '#root': {
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
          transition: 'background-color 0.2s ease-in-out'
        },
        // Scrollbar styling for dark mode
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#777' : '#a8a8a8'
          }
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f1f1f1',
          borderRadius: '4px'
        }
      }
    }
  };
}
