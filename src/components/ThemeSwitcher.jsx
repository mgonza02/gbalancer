import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// icons
import { BulbFilled, BulbOutlined } from '@ant-design/icons';

// project imports
import { useThemeMode } from 'contexts/ThemeContext';

// ==============================|| THEME SWITCHER ||============================== //

export default function ThemeSwitcher({ size = 'medium', showTooltip = true }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { toggleTheme, isDark } = useThemeMode();

  const iconSize = size === 'large' ? '1.5rem' : size === 'small' ? '1rem' : '1.2rem';

  const button = (
    <IconButton
      onClick={toggleTheme}
      color='secondary'
      variant='light'
      size={size}
      sx={{
        color: 'text.primary',
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100',
        border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
        borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent',
        boxShadow: theme.customShadows?.themeSwitcher || (theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 4px rgba(0,0,0,0.1)'),
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.200',
          borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'transparent',
          boxShadow: theme.customShadows?.themeSwitcherHover || (theme.palette.mode === 'dark'
            ? '0 4px 12px rgba(0,0,0,0.4)'
            : '0 4px 8px rgba(0,0,0,0.15)'),
          transform: 'translateY(-1px)'
        },
        '&:active': {
          transform: 'translateY(0px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 1px 4px rgba(0,0,0,0.2)'
            : '0 1px 2px rgba(0,0,0,0.1)'
        },
        transition: 'all 0.2s ease-in-out',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'linear-gradient(45deg, rgba(255,193,7,0.1), rgba(255,152,0,0.1))'
            : 'linear-gradient(45deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))',
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out',
          borderRadius: 'inherit'
        },
        '&:hover::before': {
          opacity: 1
        }
      }}
      aria-label={t(`theme.${isDark ? 'switchToLight' : 'switchToDark'}`)}
    >
      {isDark ? (
        <BulbFilled
          style={{
            fontSize: iconSize,
            color: theme.palette.warning.main,
            filter: 'drop-shadow(0 0 3px rgba(255,193,7,0.4))',
            transition: 'all 0.3s ease-in-out',
            animation: 'pulse 2s infinite'
          }}
        />
      ) : (
        <BulbOutlined
          style={{
            fontSize: iconSize,
            color: theme.palette.primary.main,
            transition: 'all 0.3s ease-in-out'
          }}
        />
      )}
    </IconButton>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip
      title={t(`theme.${isDark ? 'switchToLight' : 'switchToDark'}`)}
      arrow
      placement="bottom"
    >
      {button}
    </Tooltip>
  );
}
