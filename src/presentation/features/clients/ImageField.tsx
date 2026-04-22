import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { useRef, type ChangeEvent, type FC } from 'react';

import { ACCEPTED_IMAGE_TYPES, readFileAsDataUrl, validateImageFile } from './readFileAsDataUrl';

export interface ImageFieldProps {
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  readonly disabled?: boolean;
  readonly error?: string | null;
  readonly onError?: (message: string) => void;
  readonly label?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  avatar: {
    width: 72,
    height: 72,
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.secondary,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  buttons: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
}));

/**
 * Controlled "picture of the client" field. Stores the value as a
 * data URL so repositories can forward it verbatim as a base64 string
 * to the backend. `onError` is surfaced for transient UI feedback
 * (e.g. a snackbar) while `error` reflects validation state.
 */
export const ImageField: FC<ImageFieldProps> = ({
  value,
  onChange,
  disabled = false,
  error = null,
  onError,
  label = 'Fotografía',
}) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (): void => {
    inputRef.current?.click();
  };

  const clearImage = (): void => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.ok) {
      onError?.(validation.message ?? 'Archivo inválido.');
      event.target.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      onError?.('No se pudo leer la imagen seleccionada.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" component="label" gutterBottom>
        {label}
      </Typography>
      <Box className={classes.root}>
        <Avatar
          className={classes.avatar}
          {...(value ? { src: value } : {})}
          data-testid="image-field-preview"
        >
          {value ? null : <PhotoCameraIcon />}
        </Avatar>
        <Box className={classes.actions}>
          <Box className={classes.buttons}>
            <Button
              variant="outlined"
              color="primary"
              onClick={openPicker}
              disabled={disabled}
              data-testid="image-field-pick"
            >
              {value ? 'Cambiar imagen' : 'Elegir imagen'}
            </Button>
            {value ? (
              <Button
                color="secondary"
                onClick={clearImage}
                disabled={disabled}
                data-testid="image-field-clear"
              >
                Quitar
              </Button>
            ) : null}
          </Box>
          <FormHelperText error={Boolean(error)}>
            {error ?? 'PNG, JPG o WebP. Máximo 2 MB.'}
          </FormHelperText>
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className={classes.input}
          onChange={(event): void => {
            void handleChange(event);
          }}
          data-testid="image-field-input"
        />
      </Box>
    </Box>
  );
};
