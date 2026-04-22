import { ROUTES } from '@presentation/routing/routes';

export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  /** Also matches child routes (e.g. /clients/new should highlight "Clientes"). */
  readonly matchPrefix?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Inicio', path: ROUTES.home },
  {
    id: 'clients',
    label: 'Consulta clientes',
    path: ROUTES.clients.list,
    matchPrefix: '/clients',
  },
];

export const isNavItemActive = (item: NavItem, currentPath: string): boolean => {
  if (item.matchPrefix) return currentPath.startsWith(item.matchPrefix);
  return currentPath === item.path;
};
