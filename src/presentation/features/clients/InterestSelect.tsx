import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import type { FC } from 'react';

import type { Interest } from '@domain/entities/Interest';

export interface InterestSelectProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly items: readonly Interest[];
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly error?: boolean;
  readonly helperText?: string;
  readonly label?: string;
}

/**
 * Controlled MUI select bound to an Interest catalog. Kept as a dumb
 * component so pages can decide how to load / cache interests.
 */
export const InterestSelect: FC<InterestSelectProps> = ({
  value,
  onChange,
  items,
  loading = false,
  disabled = false,
  error = false,
  helperText = ' ',
  label = 'Interés',
}) => {
  const isDisabled = disabled || loading;
  return (
    <FormControl variant="outlined" fullWidth error={error} disabled={isDisabled}>
      <InputLabel id="interest-select-label">{label}</InputLabel>
      <Select
        labelId="interest-select-label"
        label={label}
        value={value}
        onChange={(event): void => {
          const next = event.target.value as string;
          onChange(next);
        }}
        inputProps={{ 'data-testid': 'interest-select' }}
      >
        <MenuItem value="">
          <em>{loading ? 'Cargando…' : 'Seleccioná un interés'}</em>
        </MenuItem>
        {items.map((interest) => (
          <MenuItem key={interest.id} value={interest.id}>
            {interest.description}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};
