import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { createJwt } from '../test/jwt';

const TOKEN_KEY = 'sanosysalvos_token';

function AuthProbe({ loginToken }: { loginToken?: string }) {
  const auth = useAuth();

  return (
    <div>
      <span data-testid="token">{auth.token ?? 'none'}</span>
      <span data-testid="role">{auth.role ?? 'none'}</span>
      <span data-testid="email">{auth.userEmail ?? 'none'}</span>
      <span data-testid="name">{auth.userName ?? 'none'}</span>
      <span data-testid="is-admin">{String(auth.isAdmin)}</span>
      <span data-testid="is-authenticated">{String(auth.isAuthenticated)}</span>
      <button type="button" onClick={() => loginToken && auth.login(loginToken)}>
        Login
      </button>
      <button type="button" onClick={auth.logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('lee un token válido desde localStorage y normaliza ROL_ADMIN', () => {
    const token = createJwt({
      sub: 'admin@sanosysalvos.cl',
      name: 'Administrador',
      roles: ['ROL_ADMIN'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    window.localStorage.setItem(TOKEN_KEY, token);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('token')).toHaveTextContent(token);
    expect(screen.getByTestId('role')).toHaveTextContent('ADMIN');
    expect(screen.getByTestId('email')).toHaveTextContent('admin@sanosysalvos.cl');
    expect(screen.getByTestId('name')).toHaveTextContent('Administrador');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('elimina tokens vencidos al inicializar', () => {
    const expiredToken = createJwt({
      sub: 'admin@sanosysalvos.cl',
      roles: ['ROL_ADMIN'],
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    window.localStorage.setItem(TOKEN_KEY, expiredToken);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(screen.getByTestId('token')).toHaveTextContent('none');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('sincroniza login y logout con localStorage', async () => {
    const user = userEvent.setup();
    const token = createJwt({
      email: 'usuario@sanosysalvos.cl',
      rol: 'ROL_USER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    render(
      <AuthProvider>
        <AuthProbe loginToken={token} />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(window.localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(screen.getByTestId('email')).toHaveTextContent('usuario@sanosysalvos.cl');
    expect(screen.getByTestId('role')).toHaveTextContent('USER');

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(screen.getByTestId('token')).toHaveTextContent('none');
  });
});
