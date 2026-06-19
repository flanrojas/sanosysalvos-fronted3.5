import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { PublicacionesPage } from './pages/PublicacionesPage';
import { DetallePage } from './pages/DetallePage';
import { ReportarPage } from './pages/ReportarPage';
import { MascotasPage } from './pages/MascotasPage';
import { GeolocalizacionPage } from './pages/GeolocalizacionPage';
import { AuthPage } from './pages/AuthPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider } from './auth/AuthContext';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<PublicacionesPage />} />
              <Route path="/publicaciones" element={<PublicacionesPage />} />
              <Route path="/publicaciones/:id" element={<DetallePage />} />
              <Route path="/reportar" element={<ReportarPage />} />
              <Route path="/mascotas" element={<MascotasPage />} />
              <Route path="/geolocalizacion" element={<GeolocalizacionPage />} />
              <Route path="/acceso" element={<AuthPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
