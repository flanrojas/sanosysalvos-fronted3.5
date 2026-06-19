import { Link } from 'react-router-dom';
import type { PublicacionResponse } from '../api/types';
import { Badge, toneForTipo } from './Badge';
import { MapPinIcon, PawIcon } from './icons';
import { formatFechaCorta, tituloTipo } from '../utils/format';
import './PublicacionCard.css';

export function PublicacionCard({ pub }: { pub: PublicacionResponse }) {
  const resuelta = pub.estado?.toUpperCase() !== 'ACTIVA';
  const ubicacion = pub.direccionReferencia ?? 'Ubicación no especificada';

  return (
    <Link to={`/publicaciones/${pub.idPublicacion}`} className="pub-card">
      <div className="pub-card__media">
        {pub.urlFoto ? (
          <img src={pub.urlFoto} alt={pub.titulo} loading="lazy" />
        ) : (
          <div className="pub-card__placeholder">
            <PawIcon size={48} />
          </div>
        )}
        <div className="pub-card__badges">
          <Badge tone={toneForTipo(pub.tipoPublicacion)}>
            {tituloTipo(pub.tipoPublicacion)}
          </Badge>
          {resuelta && <Badge tone="resolved">Resuelta</Badge>}
        </div>
      </div>

      <div className="pub-card__body">
        <h3 className="pub-card__title">{pub.titulo}</h3>
        {pub.descripcion && <p className="pub-card__desc">{pub.descripcion}</p>}
        <div className="pub-card__meta">
          <MapPinIcon size={15} />
          <span className="pub-card__meta-text">{ubicacion}</span>
          <span aria-hidden>·</span>
          <span>{formatFechaCorta(pub.fechaPublicacion)}</span>
        </div>
      </div>
    </Link>
  );
}
