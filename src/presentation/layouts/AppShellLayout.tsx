import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import PeopleIcon from '@material-ui/icons/People';
import { useMemo, useState, type ComponentType, type FC, type ReactNode } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useLogout } from '@presentation/hooks/useLogout';
import { useAuth } from '@presentation/providers/auth/AuthContext';

import { NAV_ITEMS, isNavItemActive, type NavItem } from './navItems';

const DRAWER_WIDTH = 260;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  appBar: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      marginLeft: DRAWER_WIDTH,
    },
    boxShadow: theme.shadows[2],
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
    background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRight: 'none',
  },
  brand: {
    padding: theme.spacing(3, 2.5),
  },
  brandTitle: {
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: theme.spacing(0.5),
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5),
    gap: theme.spacing(1.5),
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 700,
  },
  userName: {
    fontWeight: 600,
  },
  userHint: {
    color: 'rgba(255,255,255,0.65)',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navList: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  navItem: {
    color: 'rgba(255,255,255,0.85)',
    margin: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
  },
  navIcon: {
    color: 'inherit',
    minWidth: 40,
  },
  toolbarUser: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  topAvatar: {
    width: 32,
    height: 32,
    fontSize: 14,
    backgroundColor: theme.palette.secondary.main,
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  main: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4),
    },
  },
}));

const NAV_ICONS: Record<string, ComponentType> = {
  home: HomeIcon,
  clients: PeopleIcon,
};

export interface AppShellLayoutProps {
  readonly title: string;
  readonly children: ReactNode;
}

const initialsFrom = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase() || trimmed.charAt(0).toUpperCase();
};

/**
 * Authenticated application shell: responsive drawer (permanent on md+,
 * temporary below), top AppBar with page title + session user + logout,
 * and a content slot for the current page. Matches the spec's behaviour:
 * "INICIO" brings the user back home, "CONSULTA CLIENTES" opens the list,
 * the header must show the session username and a logout button on the
 * right edge.
 */
export const AppShellLayout: FC<AppShellLayoutProps> = ({ title, children }) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();
  const { logout } = useLogout();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const username = auth.session?.username ?? '';

  const handleToggleDrawer = (): void => setMobileOpen((prev) => !prev);
  const handleCloseDrawer = (): void => setMobileOpen(false);

  const handleNavigate = (item: NavItem): void => {
    handleCloseDrawer();
    if (location.pathname === item.path) return;
    history.push(item.path);
  };

  const drawer = useMemo(
    () => (
      <>
        <Box className={classes.brand}>
          <Typography variant="h6" className={classes.brandTitle}>
            Clientes
          </Typography>
          <Typography variant="caption" className={classes.brandSubtitle}>
            Panel administrativo
          </Typography>
        </Box>
        <Divider className={classes.divider} />
        <Box className={classes.userRow} data-testid="drawer-user">
          <Avatar className={classes.avatar}>{initialsFrom(username)}</Avatar>
          <Box>
            <Typography variant="body2" className={classes.userName}>
              {username || 'Usuario'}
            </Typography>
            <Typography variant="caption" className={classes.userHint}>
              Sesión activa
            </Typography>
          </Box>
        </Box>
        <Divider className={classes.divider} />
        <List className={classes.navList}>
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.id] ?? HomeIcon;
            const active = isNavItemActive(item, location.pathname);
            return (
              <ListItem
                button
                key={item.id}
                onClick={(): void => handleNavigate(item)}
                className={`${classes.navItem} ${active ? classes.navItemActive : ''}`}
                selected={active}
                data-testid={`nav-${item.id}`}
              >
                <ListItemIcon className={classes.navIcon}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            );
          })}
        </List>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classes, username, location.pathname],
  );

  return (
    <Box className={classes.root}>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Abrir menú"
            edge="start"
            onClick={handleToggleDrawer}
            className={classes.menuButton}
            data-testid="shell-menu-button"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} data-testid="shell-title">
            {title}
          </Typography>
          <Box className={classes.toolbarUser}>
            <Hidden smDown implementation="css">
              <Typography variant="body2" data-testid="shell-username">
                {username}
              </Typography>
            </Hidden>
            <Avatar className={classes.topAvatar}>{initialsFrom(username)}</Avatar>
            <IconButton
              color="inherit"
              onClick={logout}
              aria-label="Cerrar sesión"
              data-testid="shell-logout"
            >
              <ExitToAppIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <nav className={classes.drawer} aria-label="Navegación principal">
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleCloseDrawer}
            classes={{ paper: classes.drawerPaper }}
            ModalProps={{ keepMounted: true }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer variant="permanent" open classes={{ paper: classes.drawerPaper }}>
            {drawer}
          </Drawer>
        </Hidden>
      </nav>

      <Box className={classes.content}>
        <Toolbar />
        <Box component="main" className={classes.main}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
