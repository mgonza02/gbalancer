// material-ui
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 * import { ThemeMode } from 'config';
 *
 */

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <svg width='35' height='35' viewBox='0 0 35 35' fill='none' xmlns='http://www.w3.org/2000/svg'>
      {/* G Letter */}
      <path d='M5 3 L20 3 L20 8 L11 8 L11 13 L18 13 L18 18 L11 18 L11 32 L5 32 Z' fill={theme.palette.primary.main} />
      {/* Cut lines */}
      <path
        d='M22 7 L32 7 M22 11 L32 11 M22 15 L32 15 M22 19 L32 19 M22 23 L32 23'
        stroke={theme.palette.primary.dark}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      {/* Material pieces */}
      <rect x='23' y='25' width='4' height='6' fill={theme.palette.primary.main} opacity='0.8' />
      <rect x='28' y='25' width='3' height='4' fill={theme.palette.primary.main} opacity='0.8' />
      <rect x='28' y='30' width='3' height='1' fill={theme.palette.primary.main} opacity='0.8' />
    </svg>
  );
}
