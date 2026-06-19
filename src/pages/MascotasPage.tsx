import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  actualizarMascota,
  crearMascota,
  eliminarMascota,
  listarMascotas,
} from '../api/mascotas';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { MascotaRequest, MascotaResponse } from '../api/types';
import { Badge, toneForTipo } from '../components/Badge';
import { Button } from '../components/Button';
import { InputField, SelectField, TextareaField } from '../components/Field';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useToast } from '../components/Toast';
import { PawIcon, TrashIcon } from '../components/icons';
import { formatFechaCorta, iniciales } from '../utils/format';
import './MascotasPage.css';

const filtros = [
  { id: '', label: 'Todas' },
  { id: 'LOST', label: 'Perdidas' },
  { id: 'SEARCHING', label: 'En búsqueda' },
  { id: 'FOUND', label: 'Encontradas' },
  { id: 'AT_HOME', label: 'En casa' },
];

const estados = [
  { value: 'LOST', label: 'Perdida' },
  { value: 'SEARCHING', label: 'En búsqueda' },
  { value: 'FOUND', label: 'Encontrada' },
  { value: 'AT_HOME', label: 'En casa' },
];

const initialForm = {
  name: '',
  status: 'LOST',
  species: '',
  color: '',
  size: '',
  description: '',
};

function estadoLabel(status: string) {
  return estados.find((estado) => estado.value === status)?.label ?? status;
}

function toPayload(form: typeof initialForm): MascotaRequest {
  return {
    name: form.name.trim(),
    status: form.status,
    species: form.species.trim(),
    color: form.color.trim(),
    size: form.size ? Number(form.size) : null,
    foundLocation: null,
    lostLocation: null,
    description: form.description.trim() || null,
    ownerId: null,
  };
}

export function MascotasPage() {
  const { isAuthenticated } = useAuth();
  const { notifySuccess, notifyError } = useToast();
  const [data, setData] = useState<MascotaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function cargar(estado: string) {
    setLoading(true);
    setError(null);
    listarMascotas(estado ? { status: estado } : undefined)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }
    cargar(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, status]);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Eliminar el registro de "${name}"?`)) return;
    try {
      await eliminarMascota(id);
      setData((prev) => prev.filter((m) => m.id !== id));
      notifySuccess('Mascota eliminada.');
    } catch (err) {
      notifyError(getErrorMessage(err));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = toPayload(form);

    try {
      const saved = editingId
        ? await actualizarMascota(editingId, payload)
        : await crearMascota(payload);

      const matchesFilter = !status || saved.status === status;
      setData((prev) => {
        if (editingId) {
          return matchesFilter
            ? prev.map((item) => (item.id === editingId ? saved : item))
            : prev.filter((item) => item.id !== editingId);
        }
        return matchesFilter ? [saved, ...prev] : prev;
      });
      setForm(initialForm);
      setEditingId(null);
      notifySuccess(editingId ? 'Mascota actualizada.' : 'Mascota registrada.');
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(mascota: MascotaResponse) {
    setEditingId(mascota.id);
    setForm({
      name: mascota.name ?? '',
      status: mascota.status || 'LOST',
      species: mascota.species ?? '',
      color: mascota.color ?? '',
      size: mascota.size != null ? String(mascota.size) : '',
      description: mascota.description ?? '',
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Registro</p>
          <h1 className="page__title">Mascotas</h1>
          <p className="page__subtitle">
            Directorio de mascotas registradas en la plataforma.
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <EmptyState
          icon={<PawIcon size={26} />}
          title="Inicia sesión para gestionar mascotas"
          text="La lista y el registro de mascotas requieren una sesión activa."
          action={
            <Link to="/acceso" className="btn btn--primary">
              Acceder
            </Link>
          }
        />
      )}

      {isAuthenticated && (
        <>

      <form className="mascota-form" onSubmit={handleSubmit}>
        <InputField
          id="mascota-name"
          label="Nombre"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <SelectField
          id="mascota-status"
          label="Estado"
          value={form.status}
          onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
        >
          {estados.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </SelectField>
        <InputField
          id="mascota-species"
          label="Especie"
          value={form.species}
          onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value }))}
          required
        />
        <InputField
          id="mascota-color"
          label="Color"
          value={form.color}
          onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
          required
        />
        <InputField
          id="mascota-size"
          label="Tamaño"
          type="number"
          min="0"
          step="0.1"
          value={form.size}
          onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
          required
        />
        <TextareaField
          id="mascota-description"
          label="Descripción"
          rows={3}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
        <div className="mascota-form__actions">
          {editingId && (
            <Button type="button" variant="ghost" onClick={handleCancelEdit}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Registrar'}
          </Button>
        </div>
      </form>

      <div className="toolbar">
        <div className="chips">
          {filtros.map((f) => (
            <button
              key={f.id || 'all'}
              className={status === f.id ? 'chip chip--active' : 'chip'}
              onClick={() => setStatus(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingState text="Cargando mascotas…" />}

      {!loading && error && (
        <ErrorState
          text={error}
          action={
            <Button variant="ghost" onClick={() => cargar(status)}>
              Reintentar
            </Button>
          }
        />
      )}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={<PawIcon size={26} />}
          title="Sin mascotas registradas"
          text="Cuando se cree un reporte completo, las mascotas aparecerán aquí."
        />
      )}

      {!loading && !error && data.length > 0 && (
        <div className="mascota-grid">
          {data.map((m) => (
            <article className="mascota-card" key={m.id}>
              <div className="mascota-card__head">
                <span className="mascota-card__avatar">{iniciales(m.name)}</span>
                <div>
                  <div className="mascota-card__name">{m.name || 'Sin nombre'}</div>
                  <div className="mascota-card__species">{m.species || 'Especie N/D'}</div>
                </div>
              </div>

              <div className="mascota-card__tags">
                {m.status && <Badge tone={toneForTipo(m.status)}>{estadoLabel(m.status)}</Badge>}
                {m.color && <span className="mascota-card__tag">{m.color}</span>}
                {m.size != null && (
                  <span className="mascota-card__tag">{m.size} kg</span>
                )}
              </div>

              {m.description && <p className="mascota-card__desc">{m.description}</p>}

              <div className="mascota-card__foot">
                <span className="mascota-card__date">
                  Registrada {formatFechaCorta(m.createdAt)}
                </span>
                <div className="mascota-card__actions">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(m)}>
                    Editar
                  </Button>
                  <button
                    className="icon-btn"
                    onClick={() => handleDelete(m.id, m.name || 'Sin nombre')}
                    aria-label={`Eliminar ${m.name || 'Sin nombre'}`}
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
