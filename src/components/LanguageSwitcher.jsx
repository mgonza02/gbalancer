import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import { Check as CheckIcon, Language as LanguageIcon } from '@mui/icons-material';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';

// ==============================|| LANGUAGE SWITCHER ||============================== //

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = languageCode => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  return (
    <Box>
      <Button
        variant='outlined'
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        sx={{
          minWidth: 120,
          textTransform: 'none',
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant='body2'>{currentLanguage.flag}</Typography>
          <Typography variant='body2'>{currentLanguage.name}</Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {languages.map(language => (
          <MenuItem key={language.code} onClick={() => handleLanguageChange(language.code)} selected={language.code === i18n.language}>
            <ListItemIcon>{language.code === i18n.language ? <CheckIcon fontSize='small' /> : <Box sx={{ width: 20 }} />}</ListItemIcon>
            <ListItemText>
              <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component='span' sx={{ fontSize: '0.875rem' }}>
                  {language.flag}
                </Box>
                <Box component='span' sx={{ fontSize: '0.875rem' }}>
                  {language.name}
                </Box>
              </Box>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default LanguageSwitcher;
