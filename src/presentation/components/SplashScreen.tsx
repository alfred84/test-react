import type { FC } from 'react';

/**
 * Minimal loading indicator used while the auth provider hydrates the
 * persisted session. Kept dependency-free on purpose so we don't pay the
 * Material UI bundle cost before the first interactive frame. It will be
 * restyled with the MUI theme when the design system lands in Step 14.
 */
export const SplashScreen: FC = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <span>Cargando…</span>
  </div>
);
