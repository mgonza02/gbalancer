import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// icons
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

// project imports
import { useThemeMode } from 'contexts/ThemeContext';

// ==============================|| THEME SWITCHER ||============================== //

export default function ThemeSwitcher() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { mode, toggleTheme, isDark } = useThemeMode();

  return (
    <Tooltip title={t(`theme.${isDark ? 'switchToLight' : 'switchToDark'}`)}>
      <IconButton
        onClick={toggleTheme}
        color='secondary'
        variant='light'
        sx={{
          color: 'text.primary',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100',
          border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
          borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.200',
            borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'transparent'
          },
          transition: 'all 0.2s ease-in-out'
        }}
        aria-label={t(`theme.${isDark ? 'switchToLight' : 'switchToDark'}`)}
      >
        {isDark ? (
          <BulbFilled style={{ fontSize: '1.15rem', color: theme.palette.warning.main }} />
        ) : (
          <BulbOutlined style={{ fontSize: '1.15rem' }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
