import { apiClient } from './client';
import type {
  DistanceRequest,
  DistanceResponse,
  LocationCreateRequest,
  LocationResponse,
  MessageResponse,
  RadiusRequest,
  RadiusResponse,
} from './types';

const BASE = '/bff/geolocalizacion';

export async function calcularDistancia(
  payload: DistanceRequest,
): Promise<DistanceResponse> {
  const { data } = await apiClient.post<DistanceResponse>(`${BASE}/distance`, payload);
  return data;
}

export async function buscarEnRadio(payload: RadiusRequest): Promise<RadiusResponse> {
  const { data } = await apiClient.post<RadiusResponse>(`${BASE}/radius`, payload);
  return data;
}

export async function guardarUbicacion(
  payload: LocationCreateRequest,
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(`${BASE}/locations`, payload);
  return data;
}

export async function obtenerUbicacion(petId: string): Promise<LocationResponse> {
  const { data } = await apiClient.get<LocationResponse>(`${BASE}/locations/${petId}`);
  return data;
}

export async function eliminarUbicacion(petId: string): Promise<void> {
  await apiClient.delete(`${BASE}/locations/${petId}`);
}
