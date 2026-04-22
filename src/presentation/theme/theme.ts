import { createTheme, type Theme } from '@material-ui/core/styles';

/**
 * Executive-style palette: deep navy primary, warm amber accent,
 * restrained neutral canvas. Typography uses a stack that falls back
 * gracefully when Roboto fails to load (e.g. offline or Storybook).
 */
export const appTheme: Theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#0b2545',
      light: '#13315c',
      dark: '#071a33',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c89b2a',
      light: '#d4ae4d',
      dark: '#8c6b14',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c2533',
      secondary: '#4a5362',
    },
    error: { main: '#c62828' },
    success: { main: '#2e7d32' },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'uppercase',
      },
      containedPrimary: {
        boxShadow: 'none',
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 12,
      },
    },
  },
});
