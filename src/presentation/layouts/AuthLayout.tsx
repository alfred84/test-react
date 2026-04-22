import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import type { FC, ReactNode } from 'react';

export interface AuthLayoutProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage:
      'linear-gradient(135deg, rgba(11,37,69,1) 0%, rgba(19,49,92,1) 60%, rgba(7,26,51,1) 100%)',
    padding: theme.spacing(3),
  },
  paper: {
    width: '100%',
    padding: theme.spacing(5, 4),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(6, 6),
    },
  },
  brand: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  footer: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },
}));

/**
 * Branded centered-card layout shared by the Login and Register pages.
 * Keeps the pages focused on their form logic.
 */
export const AuthLayout: FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root} component="main">
      <Container maxWidth="xs" disableGutters>
        <Paper elevation={4} className={classes.paper}>
          <div className={classes.brand}>
            <Typography variant="h4" component="h1" className={classes.title}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" className={classes.subtitle}>
                {subtitle}
              </Typography>
            ) : null}
          </div>
          {children}
          {footer ? <Box className={classes.footer}>{footer}</Box> : null}
        </Paper>
      </Container>
    </Box>
  );
};
