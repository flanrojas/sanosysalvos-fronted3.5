import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearStoredToken,
  getStoredToken,
  onStoredTokenChange,
  setStoredToken,
} from '../api/client';

type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  rol?: string;
  roles?: string[];
  exp?: number;
};

type AuthContextValue = {
  token: string | null;
  role: string | null;
  userEmail: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string | null): JwtPayload | null {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function normalizeRole(value?: string | null): string | null {
  if (!value) return null;
  return value.replace(/^(ROLE_|ROL_)/, '').toUpperCase();
}

function roleFromPayload(payload: JwtPayload | null): string | null {
  return normalizeRole(payload?.rol) ?? normalizeRole(payload?.roles?.[0]);
}

function isExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = getStoredToken();
    if (isExpired(decodeToken(stored))) {
      clearStoredToken();
      return null;
    }
    return stored;
  });

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
  }, []);

  const login = useCallback((nextToken: string) => {
    setStoredToken(nextToken);
    setToken(nextToken);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => setToken(getStoredToken());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'sanosysalvos_token') {
        setToken(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    const unsubscribe = onStoredTokenChange(syncFromStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const payload = decodeToken(token);
    const validToken = token && !isExpired(payload) ? token : null;
    const role = roleFromPayload(payload);

    return {
      token: validToken,
      role: validToken ? role : null,
      userEmail: validToken ? payload?.email ?? payload?.sub ?? null : null,
      userName: validToken ? payload?.name ?? null : null,
      isAuthenticated: Boolean(validToken),
      isAdmin: role === 'ADMIN',
      login,
      logout,
    };
  }, [login, logout, token]);

  useEffect(() => {
    if (token && !value.token) {
      logout();
    }
  }, [logout, token, value.token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
