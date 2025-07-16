// ==============================|| OVERRIDES - CARD ||============================== //

export default function Card(theme) {
  const isDark = theme.palette.mode === 'dark';

  return {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          boxShadow: theme.customShadows.card,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme.customShadows.cardHover,
            transform: 'translateY(-1px)'
          },
          '&.MuiCard-outlined': {
            borderColor: theme.palette.divider,
            borderWidth: '1px',
            borderStyle: 'solid'
          }
        }
      }
    }
  };
}
