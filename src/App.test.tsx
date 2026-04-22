import { render, screen } from '@testing-library/react';

import App from './App';

test('renders the login page when no session is persisted', async () => {
  render(<App />);
  expect(await screen.findByTestId('login-page')).toBeInTheDocument();
});
