# Frontend — Sanos y Salvos

Interfaz web de la plataforma comunitaria de mascotas perdidas y encontradas.
Construida con **Vite + React + TypeScript**, consume el **BFF** (`http://localhost:8085`).

## Stack

- Vite 6
- React 18 + React Router 6
- TypeScript (modo estricto)
- Axios
- CSS plano con variables de diseño (sin frameworks de UI)

## Requisitos previos

- Node.js 18+
- El **BFF** corriendo en `http://localhost:8085` (junto con los microservicios:
  `ms-publicacion`, `ms-mascotas`, `geolocalización`).

> El BFF ya permite CORS desde `http://localhost:5173`.

## Puesta en marcha

```bash
cd frontend-sanosysalvos
npm install
npm run dev
```

Abre http://localhost:5173

## Scripts

| Comando           | Descripción                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desarrollo (puerto 5173)     |
| `npm run build`   | Compila TypeScript y genera el bundle    |
| `npm run preview` | Sirve el build de producción localmente  |
| `npm run lint`    | Chequeo de tipos con `tsc`               |

## Variables de entorno

Archivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:8085
```

## Estructura

```
src/
  api/            Cliente Axios + módulos por microservicio + tipos (DTOs del BFF)
  components/     UI reutilizable (Button, Badge, Field, Toast, Layout, iconos…)
  pages/          Vistas: Home, Publicaciones, Detalle, Reportar, Mascotas, Geo
  utils/          Formateadores
  styles/         Estilos globales y tokens de diseño
```

## Funcionalidades

- **Inicio**: presentación y cómo funciona.
- **Publicaciones**: listado con búsqueda y filtros (perdidas / encontradas / resueltas).
- **Detalle**: vista enriquecida vía el orquestador (publicación + mascota), contacto y borrado.
- **Reportar**: formulario que crea mascota + publicación en una sola petición (orquestador),
  con captura de geolocalización del navegador.
- **Mascotas**: directorio con filtros por estado y eliminación.
- **Geolocalización**: cálculo de distancia, búsqueda por radio y registro de ubicación.

## Endpoints del BFF que consume

- `GET/POST/PUT/DELETE /ms-publicacion/publicaciones`
- `GET/POST/DELETE /ms-mascotas/pets`
- `POST /bff/orquestador/publicaciones/completo`
- `GET /bff/orquestador/publicaciones/{id}/detalle`
- `POST /bff/geolocalizacion/distance`
- `POST /bff/geolocalizacion/radius`
- `POST /bff/geolocalizacion/locations`
