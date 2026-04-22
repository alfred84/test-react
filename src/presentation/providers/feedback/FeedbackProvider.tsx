import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { type AlertProps } from '@material-ui/lab/Alert';
import {
  useCallback,
  useMemo,
  useState,
  type FC,
  type ReactNode,
  type SyntheticEvent,
} from 'react';

import { FeedbackContext, type FeedbackApi, type FeedbackMessage } from './FeedbackContext';

const Alert: FC<AlertProps> = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

export interface FeedbackProviderProps {
  readonly children: ReactNode;
}

const DEFAULT_AUTO_HIDE_MS = 4000;

const buildMessage = (
  severity: FeedbackMessage['severity'],
  message: string,
  autoHideDuration?: number | null,
): FeedbackMessage =>
  autoHideDuration === undefined ? { severity, message } : { severity, message, autoHideDuration };

/**
 * Renders a single snackbar at the app root and exposes imperative
 * helpers (`success`, `error`, …) to any descendant via context. Kept
 * separate from AppProviders so tests can opt-in to feedback without
 * spinning up the entire auth stack.
 */
export const FeedbackProvider: FC<FeedbackProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<FeedbackMessage | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const show = useCallback((next: FeedbackMessage): void => {
    setMessage(next);
    setOpen(true);
  }, []);

  const dismiss = useCallback((): void => {
    setOpen(false);
  }, []);

  const success = useCallback(
    (msg: string, autoHideDuration?: number | null): void =>
      show(buildMessage('success', msg, autoHideDuration)),
    [show],
  );
  const error = useCallback(
    (msg: string, autoHideDuration?: number | null): void =>
      show(buildMessage('error', msg, autoHideDuration)),
    [show],
  );
  const info = useCallback(
    (msg: string, autoHideDuration?: number | null): void =>
      show(buildMessage('info', msg, autoHideDuration)),
    [show],
  );
  const warning = useCallback(
    (msg: string, autoHideDuration?: number | null): void =>
      show(buildMessage('warning', msg, autoHideDuration)),
    [show],
  );

  const api: FeedbackApi = useMemo(
    () => ({ show, success, error, info, warning, dismiss }),
    [show, success, error, info, warning, dismiss],
  );

  const handleClose = (_event: SyntheticEvent<unknown> | Event, reason?: string): void => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const autoHide: number | null =
    message?.autoHideDuration === undefined ? DEFAULT_AUTO_HIDE_MS : message.autoHideDuration;

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {message ? (
        <Snackbar
          open={open}
          onClose={handleClose}
          autoHideDuration={autoHide}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={dismiss} severity={message.severity} data-testid="feedback-alert">
            {message.message}
          </Alert>
        </Snackbar>
      ) : null}
    </FeedbackContext.Provider>
  );
};
