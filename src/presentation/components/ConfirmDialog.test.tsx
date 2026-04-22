import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('does not render content when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Eliminar"
        message="¿Continuar?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.queryByTestId('confirm-dialog-confirm')).not.toBeInTheDocument();
  });

  it('renders title + message and fires callbacks on cancel / confirm', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open
        title="Eliminar cliente"
        message="¿Seguro?"
        confirmLabel="Eliminar"
        destructive
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('heading', { name: /eliminar cliente/i })).toBeInTheDocument();
    expect(screen.getByText(/seguro/i)).toBeInTheDocument();

    userEvent.click(screen.getByTestId('confirm-dialog-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);

    userEvent.click(screen.getByTestId('confirm-dialog-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while loading', () => {
    render(
      <ConfirmDialog
        open
        loading
        title="t"
        message="m"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByTestId('confirm-dialog-cancel')).toBeDisabled();
    expect(screen.getByTestId('confirm-dialog-confirm')).toBeDisabled();
  });
});
