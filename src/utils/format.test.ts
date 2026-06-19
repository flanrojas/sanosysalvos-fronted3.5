import { describe, expect, it } from 'vitest';
import {
  formatDistancia,
  formatFecha,
  formatFechaCorta,
  iniciales,
  normalizarTipoPublicacion,
  tituloEstado,
  tituloTipo,
} from './format';

describe('format utils', () => {
  it('formatea fechas completas, cortas y valores inválidos', () => {
    expect(formatFecha(null)).toBe('Fecha no disponible');
    expect(formatFecha('sin-fecha')).toBe('sin-fecha');
    expect(formatFecha('2026-06-17')).toContain('2026');

    expect(formatFechaCorta(undefined)).toBe('—');
    expect(formatFechaCorta('sin-fecha')).toBe('sin-fecha');
    expect(formatFechaCorta('2026-06-17')).toContain('2026');
  });

  it('formatea distancias en metros y kilómetros', () => {
    expect(formatDistancia(849.6)).toBe('850 m');
    expect(formatDistancia(2144.59)).toBe('2,14 km');
  });

  it('normaliza títulos de tipo y estado', () => {
    expect(normalizarTipoPublicacion('PERDIDA')).toBe('PERDIDO');
    expect(normalizarTipoPublicacion('ENCONTRADA')).toBe('ENCONTRADO');
    expect(normalizarTipoPublicacion('found')).toBe('ENCONTRADO');
    expect(normalizarTipoPublicacion('OTRO')).toBeNull();

    expect(tituloTipo('PERDIDO')).toBe('Perdido');
    expect(tituloTipo('PERDIDA')).toBe('Perdido');
    expect(tituloTipo('ENCONTRADA')).toBe('Encontrado');
    expect(tituloTipo('found')).toBe('Encontrado');
    expect(tituloTipo('OTRO')).toBe('OTRO');

    expect(tituloEstado('ACTIVA')).toBe('Activa');
    expect(tituloEstado('')).toBe('—');
  });

  it('genera iniciales legibles', () => {
    expect(iniciales(null)).toBe('·');
    expect(iniciales(' Administrador Sistema ')).toBe('AS');
    expect(iniciales('toby')).toBe('T');
  });
});
