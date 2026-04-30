import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import type { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { ROUTES } from '@presentation/routing/routes';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: 'calc(100vh - 220px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 680,
    padding: theme.spacing(4),
    textAlign: 'center',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  title: {
    color: '#5DB4FF',
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
}));

export const NotFoundPage: FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root} data-testid="not-found-page">
      <Paper className={classes.panel} elevation={0}>
        <Typography variant="h4" component="h1" className={classes.title}>
          404 — Página no encontrada
        </Typography>
        <Typography variant="body1" className={classes.subtitle}>
          La ruta que buscas no existe o fue movida.
        </Typography>
        <Button
          component={RouterLink}
          to={ROUTES.home}
          variant="contained"
          color="primary"
          data-testid="not-found-home"
        >
          Volver al inicio
        </Button>
      </Paper>
    </Box>
  );
};
