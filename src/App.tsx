import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from '@app/AppProviders';
import { AppRouter } from '@presentation/routing/AppRouter';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
