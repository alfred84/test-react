import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from '@app/AppProviders';
import { FeedbackProvider } from '@presentation/providers/feedback/FeedbackProvider';
import { AppRouter } from '@presentation/routing/AppRouter';
import { AppThemeProvider } from '@presentation/theme/AppThemeProvider';

function App(): JSX.Element {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <AppProviders>
          <FeedbackProvider>
            <AppRouter />
          </FeedbackProvider>
        </AppProviders>
      </BrowserRouter>
    </AppThemeProvider>
  );
}

export default App;
