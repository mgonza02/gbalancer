// ==============================|| OVERRIDES - DRAWER ||============================== //

export default function Drawer(theme) {
  return {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          '& .MuiListItemButton-root': {
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            },
            '&.Mui-selected': {
              backgroundColor: theme.palette.action.selected,
              '&:hover': {
                backgroundColor: theme.palette.action.selected
              }
            }
          }
        }
      }
    }
  };
}
