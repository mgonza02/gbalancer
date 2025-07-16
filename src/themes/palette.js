// material-ui
import { createTheme } from '@mui/material/styles';

// third-party
import { presetDarkPalettes, presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode, presetColor) {
  const colors = mode === 'dark' ? presetDarkPalettes : presetPalettes;

  // Define improved grey scales for both modes with better contrast
  let greyPrimary = [
    '#ffffff', // 0 - white
    '#fafafa', // 1 - very light
    '#f5f5f5', // 2 - light
    '#eeeeee', // 3 - light grey (improved contrast)
    '#e0e0e0', // 4 - medium light (improved)
    '#bdbdbd', // 5 - medium (improved)
    '#757575', // 6 - medium dark (improved contrast)
    '#424242', // 7 - dark (improved)
    '#212121', // 8 - very dark (improved)
    '#121212', // 9 - almost black (improved)
    '#000000' // 10 - black
  ];

  let greyAscent = ['#fafafa', '#bdbdbd', '#424242', '#212121'];
  let greyConstant = ['#fafafb', '#e8eaf6'];

  // Define proper dark mode colors with better contrast and readability
  if (mode === 'dark') {
    greyPrimary = [
      '#0a0a0a', // 0 - deepest dark background
      '#121212', // 1 - dark background (Material Design standard)
      '#1e1e1e', // 2 - slightly lighter (card surface)
      '#2d2d2d', // 3 - elevated surface
      '#383838', // 4 - higher elevation
      '#424242', // 5 - medium dark
      '#616161', // 6 - medium
      '#757575', // 7 - medium light
      '#9e9e9e', // 8 - light
      '#bdbdbd', // 9 - very light
      '#e0e0e0', // 10 - almost white
      '#ffffff' // 11 - white text
    ];
    greyAscent = ['#1a1a1a', '#2d2d2d', '#424242', '#757575'];
    greyConstant = ['#0a0a0a', '#1a1a1a'];
  }

  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  const paletteColor = ThemeOption(colors, presetColor, mode);

  return createTheme({
    palette: {
      mode,
      common: {
        black: mode === 'dark' ? '#ffffff' : '#000000',
        white: mode === 'dark' ? '#0a0a0a' : '#ffffff'
      },
      ...paletteColor,
      text: {
        primary: mode === 'dark' ? '#ffffff' : paletteColor.grey[700],
        secondary: mode === 'dark' ? '#b3b3b3' : paletteColor.grey[500],
        disabled: mode === 'dark' ? '#666666' : paletteColor.grey[400],
        hint: mode === 'dark' ? '#9e9e9e' : paletteColor.grey[500]
      },
      action: {
        disabled: mode === 'dark' ? '#424242' : paletteColor.grey[300],
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        focus: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        disabledBackground: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        activatedOpacity: 0.24,
        hoverOpacity: 0.08,
        selectedOpacity: 0.16
      },
      divider: mode === 'dark' ? '#2d2d2d' : paletteColor.grey[200],
      background: {
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        default: mode === 'dark' ? '#121212' : '#fafafa',
        neutral: mode === 'dark' ? '#2d2d2d' : '#f5f5f5'
      },
      surface: {
        main: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        dark: mode === 'dark' ? '#121212' : '#f5f5f5',
        light: mode === 'dark' ? '#2d2d2d' : '#ffffff'
      },
      // Enhanced contrast colors
      contrast: {
        high: mode === 'dark' ? '#ffffff' : '#000000',
        medium: mode === 'dark' ? '#e0e0e0' : '#424242',
        low: mode === 'dark' ? '#9e9e9e' : '#757575'
      }
    }
  });
}
