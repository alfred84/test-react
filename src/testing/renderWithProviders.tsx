import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import { AppProviders } from '@app/AppProviders';
import type { ITokenStorage } from '@infrastructure/storage/TokenStorage';
import { FeedbackProvider } from '@presentation/providers/feedback/FeedbackProvider';
import type { Repositories } from '@presentation/providers/repositories/RepositoriesContext';
import { AppThemeProvider } from '@presentation/theme/AppThemeProvider';

import { InMemoryTokenStorage } from './inMemoryStorage';

export interface RenderWithProvidersOptions {
  readonly initialEntries?: string[];
  readonly repositoriesOverride?: Repositories;
  readonly tokenStorage?: ITokenStorage;
  /**
   * Optional route pattern to mount the UI under. Defaults to "*", so the
   * passed element is always rendered regardless of the current URL.
   */
  readonly routePattern?: string;
}

export interface RenderWithProvidersResult extends RenderResult {
  readonly tokenStorage: ITokenStorage;
}

/**
 * Renders the given element wrapped in the same provider stack as the
 * real app (Router → Providers → Theme → Feedback). Accepts fine-grained
 * overrides so individual tests can inject mock repositories, seed the
 * router URL, or swap the token storage.
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderWithProvidersResult => {
  const tokenStorage = options.tokenStorage ?? new InMemoryTokenStorage();
  const routePattern = options.routePattern ?? '*';

  const utils = render(
    <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>
      <AppProviders
        tokenStorage={tokenStorage}
        {...(options.repositoriesOverride
          ? { repositoriesOverride: options.repositoriesOverride }
          : {})}
      >
        <AppThemeProvider>
          <FeedbackProvider>
            <Switch>
              <Route path={routePattern}>{ui}</Route>
            </Switch>
          </FeedbackProvider>
        </AppThemeProvider>
      </AppProviders>
    </MemoryRouter>,
  );

  return { ...utils, tokenStorage };
};
