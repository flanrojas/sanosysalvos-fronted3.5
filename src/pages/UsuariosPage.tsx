import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarUsuarios } from '../api/usuarios';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { UserProfileResponse } from '../api/types';
import { Button } from '../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { UserIcon } from '../components/icons';
import './UsuariosPage.css';

export function UsuariosPage() {
  const { token, isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);
    listarUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (token && isAdmin) {
      cargar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  if (!token) {
    return (
      <div className="container page">
        <EmptyState
          icon={<UserIcon size={28} />}
          title="Necesitas iniciar sesión"
          text="La lista de usuarios del sistema requiere una sesión de administrador."
          action={
            <Link to="/acceso" className="btn btn--primary">
              Ir a acceso
            </Link>
          }
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container page">
        <EmptyState
          icon={<UserIcon size={28} />}
          title="Acceso solo para administradores"
          text="Tu usuario no tiene permisos para ver la lista de usuarios del sistema."
          action={
            <Link to="/" className="btn btn--primary">
              Volver a publicaciones
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Administración</p>
          <h1 className="page__title">Usuarios</h1>
          <p className="page__subtitle">
            Lista de usuarios activos registrados en el sistema.
          </p>
        </div>
        <div className="user-actions">
          <Button variant="subtle" onClick={cargar} disabled={loading}>
            Refrescar
          </Button>
        </div>
      </div>

      {loading && <LoadingState text="Cargando usuarios..." />}

      {!loading && error && (
        <ErrorState
          text={error}
          action={
            <Button variant="ghost" onClick={cargar}>
              Reintentar
            </Button>
          }
        />
      )}

      {!loading && !error && (
        <section className="user-shell user-shell--wide">
          <div className="user-section-head">
            <h2>Usuarios activos</h2>
            <span className="user-pill">{usuarios.length}</span>
          </div>

          {usuarios.length === 0 ? (
            <p className="user-muted">No hay usuarios disponibles.</p>
          ) : (
            <div className="user-table">
              {usuarios.map((user, index) => {
                const userKey = user.username || user.email || `${index}`;
                return (
                  <article className="user-row user-row--list-only" key={userKey}>
                    <div className="user-row__avatar">
                      {(user.name || user.nombre || user.username || user.email || 'U')
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                    <div className="user-row__body">
                      <strong>
                        {user.name || user.nombre || user.username || user.email || 'Usuario'}
                      </strong>
                      <span>{user.email || user.username || 'Sin correo'}</span>
                    </div>
                    <span className="user-pill">
                      {user.rol || (user.activo === false ? 'Inactivo' : 'Activo')}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
