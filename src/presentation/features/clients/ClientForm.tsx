import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';
import { useState, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { ClientDraft, Gender } from '@domain/entities/Client';
import type { Interest } from '@domain/entities/Interest';

import {
  clientFieldRules,
  EMPTY_FORM_VALUES,
  formValuesToDraft,
  type ClientFormValues,
} from './clientFormSchema';
import { ImageField } from './ImageField';
import { InterestSelect } from './InterestSelect';

export interface ClientFormProps {
  readonly mode: 'create' | 'edit';
  readonly initialValues?: ClientFormValues;
  readonly interests: readonly Interest[];
  readonly interestsLoading?: boolean;
  readonly submitting?: boolean;
  readonly onSubmit: (draft: ClientDraft) => void | Promise<void>;
  readonly onCancel: () => void;
  readonly onImageError?: (message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
}));

const SUBMIT_LABELS = {
  create: 'Guardar cliente',
  edit: 'Guardar cambios',
} as const;

export const ClientForm: FC<ClientFormProps> = ({
  mode,
  initialValues,
  interests,
  interestsLoading = false,
  submitting = false,
  onSubmit,
  onCancel,
  onImageError,
}) => {
  const classes = useStyles();
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    mode: 'onSubmit',
    defaultValues: initialValues ?? EMPTY_FORM_VALUES,
  });

  const onValid = handleSubmit(async (values): Promise<void> => {
    await onSubmit(formValuesToDraft(values));
  });

  return (
    <form
      className={classes.form}
      onSubmit={(event): void => {
        void onValid(event);
      }}
      noValidate
      data-testid="client-form"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="firstName"
            rules={clientFieldRules.firstName}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Nombre"
                variant="outlined"
                fullWidth
                required
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-firstName' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="lastName"
            rules={clientFieldRules.lastName}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Apellidos"
                variant="outlined"
                fullWidth
                required
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-lastName' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="identification"
            rules={clientFieldRules.identification}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Identificación"
                variant="outlined"
                fullWidth
                required
                error={Boolean(errors.identification)}
                helperText={errors.identification?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-identification' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="mobilePhone"
            rules={clientFieldRules.mobilePhone}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Teléfono celular"
                variant="outlined"
                fullWidth
                required
                error={Boolean(errors.mobilePhone)}
                helperText={errors.mobilePhone?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-mobilePhone' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="otherPhone"
            rules={clientFieldRules.otherPhone}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Otro teléfono"
                variant="outlined"
                fullWidth
                error={Boolean(errors.otherPhone)}
                helperText={errors.otherPhone?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-otherPhone' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="gender"
            render={({ field }): JSX.Element => (
              <FormControl component="fieldset">
                <FormLabel component="legend">Sexo</FormLabel>
                <RadioGroup
                  row
                  {...field}
                  onChange={(event): void => field.onChange(event.target.value as Gender)}
                >
                  <FormControlLabel
                    value="M"
                    control={<Radio color="primary" />}
                    label="Masculino"
                    data-testid="form-gender-M"
                  />
                  <FormControlLabel
                    value="F"
                    control={<Radio color="primary" />}
                    label="Femenino"
                    data-testid="form-gender-F"
                  />
                </RadioGroup>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="birthDate"
            rules={clientFieldRules.birthDate}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                type="date"
                label="Fecha de nacimiento"
                variant="outlined"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.birthDate)}
                helperText={errors.birthDate?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-birthDate' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="affiliationDate"
            rules={clientFieldRules.affiliationDate}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                type="date"
                label="Fecha de afiliación"
                variant="outlined"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.affiliationDate)}
                helperText={errors.affiliationDate?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-affiliationDate' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            control={control}
            name="address"
            rules={clientFieldRules.address}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Dirección"
                variant="outlined"
                fullWidth
                required
                multiline
                minRows={2}
                error={Boolean(errors.address)}
                helperText={errors.address?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-address' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="interestId"
            rules={clientFieldRules.interestId}
            render={({ field }): JSX.Element => (
              <InterestSelect
                value={field.value}
                onChange={field.onChange}
                items={interests}
                loading={interestsLoading}
                error={Boolean(errors.interestId)}
                helperText={errors.interestId?.message ?? ' '}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="image"
            render={({ field }): JSX.Element => (
              <ImageField
                value={field.value}
                onChange={(next): void => {
                  field.onChange(next);
                  setImageError(null);
                }}
                error={imageError}
                onError={(message): void => {
                  setImageError(message);
                  onImageError?.(message);
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            control={control}
            name="personalReview"
            rules={clientFieldRules.personalReview}
            render={({ field }): JSX.Element => (
              <TextField
                {...field}
                label="Reseña personal"
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                error={Boolean(errors.personalReview)}
                helperText={errors.personalReview?.message ?? ' '}
                inputProps={{ 'data-testid': 'form-personalReview' }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box className={classes.actions}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={onCancel}
          disabled={submitting}
          data-testid="form-cancel"
        >
          Regresar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          disabled={submitting}
          data-testid="form-submit"
        >
          {SUBMIT_LABELS[mode]}
        </Button>
      </Box>
    </form>
  );
};
