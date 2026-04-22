import { createContext, useContext } from 'react';

export type FeedbackSeverity = 'success' | 'info' | 'warning' | 'error';

export interface FeedbackMessage {
  readonly severity: FeedbackSeverity;
  readonly message: string;
  /**
   * Optional auto-dismiss duration in ms. Defaults to 4000. Pass `null`
   * to require the user to dismiss the message manually.
   */
  readonly autoHideDuration?: number | null;
}

export interface FeedbackApi {
  readonly show: (msg: FeedbackMessage) => void;
  readonly success: (message: string, autoHideDuration?: number | null) => void;
  readonly error: (message: string, autoHideDuration?: number | null) => void;
  readonly info: (message: string, autoHideDuration?: number | null) => void;
  readonly warning: (message: string, autoHideDuration?: number | null) => void;
  readonly dismiss: () => void;
}

export const FeedbackContext = createContext<FeedbackApi | null>(null);
FeedbackContext.displayName = 'FeedbackContext';

export const useFeedback = (): FeedbackApi => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within <FeedbackProvider />.');
  }
  return ctx;
};
