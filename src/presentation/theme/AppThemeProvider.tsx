import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import type { FC, ReactNode } from 'react';

import { appTheme } from './theme';

export interface AppThemeProviderProps {
  readonly children: ReactNode;
}

/**
 * Applies the executive Material UI theme and resets the global CSS
 * baseline. Keeping this as a thin wrapper makes it trivial to swap the
 * theme (e.g. dark mode) from a single place later on.
 */
export const AppThemeProvider: FC<AppThemeProviderProps> = ({ children }) => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
