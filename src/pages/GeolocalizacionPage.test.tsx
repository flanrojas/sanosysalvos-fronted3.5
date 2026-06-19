import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeolocalizacionPage } from './GeolocalizacionPage';
import {
  buscarEnRadio,
  calcularDistancia,
  guardarUbicacion,
} from '../api/geolocalizacion';
import { useToast } from '../components/Toast';

vi.mock('../api/geolocalizacion', () => ({
  calcularDistancia: vi.fn(),
  buscarEnRadio: vi.fn(),
  guardarUbicacion: vi.fn(),
}));

vi.mock('../components/Toast', () => ({
  useToast: vi.fn(),
}));

const calcularDistanciaMock = vi.mocked(calcularDistancia);
const buscarEnRadioMock = vi.mocked(buscarEnRadio);
const guardarUbicacionMock = vi.mocked(guardarUbicacion);
const useToastMock = vi.mocked(useToast);

describe('GeolocalizacionPage', () => {
  const notifySuccess = vi.fn();
  const notifyError = vi.fn();

  beforeEach(() => {
    calcularDistanciaMock.mockReset();
    buscarEnRadioMock.mockReset();
    guardarUbicacionMock.mockReset();
    notifySuccess.mockReset();
    notifyError.mockReset();
    useToastMock.mockReturnValue({ notifySuccess, notifyError });
  });

  it('calcula distancia entre puntos', async () => {
    const user = userEvent.setup();
    calcularDistanciaMock.mockResolvedValueOnce({ distance_meters: 2144.59 });

    render(<GeolocalizacionPage />);

    await user.type(screen.getByLabelText('Lat. origen'), '-33.4489');
    await user.type(screen.getByLabelText('Lng. origen'), '-70.6693');
    await user.type(screen.getByLabelText('Lat. destino'), '-33.4569');
    await user.type(screen.getByLabelText('Lng. destino'), '-70.6483');
    await user.click(screen.getByRole('button', { name: 'Calcular distancia' }));

    await waitFor(() => {
      expect(screen.getByText('2,14 km')).toBeInTheDocument();
    });
    expect(calcularDistanciaMock).toHaveBeenCalledWith({
      origin_latitude: -33.4489,
      origin_longitude: -70.6693,
      target_latitude: -33.4569,
      target_longitude: -70.6483,
    });
  });

  it('busca mascotas dentro de un radio y muestra resultados', async () => {
    const user = userEvent.setup();
    buscarEnRadioMock.mockResolvedValueOnce({
      pets: [{ pet_id: 'pet-1', distance_meters: 320 }],
    });

    render(<GeolocalizacionPage />);

    const latitudes = screen.getAllByLabelText('Latitud');
    const longitudes = screen.getAllByLabelText('Longitud');
    await user.type(latitudes[0], '-33.4489');
    await user.type(longitudes[0], '-70.6693');
    await user.clear(screen.getByLabelText('Radio (metros)'));
    await user.type(screen.getByLabelText('Radio (metros)'), '1000');
    await user.click(screen.getByRole('button', { name: 'Buscar en el radio' }));

    await waitFor(() => {
      expect(screen.getByText('1 resultado(s)')).toBeInTheDocument();
    });
    expect(screen.getByText('pet-1')).toBeInTheDocument();
    expect(screen.getByText('320 m')).toBeInTheDocument();
  });

  it('guarda ubicación y usa geolocalización del navegador', async () => {
    const user = userEvent.setup();
    guardarUbicacionMock.mockResolvedValueOnce({ message: 'Location saved successfully' });
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({
        coords: {
          latitude: -33.4489,
          longitude: -70.6693,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition),
    );
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });

    render(<GeolocalizacionPage />);

    await user.type(screen.getByLabelText('ID de la mascota'), 'pet-123');
    await user.click(screen.getByRole('button', { name: /Usar mi ubicación actual/ }));

    expect(notifySuccess).toHaveBeenCalledWith('Coordenadas capturadas.');

    await user.click(screen.getByRole('button', { name: 'Guardar ubicación' }));

    await waitFor(() => {
      expect(guardarUbicacionMock).toHaveBeenCalledWith({
        pet_id: 'pet-123',
        latitude: -33.4489,
        longitude: -70.6693,
      });
    });
    expect(notifySuccess).toHaveBeenCalledWith('Location saved successfully');
  });
});
