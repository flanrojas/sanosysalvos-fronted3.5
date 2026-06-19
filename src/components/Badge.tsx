import './Badge.css';
import { normalizarTipoPublicacion } from '../utils/format';

type Tone = 'lost' | 'found' | 'resolved' | 'neutral';

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ tone = 'neutral', children, dot = true }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

/** Mapea el tipo de publicación / estado de mascota a un tono visual. */
export function toneForTipo(tipo: string): Tone {
  const normalized = normalizarTipoPublicacion(tipo);
  if (normalized === 'PERDIDO') return 'lost';
  if (normalized === 'ENCONTRADO') return 'found';
  return 'neutral';
}

export function toneForEstado(estado: string): Tone {
  const normalized = estado?.toUpperCase();
  if (normalized === 'RESUELTA' || normalized === 'CERRADA' || normalized === 'SAFE') {
    return 'resolved';
  }
  return 'neutral';
}
