/**
 * Single source of truth for every route pattern used by react-router.
 * Patterns use the `:param` syntax so they can be fed to <Route path=...>.
 *
 * For building concrete URLs (e.g. when navigating to a specific client)
 * always use the `buildPath` helpers — never string-template the pattern
 * at call sites.
 */
export const ROUTES = {
  login: '/login',
  register: '/register',
  home: '/',
  clients: {
    list: '/clients',
    create: '/clients/new',
    edit: '/clients/:id/edit',
  },
  notFound: '*',
} as const;

export const buildPath = {
  clientEdit: (id: string): string => `/clients/${encodeURIComponent(id)}/edit`,
} as const;

/**
 * Shape of the `location.state` we attach when redirecting an
 * unauthenticated user so the login page can send them back afterwards.
 */
export interface LocationState {
  readonly from?: {
    readonly pathname: string;
    readonly search: string;
  };
}
