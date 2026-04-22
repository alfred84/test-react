import { render, screen } from '@testing-library/react';

import App from './App';

test('renders the login form when no session is persisted', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
});
