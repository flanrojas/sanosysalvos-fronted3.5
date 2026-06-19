import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PublicacionCard } from './PublicacionCard';
import type { PublicacionResponse } from '../api/types';

const basePublicacion: PublicacionResponse = {
  idPublicacion: 'pub-1',
  tipoPublicacion: 'PERDIDO',
  titulo: 'Max perdido',
  descripcion: 'Perro mediano con collar rojo',
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
};

function renderCard(pub: PublicacionResponse) {
  return render(
    <MemoryRouter>
      <PublicacionCard pub={pub} />
    </MemoryRouter>,
  );
}

describe('PublicacionCard', () => {
  it('renderiza datos principales y enlace al detalle', () => {
    renderCard(basePublicacion);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/publicaciones/pub-1');
    expect(screen.getByText('Max perdido')).toBeInTheDocument();
    expect(screen.getByText('Perro mediano con collar rojo')).toBeInTheDocument();
    expect(screen.getByText('Parque Forestal')).toBeInTheDocument();
    expect(screen.getByText('Perdido')).toBeInTheDocument();
    expect(screen.queryByText('Resuelta')).not.toBeInTheDocument();
  });

  it('renderiza imagen y badge resuelta cuando corresponde', () => {
    renderCard({
      ...basePublicacion,
      tipoPublicacion: 'ENCONTRADO',
      estado: 'CERRADA',
      urlFoto: 'https://example.com/max.jpg',
      direccionReferencia: null,
    });

    expect(screen.getByRole('img', { name: 'Max perdido' })).toHaveAttribute(
      'src',
      'https://example.com/max.jpg',
    );
    expect(screen.getByText('Encontrado')).toBeInTheDocument();
    expect(screen.getByText('Resuelta')).toBeInTheDocument();
    expect(screen.getByText('Ubicación no especificada')).toBeInTheDocument();
  });
});
