import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { PawIcon, PlusIcon, UserIcon } from './icons';
import { useAuth } from '../auth/AuthContext';
import './Layout.css';

const links = [
  { to: '/', label: 'Publicaciones', end: true },
  { to: '/mascotas', label: 'Mascotas', authOnly: true },
  { to: '/usuarios', label: 'Usuarios', adminOnly: true },
];

export function Layout() {
  const { isAuthenticated, isAdmin, role, userEmail, userName, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  function handleLogout() {
    logout();
    setIsUserMenuOpen(false);
  }

  return (
    <>
      <header className="nav">
        <div className="container nav__inner">
          <Link to="/" className="nav__brand">
            <span className="nav__brand-mark">
              <PawIcon size={20} />
            </span>
            <span className="nav__brand-text">
              Sanos y Salvos
            </span>
          </Link>

          <nav className="nav__links">
            {links
              .filter((link) => (!link.adminOnly || isAdmin) && (!link.authOnly || isAuthenticated))
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? 'nav__link nav__link--active' : 'nav__link'
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            <Link to="/reportar" className="btn btn--accent btn--sm nav__cta">
              <PlusIcon size={16} />
              <span>Reportar</span>
            </Link>
            {isAuthenticated ? (
              <div className="nav-user" ref={userMenuRef}>
                <button
                  type="button"
                  className="nav-user__avatar"
                  aria-label="Abrir menú de usuario"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                >
                  <UserIcon size={20} />
                </button>
                {isUserMenuOpen && (
                  <div className="nav-user__menu" role="menu">
                    <div className="nav-user__summary">
                      <span className="nav-user__name">{userName ?? 'Usuario'}</span>
                      <span className="nav-user__meta">{userEmail ?? role ?? 'Cuenta'}</span>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/usuarios"
                        className="nav-user__item"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Usuarios
                      </Link>
                    )}
                    <button
                      type="button"
                      className="nav-user__item nav-user__item--button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/acceso" className="btn btn--subtle btn--sm nav__cta">
                <span>Acceso</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__brand">
            <PawIcon size={18} />
            Sanos y Salvos
          </span>
        </div>
      </footer>
    </>
  );
}
