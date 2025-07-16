// material-ui
import { alpha } from '@mui/material/styles';

// ==============================|| DEFAULT THEME - CUSTOM SHADOWS ||============================== //

export default function CustomShadows(theme) {
  const isDark = theme.palette.mode === 'dark';
  const shadowColor = isDark ? theme.palette.common.black : theme.palette.grey[900];
  const shadowOpacity = isDark ? 0.4 : 0.15;

  return {
    button: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px #0000000b',
    text: isDark ? '0 -1px 0 rgba(0,0,0,0.5)' : '0 -1px 0 rgb(0 0 0 / 12%)',
    z1: `0px 2px 8px ${alpha(shadowColor, shadowOpacity)}`,
    z4: `0px 4px 16px ${alpha(shadowColor, shadowOpacity)}`,
    z8: `0px 8px 32px ${alpha(shadowColor, shadowOpacity * 1.5)}`,
    z12: `0px 12px 48px ${alpha(shadowColor, shadowOpacity * 2)}`,
    z16: `0px 16px 64px ${alpha(shadowColor, shadowOpacity * 2.5)}`,
    z20: `0px 20px 80px ${alpha(shadowColor, shadowOpacity * 3)}`,
    z24: `0px 24px 96px ${alpha(shadowColor, shadowOpacity * 3.5)}`,

    // Color specific shadows
    primary: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    secondary: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.2)}`,
    error: `0 0 0 2px ${alpha(theme.palette.error.main, 0.2)}`,
    warning: `0 0 0 2px ${alpha(theme.palette.warning.main, 0.2)}`,
    info: `0 0 0 2px ${alpha(theme.palette.info.main, 0.2)}`,
    success: `0 0 0 2px ${alpha(theme.palette.success.main, 0.2)}`,
    grey: `0 0 0 2px ${alpha(theme.palette.grey[500], 0.2)}`,

    // Enhanced button shadows with better depth
    primaryButton: `0 4px 12px ${alpha(theme.palette.primary.main, isDark ? 0.4 : 0.25)}`,
    secondaryButton: `0 4px 12px ${alpha(theme.palette.secondary.main, isDark ? 0.4 : 0.25)}`,
    errorButton: `0 4px 12px ${alpha(theme.palette.error.main, isDark ? 0.4 : 0.25)}`,
    warningButton: `0 4px 12px ${alpha(theme.palette.warning.main, isDark ? 0.4 : 0.25)}`,
    infoButton: `0 4px 12px ${alpha(theme.palette.info.main, isDark ? 0.4 : 0.25)}`,
    successButton: `0 4px 12px ${alpha(theme.palette.success.main, isDark ? 0.4 : 0.25)}`,
    greyButton: `0 4px 12px ${alpha(theme.palette.grey[500], isDark ? 0.4 : 0.25)}`,

    // Enhanced card shadows
    card: isDark
      ? `0 4px 16px ${alpha(theme.palette.common.black, 0.5)}`
      : `0 2px 8px ${alpha(theme.palette.grey[900], 0.1)}`,
    cardHover: isDark
      ? `0 8px 24px ${alpha(theme.palette.common.black, 0.6)}`
      : `0 4px 16px ${alpha(theme.palette.grey[900], 0.15)}`,

    // Enhanced dropdown shadows
    dropdown: isDark
      ? `0 8px 32px ${alpha(theme.palette.common.black, 0.7)}`
      : `0 4px 16px ${alpha(theme.palette.grey[900], 0.18)}`,

    // Enhanced modal shadows
    modal: isDark
      ? `0 12px 48px ${alpha(theme.palette.common.black, 0.8)}`
      : `0 8px 32px ${alpha(theme.palette.grey[900], 0.25)}`,

    // Theme switcher specific shadows
    themeSwitcher: isDark
      ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}`
      : `0 4px 8px ${alpha(theme.palette.grey[900], 0.15)}`,
    themeSwitcherHover: isDark
      ? `0 8px 20px ${alpha(theme.palette.common.black, 0.5)}`
      : `0 8px 16px ${alpha(theme.palette.grey[900], 0.2)}`
  };
}
