import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import type { FC, ReactNode } from 'react';

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: ReactNode;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
  readonly loading?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  destructiveButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

/**
 * Controlled confirmation dialog. Used by destructive actions (e.g.
 * deleting a client) where the spec explicitly requires a modal/popup
 * asking the user to confirm the operation.
 */
export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={(): void => {
        if (!loading) onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      data-testid="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          disabled={loading}
          color="primary"
          data-testid="confirm-dialog-cancel"
        >
          {cancelLabel}
        </Button>
        {destructive ? (
          <Button
            onClick={onConfirm}
            variant="contained"
            className={classes.destructiveButton}
            disabled={loading}
            data-testid="confirm-dialog-confirm"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {confirmLabel}
          </Button>
        ) : (
          <Button
            onClick={onConfirm}
            variant="contained"
            color="primary"
            disabled={loading}
            data-testid="confirm-dialog-confirm"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
