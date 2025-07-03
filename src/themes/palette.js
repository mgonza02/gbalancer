// material-ui
import { createTheme } from '@mui/material/styles';

// third-party
import { presetDarkPalettes, presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode, presetColor) {
  const colors = mode === 'dark' ? presetDarkPalettes : presetPalettes;

  // Define consistent grey scales for both modes
  let greyPrimary = [
    '#ffffff', // 0 - white
    '#fafafa', // 1 - very light
    '#f5f5f5', // 2 - light
    '#f0f0f0', // 3 - light grey
    '#d9d9d9', // 4 - medium light
    '#bfbfbf', // 5 - medium
    '#8c8c8c', // 6 - medium dark
    '#595959', // 7 - dark
    '#262626', // 8 - very dark
    '#141414', // 9 - almost black
    '#000000' // 10 - black
  ];

  let greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  // Define proper dark mode colors
  if (mode === 'dark') {
    greyPrimary = [
      '#121212', // 0 - dark background
      '#1e1e1e', // 1 - slightly lighter
      '#2d2d2d', // 2 - card background
      '#383838', // 3 - elevated surface
      '#424242', // 4 - medium dark
      '#616161', // 5 - medium
      '#757575', // 6 - medium light
      '#9e9e9e', // 7 - light
      '#bdbdbd', // 8 - very light
      '#e0e0e0', // 9 - almost white
      '#ffffff' // 10 - white text
    ];
    greyAscent = ['#1e1e1e', '#2d2d2d', '#424242', '#757575'];
    greyConstant = ['#0a0a0a', '#1a1a1a'];
  }

  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  const paletteColor = ThemeOption(colors, presetColor, mode);

  return createTheme({
    palette: {
      mode,
      common: {
        black: mode === 'dark' ? '#ffffff' : '#000000',
        white: mode === 'dark' ? '#121212' : '#ffffff'
      },
      ...paletteColor,
      text: {
        primary: mode === 'dark' ? '#ffffff' : paletteColor.grey[700],
        secondary: mode === 'dark' ? '#b3b3b3' : paletteColor.grey[500],
        disabled: mode === 'dark' ? '#666666' : paletteColor.grey[400]
      },
      action: {
        disabled: mode === 'dark' ? '#424242' : paletteColor.grey[300],
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'
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
      }
    }
  });
}
