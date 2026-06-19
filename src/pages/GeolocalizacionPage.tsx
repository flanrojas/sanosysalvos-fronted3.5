import { useState, type FormEvent } from 'react';
import { buscarEnRadio, calcularDistancia, guardarUbicacion } from '../api/geolocalizacion';
import { getErrorMessage } from '../api/client';
import type { PetDistanceItem } from '../api/types';
import { InputField } from '../components/Field';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { CompassIcon, MapPinIcon, SearchIcon } from '../components/icons';
import { formatDistancia } from '../utils/format';
import './GeolocalizacionPage.css';

export function GeolocalizacionPage() {
  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Microservicio GIS</p>
          <h1 className="page__title">Geolocalización</h1>
          <p className="page__subtitle">
            Calcula distancias, busca mascotas dentro de un radio y registra la última
            ubicación conocida.
          </p>
        </div>
      </div>

      <div className="geo-grid">
        <DistanceTool />
        <RadiusTool />
        <LocationTool />
      </div>
    </div>
  );
}

function DistanceTool() {
  const { notifyError } = useToast();
  const [origin, setOrigin] = useState({ lat: '', lng: '' });
  const [target, setTarget] = useState({ lat: '', lng: '' });
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await calcularDistancia({
        origin_latitude: Number(origin.lat),
        origin_longitude: Number(origin.lng),
        target_latitude: Number(target.lat),
        target_longitude: Number(target.lng),
      });
      setResult(res.distance_meters);
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="geo-card">
      <div className="geo-card__head">
        <span className="geo-card__icon">
          <CompassIcon size={20} />
        </span>
        <h2 className="geo-card__title">Distancia entre puntos</h2>
      </div>
      <p className="geo-card__hint">Distancia lineal entre dos coordenadas.</p>

      <form className="geo-card__form" onSubmit={handle}>
        <div className="geo-pair">
          <InputField
            label="Lat. origen"
            value={origin.lat}
            onChange={(e) => setOrigin((p) => ({ ...p, lat: e.target.value }))}
            placeholder="-12.0464"
            required
          />
          <InputField
            label="Lng. origen"
            value={origin.lng}
            onChange={(e) => setOrigin((p) => ({ ...p, lng: e.target.value }))}
            placeholder="-77.0428"
            required
          />
        </div>
        <div className="geo-pair">
          <InputField
            label="Lat. destino"
            value={target.lat}
            onChange={(e) => setTarget((p) => ({ ...p, lat: e.target.value }))}
            placeholder="-12.0500"
            required
          />
          <InputField
            label="Lng. destino"
            value={target.lng}
            onChange={(e) => setTarget((p) => ({ ...p, lng: e.target.value }))}
            placeholder="-77.0500"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculando…' : 'Calcular distancia'}
        </Button>
      </form>

      {result != null && (
        <div className="geo-result">
          <div className="geo-result__label">Distancia</div>
          <div className="geo-result__value">{formatDistancia(result)}</div>
        </div>
      )}
    </section>
  );
}

function RadiusTool() {
  const { notifyError } = useToast();
  const [center, setCenter] = useState({ lat: '', lng: '' });
  const [radio, setRadio] = useState('1000');
  const [pets, setPets] = useState<PetDistanceItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPets(null);
    try {
      const res = await buscarEnRadio({
        latitude: Number(center.lat),
        longitude: Number(center.lng),
        radius_meters: Number(radio),
      });
      setPets(res.pets);
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="geo-card">
      <div className="geo-card__head">
        <span className="geo-card__icon">
          <SearchIcon size={20} />
        </span>
        <h2 className="geo-card__title">Mascotas en un radio</h2>
      </div>
      <p className="geo-card__hint">Encuentra mascotas perdidas cerca de un punto.</p>

      <form className="geo-card__form" onSubmit={handle}>
        <div className="geo-pair">
          <InputField
            label="Latitud"
            value={center.lat}
            onChange={(e) => setCenter((p) => ({ ...p, lat: e.target.value }))}
            placeholder="-12.0464"
            required
          />
          <InputField
            label="Longitud"
            value={center.lng}
            onChange={(e) => setCenter((p) => ({ ...p, lng: e.target.value }))}
            placeholder="-77.0428"
            required
          />
        </div>
        <InputField
          label="Radio (metros)"
          type="number"
          min="1"
          value={radio}
          onChange={(e) => setRadio(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar en el radio'}
        </Button>
      </form>

      {pets != null && (
        <div className="geo-result">
          {pets.length === 0 ? (
            <p className="geo-result__empty">
              No se encontraron mascotas dentro del radio indicado.
            </p>
          ) : (
            <>
              <div className="geo-result__label">{pets.length} resultado(s)</div>
              <ul className="radius-list">
                {pets.map((pet) => (
                  <li className="radius-item" key={pet.pet_id}>
                    <span className="radius-item__id">{pet.pet_id}</span>
                    <span className="radius-item__dist">
                      {formatDistancia(pet.distance_meters)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function LocationTool() {
  const { notifySuccess, notifyError } = useToast();
  const [petId, setPetId] = useState('');
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [loading, setLoading] = useState(false);

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      notifyError('Tu navegador no permite geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        notifySuccess('Coordenadas capturadas.');
      },
      () => notifyError('No se pudo obtener tu ubicación.'),
    );
  }

  async function handle(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await guardarUbicacion({
        pet_id: petId.trim(),
        latitude: Number(coords.lat),
        longitude: Number(coords.lng),
      });
      notifySuccess(res.message || 'Ubicación guardada.');
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="geo-card">
      <div className="geo-card__head">
        <span className="geo-card__icon">
          <MapPinIcon size={20} />
        </span>
        <h2 className="geo-card__title">Registrar ubicación</h2>
      </div>
      <p className="geo-card__hint">
        Guarda o actualiza la última ubicación de una mascota por su ID.
      </p>

      <form className="geo-card__form" onSubmit={handle}>
        <InputField
          label="ID de la mascota"
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
          placeholder="UUID de la mascota"
          required
        />
        <div className="geo-pair">
          <InputField
            label="Latitud"
            value={coords.lat}
            onChange={(e) => setCoords((p) => ({ ...p, lat: e.target.value }))}
            placeholder="-12.0464"
            required
          />
          <InputField
            label="Longitud"
            value={coords.lng}
            onChange={(e) => setCoords((p) => ({ ...p, lng: e.target.value }))}
            placeholder="-77.0428"
            required
          />
        </div>
        <Button type="button" variant="subtle" size="sm" onClick={usarMiUbicacion}>
          <MapPinIcon size={16} />
          Usar mi ubicación actual
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar ubicación'}
        </Button>
      </form>
    </section>
  );
}
