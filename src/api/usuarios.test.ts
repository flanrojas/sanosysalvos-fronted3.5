import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listarUsuarios } from './usuarios';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const getMock = vi.mocked(apiClient.get);

describe('listarUsuarios', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('devuelve usuarios cuando el BFF responde un array plano', async () => {
    getMock.mockResolvedValueOnce({
      data: [{ email: 'admin@sanosysalvos.cl', name: 'Admin' }],
    });

    await expect(listarUsuarios()).resolves.toEqual([
      { email: 'admin@sanosysalvos.cl', name: 'Admin' },
    ]);
    expect(getMock).toHaveBeenCalledWith('/bff/usuarios');
  });

  it('normaliza respuestas HAL con _embedded.usuarioList', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        _embedded: {
          usuarioList: [{ email: 'user@sanosysalvos.cl', name: 'Usuario' }],
        },
      },
    });

    await expect(listarUsuarios()).resolves.toEqual([
      { email: 'user@sanosysalvos.cl', name: 'Usuario' },
    ]);
  });

  it('retorna una lista vacía cuando la respuesta no trae usuarios', async () => {
    getMock.mockResolvedValueOnce({ data: { _embedded: {} } });

    await expect(listarUsuarios()).resolves.toEqual([]);
  });
});
