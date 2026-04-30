import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import type { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '@presentation/providers/auth/AuthContext';
import { ROUTES } from '@presentation/routing/routes';

const useStyles = makeStyles((theme: Theme) => ({
  hero: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    color: theme.palette.text.primary,
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(4),
  },
  heroSubtitle: {
    color: theme.palette.text.secondary,
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
        <Typography variant="h4" component="h1">
          Bienvenido{username ? `, ${username}` : ''}
        </Typography>
        <Typography variant="body1" className={classes.heroSubtitle}>
          Gestiona los clientes de la institución desde un único lugar.
        </Typography>
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
