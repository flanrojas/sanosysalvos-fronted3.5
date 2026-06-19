import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerPublicacionDetallada } from '../api/orquestador';
import { eliminarPublicacion } from '../api/publicaciones';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { PublicacionDetalladaResponse } from '../api/types';
import { Badge, toneForTipo } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState, ErrorState } from '../components/States';
import { useToast } from '../components/Toast';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  PawIcon,
  PhoneIcon,
  RulerIcon,
  TrashIcon,
} from '../components/icons';
import { formatFecha, tituloTipo, tituloEstado } from '../utils/format';
import './DetallePage.css';

export function DetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useToast();

  const [data, setData] = useState<PublicacionDetalladaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!id) return;
    let activo = true;
    setLoading(true);
    setError(null);
    obtenerPublicacionDetallada(id)
      .then((res) => {
        if (activo) setData(res);
      })
      .catch((err) => {
        if (activo) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    if (!isAdmin) {
      notifyError('Solo un administrador puede eliminar publicaciones.');
      return;
    }
    setDeleting(true);
    try {
      await eliminarPublicacion(id);
      notifySuccess('Publicación eliminada correctamente.');
      navigate('/publicaciones');
    } catch (err) {
      notifyError(getErrorMessage(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <LoadingState text="Cargando publicación…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container page">
        <ErrorState
          text={error ?? 'No se encontró la publicación.'}
          action={
            <Link to="/publicaciones" className="btn btn--ghost">
              Volver a publicaciones
            </Link>
          }
        />
      </div>
    );
  }

  const { publicacion: pub, mascota } = data;
  const resuelta = pub.estado?.toUpperCase() !== 'ACTIVA';

  return (
    <div className="container page">
      <Link to="/publicaciones" className="back-link">
        <ArrowLeftIcon size={17} />
        Todas las publicaciones
      </Link>

      <div className="detalle">
        <div className="detalle__media">
          {pub.urlFoto ? (
            <img src={pub.urlFoto} alt={pub.titulo} />
          ) : (
            <div className="detalle__media-empty">
              <PawIcon size={72} />
            </div>
          )}
        </div>

        <div>
          <div className="detalle__badges">
            <Badge tone={toneForTipo(pub.tipoPublicacion)}>
              {tituloTipo(pub.tipoPublicacion)}
            </Badge>
            <Badge tone={resuelta ? 'resolved' : 'neutral'}>
              {tituloEstado(pub.estado)}
            </Badge>
          </div>

          <h1 className="detalle__title">{pub.titulo}</h1>
          {pub.descripcion && <p className="detalle__desc">{pub.descripcion}</p>}

          <div className="detalle__facts">
            <Fact
              icon={<MapPinIcon size={18} />}
              label="Ubicación"
              value={pub.direccionReferencia ?? 'No especificada'}
            />
            <Fact
              icon={<CalendarIcon size={18} />}
              label="Fecha del evento"
              value={pub.fechaExtravioOEncuentro || formatFecha(pub.fechaPublicacion)}
            />
            {mascota?.species && (
              <Fact icon={<PawIcon size={18} />} label="Especie" value={mascota.species} />
            )}
            {mascota?.size != null && (
              <Fact
                icon={<RulerIcon size={18} />}
                label="Tamaño"
                value={`${mascota.size}`}
              />
            )}
          </div>

          {(pub.nombreContacto || pub.telefonoContacto || pub.emailContacto) && (
            <div className="panel">
              <p className="panel__title">Contacto</p>
              {pub.nombreContacto && (
                <div className="contact-row">
                  <span className="contact-row__icon">
                    <PawIcon size={18} />
                  </span>
                  <div>
                    <div className="contact-row__label">Responsable</div>
                    <div className="contact-row__value">{pub.nombreContacto}</div>
                  </div>
                </div>
              )}
              {pub.telefonoContacto && (
                <a className="contact-row" href={`tel:${pub.telefonoContacto}`}>
                  <span className="contact-row__icon">
                    <PhoneIcon size={18} />
                  </span>
                  <div>
                    <div className="contact-row__label">Teléfono</div>
                    <div className="contact-row__value">{pub.telefonoContacto}</div>
                  </div>
                </a>
              )}
              {pub.emailContacto && (
                <a className="contact-row" href={`mailto:${pub.emailContacto}`}>
                  <span className="contact-row__icon">@</span>
                  <div>
                    <div className="contact-row__label">Correo</div>
                    <div className="contact-row__value">{pub.emailContacto}</div>
                  </div>
                </a>
              )}
            </div>
          )}

          {mascota && (
            <div className="panel">
              <p className="panel__title">Datos de la mascota</p>
              <PetLine k="Nombre" v={mascota.name || 'Sin nombre'} />
              {mascota.species && <PetLine k="Especie" v={mascota.species} />}
              {mascota.color && <PetLine k="Color" v={mascota.color} />}
              {mascota.status && <PetLine k="Estado" v={mascota.status} />}
              {mascota.lostLocation && (
                <PetLine k="Lugar de extravío" v={mascota.lostLocation} />
              )}
              {mascota.foundLocation && (
                <PetLine k="Lugar de hallazgo" v={mascota.foundLocation} />
              )}
            </div>
          )}

          {isAdmin && (
            <div className="detalle__actions">
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                <TrashIcon size={17} />
                Eliminar publicación
              </Button>
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">¿Eliminar esta publicación?</h3>
            <p className="modal__text">
              Esta acción no se puede deshacer. El reporte dejará de ser visible para la
              comunidad.
            </p>
            <div className="modal__actions">
              <Button
                variant="subtle"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="fact">
      <span className="fact__icon">{icon}</span>
      <div>
        <div className="fact__label">{label}</div>
        <div className="fact__value">{value}</div>
      </div>
    </div>
  );
}

function PetLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="pet-line">
      <span className="pet-line__key">{k}</span>
      <span className="pet-line__val">{v}</span>
    </div>
  );
}
