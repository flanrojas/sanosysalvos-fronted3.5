import { apiClient } from './client';
import type { MascotaRequest, MascotaResponse } from './types';

const BASE = '/bff/ms-mascotas/pets';

export async function listarMascotas(
  filtros?: { ownerId?: string; status?: string },
): Promise<MascotaResponse[]> {
  const params: Record<string, string> = {};
  if (filtros?.ownerId) params.ownerId = filtros.ownerId;
  if (filtros?.status) params.status = filtros.status;
  const { data } = await apiClient.get<MascotaResponse[]>(BASE, { params });
  return data;
}

export async function obtenerMascota(id: string): Promise<MascotaResponse> {
  const { data } = await apiClient.get<MascotaResponse>(`${BASE}/${id}`);
  return data;
}

export async function crearMascota(payload: MascotaRequest): Promise<MascotaResponse> {
  const { data } = await apiClient.post<MascotaResponse>(BASE, payload);
  return data;
}

export async function actualizarMascota(
  id: string,
  payload: MascotaRequest,
): Promise<MascotaResponse> {
  const { data } = await apiClient.put<MascotaResponse>(`${BASE}/${id}`, payload);
  return data;
}

export async function modificarMascotaParcial(
  id: string,
  payload: Partial<MascotaRequest>,
): Promise<MascotaResponse> {
  const { data } = await apiClient.patch<MascotaResponse>(`${BASE}/${id}`, payload);
  return data;
}

export async function eliminarMascota(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
