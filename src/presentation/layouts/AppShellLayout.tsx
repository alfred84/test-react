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
import { makeStyles, useTheme, type Theme } from '@material-ui/core/styles';
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
const DRAWER_WIDTH_COLLAPSED = 72;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  appBar: {
    boxShadow: theme.shadows[2],
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
  drawer: {
    flexShrink: 0,
  },
  drawerPaper: {
    background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRight: 'none',
    top: 56,
    height: 'calc(100% - 56px)',
    overflowX: 'hidden',
    [theme.breakpoints.up('sm')]: {
      top: 64,
      height: 'calc(100% - 64px)',
    },
  },
  brand: {
    padding: theme.spacing(3, 2.5),
  },
  brandCollapsed: {
    padding: theme.spacing(2, 1),
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
  userRowCollapsed: {
    justifyContent: 'center',
    padding: theme.spacing(2, 1),
    gap: 0,
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
  navItemCollapsed: {
    justifyContent: 'center',
    margin: theme.spacing(0.5, 0.75),
    '& .MuiListItemIcon-root': {
      minWidth: 0,
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
  body: {
    display: 'flex',
    flexGrow: 1,
    minHeight: 0,
  },
  toolbarOffset: theme.mixins.toolbar,
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

const navItemClassName = (
  classes: Record<'navItem' | 'navItemActive' | 'navItemCollapsed', string>,
  active: boolean,
  collapsed: boolean,
): string =>
  [classes.navItem, active ? classes.navItemActive : '', collapsed ? classes.navItemCollapsed : '']
    .filter(Boolean)
    .join(' ');

/**
 * Authenticated application shell: permanent sidebar below the top AppBar
 * (collapsible to icon-only via the toolbar menu button, no modal backdrop),
 * fixed company title, session user + logout, and a content slot for the page.
 */
export const AppShellLayout: FC<AppShellLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();
  const { logout } = useLogout();

  const username = auth.session?.username ?? '';

  const drawerWidthPx = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;
  const drawerWidthTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const handleToggleSidebar = (): void => setSidebarCollapsed((prev) => !prev);

  const handleNavigate = (item: NavItem): void => {
    if (location.pathname === item.path) return;
    history.push(item.path);
  };

  const drawer = useMemo(
    () => (
      <>
        <Box
          className={
            sidebarCollapsed ? `${classes.brand} ${classes.brandCollapsed}` : classes.brand
          }
        >
          {sidebarCollapsed ? (
            <Typography variant="h6" className={classes.brandTitle} align="center">
              C
            </Typography>
          ) : (
            <>
              <Typography variant="h6" className={classes.brandTitle}>
                Clientes
              </Typography>
              <Typography variant="caption" className={classes.brandSubtitle}>
                Panel administrativo
              </Typography>
            </>
          )}
        </Box>
        <Divider className={classes.divider} />
        <Box
          className={
            sidebarCollapsed ? `${classes.userRow} ${classes.userRowCollapsed}` : classes.userRow
          }
          data-testid="drawer-user"
        >
          <Avatar className={classes.avatar}>{initialsFrom(username)}</Avatar>
          {!sidebarCollapsed ? (
            <Box>
              <Typography variant="body2" className={classes.userName}>
                {username || 'Usuario'}
              </Typography>
              <Typography variant="caption" className={classes.userHint}>
                Sesión activa
              </Typography>
            </Box>
          ) : null}
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
                className={navItemClassName(classes, active, sidebarCollapsed)}
                selected={active}
                data-testid={`nav-${item.id}`}
              >
                <ListItemIcon className={classes.navIcon}>
                  <Icon />
                </ListItemIcon>
                {sidebarCollapsed ? null : (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classes, username, location.pathname, sidebarCollapsed],
  );

  return (
    <Box className={classes.root}>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            aria-expanded={!sidebarCollapsed}
            edge="start"
            onClick={handleToggleSidebar}
            className={classes.menuButton}
            data-testid="shell-menu-button"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} data-testid="shell-title">
            COMPANIA PRUEBA
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

      <Box className={classes.toolbarOffset} />

      <Box className={classes.body}>
        <Box
          component="nav"
          className={classes.drawer}
          aria-label="Navegación principal"
          data-testid="shell-sidebar"
          style={{
            width: drawerWidthPx,
            transition: drawerWidthTransition,
          }}
        >
          <Drawer
            variant="permanent"
            open
            classes={{ paper: classes.drawerPaper }}
            PaperProps={{
              style: {
                width: drawerWidthPx,
                transition: drawerWidthTransition,
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box className={classes.content}>
          <Box component="main" className={classes.main}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
