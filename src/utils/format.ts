/** Utilidades de formato compartidas. */

export function formatFecha(value: string | null | undefined): string {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatFechaCorta(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDistancia(metros: number): string {
  if (metros < 1000) {
    return `${Math.round(metros)} m`;
  }
  return `${(metros / 1000).toLocaleString('es-ES', { maximumFractionDigits: 2 })} km`;
}

export function normalizarTipoPublicacion(tipo: string | null | undefined): 'PERDIDO' | 'ENCONTRADO' | null {
  const normalized = tipo?.toUpperCase();
  if (normalized === 'PERDIDO' || normalized === 'PERDIDA' || normalized === 'LOST') {
    return 'PERDIDO';
  }
  if (normalized === 'ENCONTRADO' || normalized === 'ENCONTRADA' || normalized === 'FOUND') {
    return 'ENCONTRADO';
  }
  return null;
}

export function tituloTipo(tipo: string): string {
  const normalized = normalizarTipoPublicacion(tipo);
  if (normalized === 'PERDIDO') return 'Perdido';
  if (normalized === 'ENCONTRADO') return 'Encontrado';
  return tipo ?? '—';
}

export function tituloEstado(estado: string): string {
  if (!estado) return '—';
  const lower = estado.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function iniciales(nombre: string | null | undefined): string {
  if (!nombre) return '·';
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}
