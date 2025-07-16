// material-ui
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 * import { useThemeMode } from 'contexts/ThemeContext';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * const { isDark } = useThemeMode();
     * <img src={isDark ? logoDark : logo} alt="gbalancer" width="100" />
     *
     */
    <>
      <svg width='100' height='35' viewBox='0 0 100 35' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* G Letter with cutting lines */}
        <path d='M8 4 L25 4 L25 10 L14 10 L14 16 L23 16 L23 22 L14 22 L14 31 L8 31 Z' fill={theme.palette.primary.main} />
        {/* Cut symbol */}
        <path
          d='M30 8 L42 8 M30 13 L42 13 M30 18 L42 18 M30 23 L42 23'
          stroke={theme.palette.primary.dark}
          strokeWidth='2'
          strokeLinecap='round'
        />
        {/* Material representation */}
        <rect x='46' y='6' width='16' height='23' fill={theme.palette.primary.light} opacity='0.3' />
        <rect x='48' y='8' width='5' height='8' fill={theme.palette.primary.main} />
        <rect x='55' y='8' width='7' height='5' fill={theme.palette.primary.main} />
        <rect x='55' y='15' width='7' height='6' fill={theme.palette.primary.main} />
        <rect x='48' y='18' width='5' height='9' fill={theme.palette.primary.main} />

        {/* GBalancer text */}
        <text x='68' y='20' fill={theme.palette.text.primary} fontSize='12' fontWeight='600' fontFamily='Inter, sans-serif'>
          GBalancer
        </text>
      </svg>
    </>
  );
}
