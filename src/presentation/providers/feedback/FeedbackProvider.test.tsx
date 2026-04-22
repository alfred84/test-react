import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';

import { useFeedback } from './FeedbackContext';
import { FeedbackProvider } from './FeedbackProvider';

const Trigger: FC<{ readonly label: string; readonly run: () => void }> = ({ label, run }) => (
  <button type="button" onClick={run}>
    {label}
  </button>
);

const Harness: FC = () => {
  const feedback = useFeedback();
  return (
    <>
      <Trigger label="fire-success" run={() => feedback.success('Guardado')} />
      <Trigger label="fire-error" run={() => feedback.error('Falló la red')} />
      <Trigger
        label="fire-sticky"
        run={() => feedback.show({ severity: 'info', message: 'Quédate', autoHideDuration: null })}
      />
    </>
  );
};

const setup = (): void => {
  render(
    <FeedbackProvider>
      <Harness />
    </FeedbackProvider>,
  );
};

describe('FeedbackProvider', () => {
  it('renders nothing initially', () => {
    setup();
    expect(screen.queryByTestId('feedback-alert')).not.toBeInTheDocument();
  });

  it('shows a success alert when success() is called', () => {
    setup();
    userEvent.click(screen.getByText('fire-success'));
    const alert = screen.getByTestId('feedback-alert');
    expect(alert).toHaveTextContent('Guardado');
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
  });

  it('shows an error alert when error() is called', () => {
    setup();
    userEvent.click(screen.getByText('fire-error'));
    const alert = screen.getByTestId('feedback-alert');
    expect(alert).toHaveTextContent('Falló la red');
    expect(alert).toHaveClass('MuiAlert-filledError');
  });

  it('replaces the visible message with the latest one', () => {
    setup();
    userEvent.click(screen.getByText('fire-success'));
    userEvent.click(screen.getByText('fire-error'));
    expect(screen.getByTestId('feedback-alert')).toHaveTextContent('Falló la red');
  });

  it('throws when useFeedback is used outside the provider', () => {
    const NakedConsumer: FC = () => {
      useFeedback();
      return null;
    };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<NakedConsumer />)).toThrow(/must be used within/i);
    spy.mockRestore();
  });

  it('keeps sticky messages open until explicitly dismissed', () => {
    jest.useFakeTimers();
    try {
      setup();
      userEvent.click(screen.getByText('fire-sticky'));
      expect(screen.getByTestId('feedback-alert')).toHaveTextContent('Quédate');
      act(() => {
        jest.advanceTimersByTime(10_000);
      });
      expect(screen.getByTestId('feedback-alert')).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });
});
