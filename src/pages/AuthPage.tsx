import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractToken, ingresar, registrar } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { InputField } from '../components/Field';
import { useToast } from '../components/Toast';
import { UserIcon } from '../components/icons';
import './UsuariosPage.css';

type Mode = 'login' | 'registro';

export function AuthPage() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useToast();
  const { isAuthenticated, login: startSession } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [registro, setRegistro] = useState({
    email: '',
    password: '',
    name: '',
    address: '',
    phone: '',
  });

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ingresar(login);
      const token = extractToken(response);
      if (!token) {
        throw new Error('El servidor no devolvió un token de sesión.');
      }
      startSession(token);
      notifySuccess('Sesión iniciada.');
      navigate('/usuarios');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistro(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registrar({
        email: registro.email,
        password: registro.password,
        name: registro.name,
        address: registro.address || undefined,
        phone: registro.phone || undefined,
      });
      notifySuccess('Usuario registrado. Ahora puedes iniciar sesión.');
      setMode('login');
      setLogin((prev) => ({ ...prev, email: registro.email }));
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Cuenta</p>
          <h1 className="page__title">Acceso de usuarios</h1>
          <p className="page__subtitle">
            Inicia sesión o registra una cuenta.
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/usuarios" className="btn btn--subtle">
            <UserIcon size={17} />
            <span>Ver usuarios</span>
          </Link>
        )}
      </div>

      <section className="user-shell user-shell--narrow">
        <div className="user-tabs" role="tablist" aria-label="Acceso">
          <button
            type="button"
            className={mode === 'login' ? 'user-tab user-tab--active' : 'user-tab'}
            onClick={() => setMode('login')}
          >
            Ingreso
          </button>
          <button
            type="button"
            className={mode === 'registro' ? 'user-tab user-tab--active' : 'user-tab'}
            onClick={() => setMode('registro')}
          >
            Registro
          </button>
        </div>

        {mode === 'login' ? (
          <form className="user-form" onSubmit={handleLogin}>
            <InputField
              id="login-username"
              label="Correo"
              type="email"
              autoComplete="username"
              value={login.email}
              onChange={(event) =>
                setLogin((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
            <InputField
              id="login-password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={login.password}
              onChange={(event) =>
                setLogin((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
            {error && <p className="form-error">{error}</p>}
            <Button type="submit" disabled={loading} block>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        ) : (
          <form className="user-form" onSubmit={handleRegistro}>
            <InputField
              id="registro-nombre"
              label="Nombre"
              value={registro.name}
              onChange={(event) =>
                setRegistro((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
            <InputField
              id="registro-email"
              label="Correo"
              type="email"
              autoComplete="email"
              value={registro.email}
              onChange={(event) =>
                setRegistro((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
            <InputField
              id="registro-address"
              label="Dirección"
              value={registro.address}
              onChange={(event) =>
                setRegistro((prev) => ({ ...prev, address: event.target.value }))
              }
            />
            <InputField
              id="registro-telefono"
              label="Teléfono"
              type="tel"
              autoComplete="tel"
              value={registro.phone}
              onChange={(event) =>
                setRegistro((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
            <InputField
              id="registro-password"
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={registro.password}
              onChange={(event) =>
                setRegistro((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
            {error && <p className="form-error">{error}</p>}
            <Button type="submit" disabled={loading} block>
              {loading ? 'Registrando…' : 'Registrar'}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
