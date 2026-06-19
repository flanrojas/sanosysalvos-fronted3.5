import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PublicacionesMap } from './PublicacionesMap';
import type { PublicacionResponse } from '../api/types';
import type { ReactNode } from 'react';

const setView = vi.fn();
const fitBounds = vi.fn();

vi.mock('leaflet', () => ({
  DivIcon: class {
    options: unknown;

    constructor(options: unknown) {
      this.options = options;
    }
  },
  LatLngBounds: class {
    points: unknown;

    constructor(points: unknown) {
      this.points = points;
    }
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  Marker: ({
    children,
    position,
  }: {
    children: ReactNode;
    position: [number, number];
  }) => (
    <div data-testid="map-marker" data-position={position.join(',')}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => (
    <div data-testid="map-popup">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  useMap: () => ({ setView, fitBounds }),
}));

const publicaciones: PublicacionResponse[] = [
  {
    idPublicacion: 'pub-1',
    tipoPublicacion: 'PERDIDO',
    titulo: 'Max perdido',
    descripcion: 'Perro negro',
    fechaPublicacion: '2026-06-17T12:00:00',
    fechaExtravioOEncuentro: '2026-06-16',
    estado: 'ACTIVA',
    latitud: -33.4489,
    longitud: -70.6693,
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
    tipoPublicacion: 'ENCONTRADO',
    titulo: 'Gatita encontrada',
    descripcion: 'Gata blanca',
    fechaPublicacion: '2026-06-17T12:00:00',
    fechaExtravioOEncuentro: '2026-06-16',
    estado: 'ACTIVA',
    latitud: -33.4569,
    longitud: -70.6483,
    direccionReferencia: null,
    urlFoto: null,
    nombreContacto: 'Ana',
    telefonoContacto: '456',
    emailContacto: 'ana@test.cl',
    mascotaId: null,
    usuarioId: null,
  },
];

describe('PublicacionesMap', () => {
  it('renderiza markers y popups para publicaciones con coordenadas', () => {
    render(
      <MemoryRouter>
        <PublicacionesMap publicaciones={publicaciones} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    expect(screen.getAllByTestId('map-marker')).toHaveLength(2);
    expect(screen.getByText('Max perdido')).toBeInTheDocument();
    expect(screen.getByText('Gatita encontrada')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Ver detalle' })[0]).toHaveAttribute(
      'href',
      '/publicaciones/pub-1',
    );
  });

  it('ignora publicaciones sin coordenadas', () => {
    render(
      <MemoryRouter>
        <PublicacionesMap publicaciones={[{ ...publicaciones[0], latitud: null }]} />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });
});
