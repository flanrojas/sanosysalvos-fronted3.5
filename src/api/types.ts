// Tipos que reflejan los DTOs expuestos por el BFF.

export type TipoPublicacion = 'PERDIDO' | 'ENCONTRADO';
export type EstadoPublicacion = 'ACTIVA' | 'RESUELTA' | 'CERRADA';
export type EstadoMascota = 'LOST' | 'SEARCHING' | 'FOUND' | 'AT_HOME';

export interface PublicacionResponse {
  idPublicacion: string;
  tipoPublicacion: string;
  titulo: string;
  descripcion: string;
  fechaPublicacion: string;
  fechaExtravioOEncuentro: string;
  estado: string;
  latitud: number | null;
  longitud: number | null;
  direccionReferencia: string | null;
  urlFoto: string | null;
  nombreContacto: string | null;
  telefonoContacto: string | null;
  emailContacto: string | null;
  mascotaId: string | null;
  usuarioId: string | null;
}

export interface PublicacionRequest {
  tipoPublicacion: string;
  titulo: string;
  descripcion: string;
  fechaExtravioOEncuentro: string;
  estado: string;
  latitud: number | null;
  longitud: number | null;
  direccionReferencia: string;
  urlFoto: string;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  mascotaId: string | null;
  usuarioId: string | null;
}

export interface MascotaResponse {
  id: string;
  name: string | null;
  status: string;
  species: string;
  color: string;
  size: number | null;
  foundLocation: string | null;
  lostLocation: string | null;
  description: string | null;
  ownerId: string | null;
  createdAt?: string | null;
}

export interface MascotaRequest {
  name: string;
  status: string;
  species: string;
  color: string;
  size: number | null;
  foundLocation: string | null;
  lostLocation: string | null;
  description: string | null;
  ownerId: string | null;
}

export interface PublicacionDetalladaResponse {
  publicacion: PublicacionResponse;
  mascota: MascotaResponse | null;
}

export interface ReporteCompletoRequest {
  titulo: string;
  nombre: string;
  tipo: string;
  tipoPublicacion?: string;
  especie?: string;
  color: string;
  tamaño: number | null;
  estado: string;
  ubicacion: string;
  fecha: string;
  descripcion: string;
  nombreContacto: string;
  telefonoContacto: string;
  usuarioId: string | null;
  latitud: number | null;
  longitud: number | null;
}

export interface ReporteCompletoResponse {
  mensaje: string;
  mascota: MascotaResponse;
  publicacion: PublicacionResponse;
}

export interface DistanceRequest {
  origin_latitude: number;
  origin_longitude: number;
  target_latitude: number;
  target_longitude: number;
}

export interface DistanceResponse {
  distance_meters: number;
}

export interface RadiusRequest {
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface PetDistanceItem {
  pet_id: string;
  distance_meters: number;
}

export interface RadiusResponse {
  pets: PetDistanceItem[];
}

export interface LocationCreateRequest {
  pet_id: string;
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  pet_id: string;
  latitude: number;
  longitude: number;
}

export interface MessageResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  email: string;
  password: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface TokenResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface UserProfileResponse {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  nombre?: string;
  address?: string;
  phone?: string;
  telefono?: string;
  rol?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PasswordChangeRequest {
  currentPassword?: string;
  newPassword: string;
}
