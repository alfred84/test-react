import Button from '@material-ui/core/Button';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { ClientFilters } from '@domain/entities/Client';

interface ClientFiltersFormValues {
  readonly identification: string;
  readonly name: string;
}

export interface ClientFiltersFormProps {
  readonly defaultValues?: ClientFilters;
  readonly onSearch: (filters: ClientFilters) => void;
  readonly disabled?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: '1fr',
    alignItems: 'start',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: '1fr 1fr auto',
    },
  },
  button: {
    alignSelf: 'start',
    height: 56,
  },
}));

const cleanFilters = (values: ClientFiltersFormValues): ClientFilters => {
  const identification = values.identification.trim();
  const name = values.name.trim();
  return {
    ...(identification.length > 0 ? { identification } : {}),
    ...(name.length > 0 ? { name } : {}),
  };
};

export const ClientFiltersForm: FC<ClientFiltersFormProps> = ({
  defaultValues,
  onSearch,
  disabled = false,
}) => {
  const classes = useStyles();
  const { control, handleSubmit } = useForm<ClientFiltersFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      identification: defaultValues?.identification ?? '',
      name: defaultValues?.name ?? '',
    },
  });

  const onSubmit = handleSubmit((values): void => {
    onSearch(cleanFilters(values));
  });

  return (
    <form
      className={classes.form}
      onSubmit={(event): void => {
        void onSubmit(event);
      }}
      noValidate
      data-testid="clients-filters-form"
    >
      <Controller
        control={control}
        name="identification"
        render={({ field }): JSX.Element => (
          <TextField
            {...field}
            label="Identificación"
            variant="outlined"
            disabled={disabled}
            inputProps={{ 'data-testid': 'filter-identification' }}
          />
        )}
      />
      <Controller
        control={control}
        name="name"
        render={({ field }): JSX.Element => (
          <TextField
            {...field}
            label="Nombre"
            variant="outlined"
            disabled={disabled}
            inputProps={{ 'data-testid': 'filter-name' }}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        startIcon={<SearchIcon />}
        disabled={disabled}
        className={classes.button}
        data-testid="filter-submit"
      >
        Buscar
      </Button>
    </form>
  );
};
