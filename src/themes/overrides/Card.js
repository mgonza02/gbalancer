// ==============================|| OVERRIDES - CARD ||============================== //

export default function Card(theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          '&.MuiCard-outlined': {
            borderColor: theme.palette.divider
          }
        }
      }
    }
  };
}
