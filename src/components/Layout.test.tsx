import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Layout } from './Layout';
import { useAuth } from '../auth/AuthContext';

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

function renderLayout() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div>Contenido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('oculta el enlace Usuarios cuando la sesión no es admin', () => {
    useAuthMock.mockReturnValue({
      token: 'user-token',
      role: 'USER',
      userEmail: 'user@sanosysalvos.cl',
      userName: 'Usuario',
      isAuthenticated: true,
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderLayout();

    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();
  });

  it('muestra Usuarios para admin y permite cerrar sesión desde el avatar', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    useAuthMock.mockReturnValue({
      token: 'admin-token',
      role: 'ADMIN',
      userEmail: 'admin@sanosysalvos.cl',
      userName: 'Admin',
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout,
    });

    renderLayout();

    expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
      'href',
      '/usuarios',
    );

    await user.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }));

    expect(screen.getByText('admin@sanosysalvos.cl')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
