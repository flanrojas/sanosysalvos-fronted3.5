import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarPublicaciones } from '../api/publicaciones';
import { getErrorMessage } from '../api/client';
import type { PublicacionResponse } from '../api/types';
import { PublicacionCard } from '../components/PublicacionCard';
import { PublicacionesMap } from '../components/PublicacionesMap';
import { EmptyState, ErrorState } from '../components/States';
import { Button } from '../components/Button';
import { PawIcon, SearchIcon, PlusIcon } from '../components/icons';
import { normalizarTipoPublicacion } from '../utils/format';
import './Pages.css';

type Filtro = 'TODOS' | 'PERDIDO' | 'ENCONTRADO' | 'RESUELTA';
type Vista = 'LISTA' | 'MAPA';

const filtros: { id: Filtro; label: string }[] = [
  { id: 'TODOS', label: 'Todas' },
  { id: 'PERDIDO', label: 'Perdidas' },
  { id: 'ENCONTRADO', label: 'Encontradas' },
  { id: 'RESUELTA', label: 'Resueltas' },
];

export function PublicacionesPage() {
  const [data, setData] = useState<PublicacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const [vista, setVista] = useState<Vista>('LISTA');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let activo = true;
    setLoading(true);
    setError(null);
    listarPublicaciones()
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
  }, []);

  const visibles = useMemo(() => {
    return data.filter((pub) => {
      const tipo = normalizarTipoPublicacion(pub.tipoPublicacion);
      const estado = pub.estado?.toUpperCase();
      if (filtro === 'PERDIDO' && tipo !== 'PERDIDO') return false;
      if (filtro === 'ENCONTRADO' && tipo !== 'ENCONTRADO') return false;
      if (filtro === 'RESUELTA' && estado === 'ACTIVA') return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const blob = `${pub.titulo} ${pub.descripcion} ${pub.direccionReferencia ?? ''}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [data, filtro, query]);

  const visiblesConUbicacion = useMemo(
    () => visibles.filter((pub) => typeof pub.latitud === 'number' && typeof pub.longitud === 'number'),
    [visibles],
  );

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Tablón comunitario</p>
          <h1 className="page__title">Publicaciones</h1>
          <p className="page__subtitle">
            Explora los reportes activos de mascotas perdidas y encontradas en tu zona.
          </p>
        </div>
        <Link to="/reportar" className="btn btn--accent">
          <PlusIcon size={18} />
          Reportar
        </Link>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <SearchIcon size={18} />
          <input
            type="search"
            placeholder="Buscar por nombre, zona o descripción…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="chips">
          {filtros.map((f) => (
            <button
              key={f.id}
              className={filtro === f.id ? 'chip chip--active' : 'chip'}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="view-toggle" aria-label="Vista de publicaciones">
          <button
            type="button"
            className={vista === 'LISTA' ? 'view-toggle__button view-toggle__button--active' : 'view-toggle__button'}
            onClick={() => setVista('LISTA')}
          >
            Lista
          </button>
          <button
            type="button"
            className={vista === 'MAPA' ? 'view-toggle__button view-toggle__button--active' : 'view-toggle__button'}
            onClick={() => setVista('MAPA')}
          >
            Mapa
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid-pubs">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-card__media" />
              <div className="skeleton-card__body">
                <div className="skeleton skeleton-line" style={{ width: '70%' }} />
                <div className="skeleton skeleton-line" style={{ width: '95%' }} />
                <div className="skeleton skeleton-line" style={{ width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorState
          text={error}
          action={
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        />
      )}

      {!loading && !error && visibles.length === 0 && (
        <EmptyState
          icon={<PawIcon size={26} />}
          title="No hay publicaciones que coincidan"
          text="Prueba con otro filtro o sé el primero en publicar un reporte."
          action={
            <Link to="/reportar" className="btn btn--primary">
              Crear publicación
            </Link>
          }
        />
      )}

      {!loading && !error && visibles.length > 0 && vista === 'LISTA' && (
        <div className="grid-pubs">
          {visibles.map((pub) => (
            <PublicacionCard key={pub.idPublicacion} pub={pub} />
          ))}
        </div>
      )}

      {!loading && !error && visibles.length > 0 && vista === 'MAPA' && (
        <>
          {visiblesConUbicacion.length === 0 ? (
            <EmptyState
              icon={<PawIcon size={26} />}
              title="No hay ubicaciones para mostrar"
              text="Las publicaciones filtradas no tienen coordenadas registradas."
            />
          ) : (
            <PublicacionesMap publicaciones={visibles} />
          )}
        </>
      )}
    </div>
  );
}
