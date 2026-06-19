import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MascotasPage } from './MascotasPage';
import {
  actualizarMascota,
  crearMascota,
  eliminarMascota,
  listarMascotas,
} from '../api/mascotas';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';
import type { MascotaResponse } from '../api/types';

vi.mock('../api/mascotas', () => ({
  actualizarMascota: vi.fn(),
  crearMascota: vi.fn(),
  listarMascotas: vi.fn(),
  eliminarMascota: vi.fn(),
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../components/Toast', () => ({
  useToast: vi.fn(),
}));

const listarMascotasMock = vi.mocked(listarMascotas);
const eliminarMascotaMock = vi.mocked(eliminarMascota);
const crearMascotaMock = vi.mocked(crearMascota);
const actualizarMascotaMock = vi.mocked(actualizarMascota);
const useAuthMock = vi.mocked(useAuth);
const useToastMock = vi.mocked(useToast);

const mascotas: MascotaResponse[] = [
  {
    id: 'pet-1',
    name: 'Toby',
    status: 'LOST',
    species: 'Perro',
    color: 'Café',
    size: 12,
    foundLocation: null,
    lostLocation: 'Ñuñoa',
    description: 'Usa collar azul',
    ownerId: null,
    createdAt: '2026-06-17T12:00:00',
  },
];

describe('MascotasPage', () => {
  const notifySuccess = vi.fn();
  const notifyError = vi.fn();

  beforeEach(() => {
    listarMascotasMock.mockReset();
    eliminarMascotaMock.mockReset();
    crearMascotaMock.mockReset();
    actualizarMascotaMock.mockReset();
    notifySuccess.mockReset();
    notifyError.mockReset();
    vi.restoreAllMocks();
    useAuthMock.mockReturnValue({
      token: 'user-token',
      role: 'ADMIN',
      userEmail: 'admin@sanosysalvos.cl',
      userName: 'Admin',
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    useToastMock.mockReturnValue({ notifySuccess, notifyError });
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <MascotasPage />
      </MemoryRouter>,
    );
  }

  it('carga mascotas, filtra por estado y elimina una mascota', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    listarMascotasMock.mockResolvedValue(mascotas);
    eliminarMascotaMock.mockResolvedValueOnce();

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Toby')).toBeInTheDocument();
    });
    expect(listarMascotasMock).toHaveBeenCalledWith(undefined);

    await user.click(screen.getByRole('button', { name: 'Perdidas' }));
    await waitFor(() => {
      expect(listarMascotasMock).toHaveBeenLastCalledWith({ status: 'LOST' });
    });

    await user.click(screen.getByRole('button', { name: 'Eliminar Toby' }));
    expect(eliminarMascotaMock).toHaveBeenCalledWith('pet-1');
    expect(notifySuccess).toHaveBeenCalledWith('Mascota eliminada.');

    await waitFor(() => {
      expect(screen.getByText('Sin mascotas registradas')).toBeInTheDocument();
    });
  });

  it('muestra error de carga y notifica error al eliminar', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    listarMascotasMock
      .mockRejectedValueOnce(new Error('Fallo mascotas'))
      .mockResolvedValueOnce(mascotas);
    eliminarMascotaMock.mockRejectedValueOnce(new Error('No eliminado'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Fallo mascotas')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => {
      expect(screen.getByText('Toby')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Eliminar Toby' }));
    expect(notifyError).toHaveBeenCalledWith('No eliminado');
  });

  it('crea y actualiza mascotas desde el formulario', async () => {
    const user = userEvent.setup();
    listarMascotasMock.mockResolvedValueOnce(mascotas);
    crearMascotaMock.mockResolvedValueOnce({
      ...mascotas[0],
      id: 'pet-2',
      name: 'Luna',
      status: 'FOUND',
      species: 'Gato',
      color: 'Blanco',
      size: 4,
      description: 'Muy dócil',
    });
    actualizarMascotaMock.mockResolvedValueOnce({
      ...mascotas[0],
      name: 'Toby actualizado',
      status: 'AT_HOME',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Toby')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'Luna');
    await user.selectOptions(screen.getByLabelText('Estado'), 'FOUND');
    await user.type(screen.getByLabelText('Especie'), 'Gato');
    await user.type(screen.getByLabelText('Color'), 'Blanco');
    await user.type(screen.getByLabelText('Tamaño'), '4');
    await user.type(screen.getByLabelText('Descripción'), 'Muy dócil');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(crearMascotaMock).toHaveBeenCalledWith({
      name: 'Luna',
      status: 'FOUND',
      species: 'Gato',
      color: 'Blanco',
      size: 4,
      foundLocation: null,
      lostLocation: null,
      description: 'Muy dócil',
      ownerId: null,
    });
    expect(notifySuccess).toHaveBeenCalledWith('Mascota registrada.');
    expect(await screen.findByText('Luna')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'Toby actualizado');
    await user.selectOptions(screen.getByLabelText('Estado'), 'AT_HOME');
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(actualizarMascotaMock).toHaveBeenCalledWith('pet-2', {
      name: 'Toby actualizado',
      status: 'AT_HOME',
      species: 'Gato',
      color: 'Blanco',
      size: 4,
      foundLocation: null,
      lostLocation: null,
      description: 'Muy dócil',
      ownerId: null,
    });
    expect(notifySuccess).toHaveBeenCalledWith('Mascota actualizada.');
    expect(await screen.findByText('Toby actualizado')).toBeInTheDocument();
  });

  it('no carga mascotas sin sesión', async () => {
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
    listarMascotasMock.mockResolvedValueOnce(mascotas);

    renderPage();

    expect(screen.getByText('Inicia sesión para gestionar mascotas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acceder' })).toHaveAttribute('href', '/acceso');
    expect(listarMascotasMock).not.toHaveBeenCalled();
  });
});
