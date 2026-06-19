import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DivIcon, LatLngBounds } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { PublicacionResponse } from '../api/types';
import { formatFechaCorta, normalizarTipoPublicacion, tituloTipo } from '../utils/format';

type PublicacionConCoordenadas = PublicacionResponse & {
  latitud: number;
  longitud: number;
};

interface PublicacionesMapProps {
  publicaciones: PublicacionResponse[];
}

const defaultCenter: [number, number] = [-33.4489, -70.6693];

function hasCoordinates(pub: PublicacionResponse): pub is PublicacionConCoordenadas {
  return typeof pub.latitud === 'number' && typeof pub.longitud === 'number';
}

function markerIcon(tipo: string) {
  const tone = normalizarTipoPublicacion(tipo) === 'ENCONTRADO' ? 'found' : 'lost';
  return new DivIcon({
    className: `map-marker map-marker--${tone}`,
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FitToMarkers({ publicaciones }: { publicaciones: PublicacionConCoordenadas[] }) {
  const map = useMap();

  useEffect(() => {
    if (publicaciones.length > 1) {
      const bounds = new LatLngBounds(
        publicaciones.map((pub) => [pub.latitud, pub.longitud]),
      );
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    } else if (publicaciones.length === 1) {
      map.setView([publicaciones[0].latitud, publicaciones[0].longitud], 14);
    }
  }, [map, publicaciones]);

  return null;
}

export function PublicacionesMap({ publicaciones }: PublicacionesMapProps) {
  const ubicadas = publicaciones.filter(hasCoordinates);
  const center = ubicadas.length > 0
    ? ([ubicadas[0].latitud, ubicadas[0].longitud] as [number, number])
    : defaultCenter;

  return (
    <section className="map-shell" aria-label="Mapa de publicaciones">
      <MapContainer
        center={center}
        zoom={ubicadas.length > 0 ? 13 : 11}
        scrollWheelZoom
        className="map-shell__map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers publicaciones={ubicadas} />
        {ubicadas.map((pub) => (
          <Marker
            key={pub.idPublicacion}
            position={[pub.latitud, pub.longitud]}
            icon={markerIcon(pub.tipoPublicacion)}
          >
            <Popup>
              <div className="map-popup">
                <strong>{pub.titulo}</strong>
                <span>{tituloTipo(pub.tipoPublicacion)} · {formatFechaCorta(pub.fechaPublicacion)}</span>
                {pub.direccionReferencia && <span>{pub.direccionReferencia}</span>}
                <Link to={`/publicaciones/${pub.idPublicacion}`}>Ver detalle</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}
