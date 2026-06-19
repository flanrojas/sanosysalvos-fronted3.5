import { apiClient } from './client';
import type { LoginRequest, RegistroRequest, TokenResponse } from './types';

const BASE = '/bff/auth';

export function extractToken(response: TokenResponse): string | null {
  return response.token ?? response.accessToken ?? response.jwt ?? null;
}

export async function ingresar(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(`${BASE}/ingreso`, payload);
  return data;
}

export async function registrar(payload: RegistroRequest): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(`${BASE}/registro`, payload);
  return data;
}
