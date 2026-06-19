import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuariosPage } from './UsuariosPage';
import { listarUsuarios } from '../api/usuarios';
import { useAuth } from '../auth/AuthContext';

vi.mock('../api/usuarios', () => ({
  listarUsuarios: vi.fn(),
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const listarUsuariosMock = vi.mocked(listarUsuarios);
const useAuthMock = vi.mocked(useAuth);

function renderPage() {
  return render(
    <MemoryRouter>
      <UsuariosPage />
    </MemoryRouter>,
  );
}

describe('UsuariosPage', () => {
  beforeEach(() => {
    listarUsuariosMock.mockReset();
    useAuthMock.mockReset();
  });

  it('pide iniciar sesión cuando no hay token', () => {
    useAuthMock.mockReturnValue({
      token: null,
      role: null,
      userEmail: null,
      userName: null,
      isAuthenticated: false,
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Necesitas iniciar sesión')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a acceso' })).toHaveAttribute(
      'href',
      '/acceso',
    );
    expect(listarUsuariosMock).not.toHaveBeenCalled();
  });

  it('bloquea usuarios no administradores sin llamar la API', () => {
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

    renderPage();

    expect(screen.getByText('Acceso solo para administradores')).toBeInTheDocument();
    expect(listarUsuariosMock).not.toHaveBeenCalled();
  });

  it('carga y muestra la lista de usuarios para administradores', async () => {
    useAuthMock.mockReturnValue({
      token: 'admin-token',
      role: 'ADMIN',
      userEmail: 'admin@sanosysalvos.cl',
      userName: 'Admin',
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    listarUsuariosMock.mockResolvedValueOnce([
      {
        email: 'admin@sanosysalvos.cl',
        name: 'Administrador Sistema',
        rol: 'ROL_ADMIN',
        activo: true,
      },
    ]);

    renderPage();

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Administrador Sistema')).toBeInTheDocument();
    });
    expect(screen.getByText('admin@sanosysalvos.cl')).toBeInTheDocument();
    expect(screen.getByText('ROL_ADMIN')).toBeInTheDocument();
    expect(listarUsuariosMock).toHaveBeenCalledTimes(1);
  });
});
