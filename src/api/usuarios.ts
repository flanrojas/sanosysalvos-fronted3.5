import { apiClient } from './client';
import type { PasswordChangeRequest, UserProfileResponse } from './types';

const BASE = '/bff/usuarios';

type UsuariosHalResponse = {
  _embedded?: {
    usuarioList?: UserProfileResponse[];
    usuarios?: UserProfileResponse[];
  };
};

function normalizeUsuariosResponse(data: UserProfileResponse[] | UsuariosHalResponse): UserProfileResponse[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data._embedded?.usuarioList ?? data._embedded?.usuarios ?? [];
}

export async function listarUsuarios(): Promise<UserProfileResponse[]> {
  const { data } = await apiClient.get<UserProfileResponse[] | UsuariosHalResponse>(BASE);
  return normalizeUsuariosResponse(data);
}

export async function obtenerUsuario(username: string): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<UserProfileResponse>(`${BASE}/${username}`);
  return data;
}

export async function obtenerMiPerfil(): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<UserProfileResponse>(`${BASE}/me`);
  return data;
}

export async function actualizarPerfil(
  username: string,
  payload: UserProfileResponse,
): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>(`${BASE}/${username}`, payload);
  return data;
}

export async function cambiarMiPassword(payload: PasswordChangeRequest): Promise<string> {
  const { data } = await apiClient.put<string>(`${BASE}/me/password`, payload);
  return data;
}

export async function resetearPasswordAdmin(
  username: string,
  payload: PasswordChangeRequest,
): Promise<string> {
  const { data } = await apiClient.put<string>(
    `${BASE}/${username}/admin-password`,
    payload,
  );
  return data;
}

export async function desactivarMiCuenta(): Promise<void> {
  await apiClient.delete(`${BASE}/me`);
}

export async function eliminarUsuario(username: string): Promise<void> {
  await apiClient.delete(`${BASE}/admin/force-delete/${username}`);
}
