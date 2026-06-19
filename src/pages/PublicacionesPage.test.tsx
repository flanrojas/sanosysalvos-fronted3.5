import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicacionesPage } from './PublicacionesPage';
import { listarPublicaciones } from '../api/publicaciones';
import type { PublicacionResponse } from '../api/types';

vi.mock('../api/publicaciones', () => ({
  listarPublicaciones: vi.fn(),
}));

vi.mock('../components/PublicacionesMap', () => ({
  PublicacionesMap: ({ publicaciones }: { publicaciones: PublicacionResponse[] }) => (
    <div data-testid="publicaciones-map">Mapa con {publicaciones.length} publicaciones</div>
  ),
}));

const listarPublicacionesMock = vi.mocked(listarPublicaciones);

const publicaciones: PublicacionResponse[] = [
  {
    idPublicacion: 'pub-1',
    tipoPublicacion: 'PERDIDA',
    titulo: 'Max perdido',
    descripcion: 'Perro negro cerca del parque',
    fechaPublicacion: '2026-06-17T12:00:00',
    fechaExtravioOEncuentro: '2026-06-16',
    estado: 'ACTIVA',
    latitud: -33.44,
    longitud: -70.66,
    direccionReferencia: 'Parque Forestal',
    urlFoto: null,
    nombreContacto: 'Mario',
    telefonoContacto: '123',
    emailContacto: 'mario@test.cl',
    mascotaId: null,
    usuarioId: null,
  },
  {
    idPublicacion: 'pub-2',
    tipoPublicacion: 'ENCONTRADA',
    titulo: 'Gatita encontrada',
    descripcion: 'Gata blanca',
    fechaPublicacion: '2026-06-17T12:00:00',
    fechaExtravioOEncuentro: '2026-06-16',
    estado: 'CERRADA',
    latitud: -33.45,
    longitud: -70.67,
    direccionReferencia: 'Providencia',
    urlFoto: null,
    nombreContacto: 'Ana',
    telefonoContacto: '456',
    emailContacto: 'ana@test.cl',
    mascotaId: null,
    usuarioId: null,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <PublicacionesPage />
    </MemoryRouter>,
  );
}

describe('PublicacionesPage', () => {
  beforeEach(() => {
    listarPublicacionesMock.mockReset();
  });

  it('carga publicaciones y permite filtrar/buscar', async () => {
    const user = userEvent.setup();
    listarPublicacionesMock.mockResolvedValueOnce(publicaciones);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Max perdido')).toBeInTheDocument();
    });
    expect(screen.getByText('Gatita encontrada')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Perdidas' }));
    expect(screen.getByText('Max perdido')).toBeInTheDocument();
    expect(screen.queryByText('Gatita encontrada')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Todas' }));
    await user.type(screen.getByPlaceholderText(/Buscar por nombre/), 'providencia');

    expect(screen.queryByText('Max perdido')).not.toBeInTheDocument();
    expect(screen.getByText('Gatita encontrada')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mapa' }));
    expect(screen.getByTestId('publicaciones-map')).toHaveTextContent('Mapa con 1 publicaciones');
  });

  it('muestra estado vacío al filtrar sin resultados', async () => {
    const user = userEvent.setup();
    listarPublicacionesMock.mockResolvedValueOnce([publicaciones[0]]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Max perdido')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Encontradas' }));
    expect(screen.getByText('No hay publicaciones que coincidan')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    listarPublicacionesMock.mockRejectedValueOnce(new Error('Sin conexión'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
