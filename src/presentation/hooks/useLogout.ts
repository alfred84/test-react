import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { ROUTES } from '@presentation/routing/routes';

export interface LogoutApi {
  /** Clears the session, announces it via the snackbar and routes back to /login. */
  readonly logout: () => void;
}

/**
 * Encapsulates the side effects triggered by the "cerrar sesión" action
 * so every screen (AppBar button, drawer, 401 interceptor UI, etc.)
 * can share the exact same UX.
 */
export const useLogout = (): LogoutApi => {
  const auth = useAuth();
  const feedback = useFeedback();
  const history = useHistory();

  const logout = useCallback((): void => {
    auth.logout();
    feedback.info('Cerraste sesión correctamente.');
    history.replace(ROUTES.login);
  }, [auth, feedback, history]);

  return { logout };
};
