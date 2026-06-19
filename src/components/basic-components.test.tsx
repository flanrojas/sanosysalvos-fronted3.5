import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Badge, toneForEstado, toneForTipo } from './Badge';
import { Button } from './Button';
import { EmptyState, ErrorState, LoadingState, Spinner } from './States';
import { InputField, SelectField, TextareaField } from './Field';

describe('componentes base', () => {
  it('renderiza Badge y calcula tonos', () => {
    const { container, rerender } = render(<Badge tone="lost">Perdido</Badge>);

    expect(screen.getByText('Perdido')).toHaveClass('badge--lost');
    expect(container.querySelector('.badge__dot')).toBeInTheDocument();

    rerender(<Badge dot={false}>Neutral</Badge>);
    expect(screen.getByText('Neutral')).toHaveClass('badge--neutral');
    expect(container.querySelector('.badge__dot')).not.toBeInTheDocument();

    expect(toneForTipo('LOST')).toBe('lost');
    expect(toneForTipo('PERDIDA')).toBe('lost');
    expect(toneForTipo('ENCONTRADO')).toBe('found');
    expect(toneForTipo('ENCONTRADA')).toBe('found');
    expect(toneForTipo('OTRO')).toBe('neutral');
    expect(toneForEstado('SAFE')).toBe('resolved');
    expect(toneForEstado('ACTIVA')).toBe('neutral');
  });

  it('renderiza Button con variantes y ejecuta onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button variant="accent" size="sm" block className="extra" onClick={onClick}>
        Guardar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveClass('btn--accent', 'btn--sm', 'btn--block', 'extra');

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renderiza estados de carga, vacío y error', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument();

    render(<LoadingState text="Buscando datos" />);
    expect(screen.getByText('Buscando datos')).toBeInTheDocument();

    render(<EmptyState title="Sin datos" text="No hay registros" action={<button>Crear</button>} />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();

    render(<ErrorState text="Error de prueba" action={<button>Reintentar</button>} />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Error de prueba')).toBeInTheDocument();
  });

  it('renderiza campos de formulario accesibles', () => {
    render(
      <form>
        <InputField id="email" label="Correo" hint="Tu correo" defaultValue="a@b.cl" />
        <TextareaField id="descripcion" label="Descripción" defaultValue="Detalle" />
        <SelectField id="tipo" label="Tipo" defaultValue="PERDIDO">
          <option value="PERDIDO">Perdido</option>
          <option value="ENCONTRADO">Encontrado</option>
        </SelectField>
      </form>,
    );

    expect(screen.getByRole('textbox', { name: /Correo/ })).toHaveValue('a@b.cl');
    expect(screen.getByText('Tu correo')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Descripción' })).toHaveValue('Detalle');
    expect(screen.getByRole('combobox', { name: 'Tipo' })).toHaveValue('PERDIDO');
  });
});
