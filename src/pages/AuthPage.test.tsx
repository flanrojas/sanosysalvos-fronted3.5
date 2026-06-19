import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthPage } from './AuthPage';
import { ingresar, registrar } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';

vi.mock('../api/auth', async () => {
  const actual = await vi.importActual<typeof import('../api/auth')>('../api/auth');
  return {
    ...actual,
    ingresar: vi.fn(),
    registrar: vi.fn(),
  };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../components/Toast', () => ({
  useToast: vi.fn(),
}));

const ingresarMock = vi.mocked(ingresar);
const registrarMock = vi.mocked(registrar);
const useAuthMock = vi.mocked(useAuth);
const useToastMock = vi.mocked(useToast);

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/acceso']}>
      <Routes>
        <Route
          path="/acceso"
          element={
            <>
              <AuthPage />
              <LocationProbe />
            </>
          }
        />
        <Route path="/usuarios" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthPage', () => {
  const startSession = vi.fn();
  const notifySuccess = vi.fn();
  const notifyError = vi.fn();

  beforeEach(() => {
    startSession.mockReset();
    notifySuccess.mockReset();
    notifyError.mockReset();
    ingresarMock.mockReset();
    registrarMock.mockReset();
    useAuthMock.mockReturnValue({
      token: null,
      role: null,
      userEmail: null,
      userName: null,
      isAuthenticated: false,
      isAdmin: false,
      login: startSession,
      logout: vi.fn(),
    });
    useToastMock.mockReturnValue({ notifySuccess, notifyError });
  });

  it('inicia sesión, guarda token y navega a usuarios', async () => {
    const user = userEvent.setup();
    ingresarMock.mockResolvedValueOnce({ jwt: 'jwt-token' });

    renderPage();

    await user.type(screen.getByLabelText('Correo'), 'admin@sanosysalvos.cl');
    await user.type(screen.getByLabelText('Contraseña'), 'admin123*');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(startSession).toHaveBeenCalledWith('jwt-token');
    });
    expect(ingresarMock).toHaveBeenCalledWith({
      email: 'admin@sanosysalvos.cl',
      password: 'admin123*',
    });
    expect(notifySuccess).toHaveBeenCalledWith('Sesión iniciada.');
    expect(screen.getByTestId('location')).toHaveTextContent('/usuarios');
  });

  it('muestra error cuando el ingreso no retorna token', async () => {
    const user = userEvent.setup();
    ingresarMock.mockResolvedValueOnce({});

    renderPage();

    await user.type(screen.getByLabelText('Correo'), 'admin@sanosysalvos.cl');
    await user.type(screen.getByLabelText('Contraseña'), 'admin123*');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(notifyError).toHaveBeenCalledWith(
        'El servidor no devolvió un token de sesión.',
      );
    });
    expect(startSession).not.toHaveBeenCalled();
    expect(screen.getByText('El servidor no devolvió un token de sesión.')).toBeInTheDocument();
  });

  it('registra un usuario y vuelve al modo ingreso', async () => {
    const user = userEvent.setup();
    registrarMock.mockResolvedValueOnce({ ok: true });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Registro' }));
    await user.type(screen.getByLabelText('Nombre'), 'Usuario Normal');
    await user.type(screen.getByLabelText('Correo'), 'user@sanosysalvos.cl');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.type(screen.getByLabelText('Dirección'), 'Santiago');
    await user.type(screen.getByLabelText('Teléfono'), '123456789');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith(
        'Usuario registrado. Ahora puedes iniciar sesión.',
      );
    });
    expect(registrarMock).toHaveBeenCalledWith({
      email: 'user@sanosysalvos.cl',
      password: 'secret123',
      name: 'Usuario Normal',
      address: 'Santiago',
      phone: '123456789',
    });
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveValue('user@sanosysalvos.cl');
  });
});
