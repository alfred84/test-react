import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import type { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '@presentation/providers/auth/AuthContext';
import { ROUTES } from '@presentation/routing/routes';

const useStyles = makeStyles((theme: Theme) => ({
  hero: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  heroIcon: {
    fontSize: 56,
    opacity: 0.9,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  cardIcon: {
    fontSize: 44,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
}));

export const HomePage: FC = () => {
  const classes = useStyles();
  const auth = useAuth();
  const username = auth.session?.username ?? '';

  return (
    <Box data-testid="home-page">
      <Box className={classes.hero}>
        <AccountCircleIcon className={classes.heroIcon} />
        <Box>
          <Typography variant="h4" component="h1">
            Bienvenido{username ? `, ${username}` : ''}
          </Typography>
          <Typography variant="body1">
            Gestiona los clientes de la institución desde un único lugar.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card className={classes.card} data-testid="home-card-clients">
            <CardContent className={classes.cardContent}>
              <PeopleAltIcon className={classes.cardIcon} />
              <Typography variant="h6" component="h2" gutterBottom>
                Consulta clientes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Consultar, crear, editar o eliminar los clientes registrados en el sistema.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                component={RouterLink}
                to={ROUTES.clients.list}
                color="primary"
                variant="contained"
                data-testid="home-go-clients"
              >
                Ir a clientes
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
