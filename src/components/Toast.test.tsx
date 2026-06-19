import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ToastProvider, useToast } from './Toast';

function ToastProbe() {
  const { notifySuccess, notifyError } = useToast();

  return (
    <div>
      <button type="button" onClick={() => notifySuccess('Guardado correctamente')}>
        Success
      </button>
      <button type="button" onClick={() => notifyError('No se pudo guardar')}>
        Error
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('muestra notificaciones y permite cerrarlas', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Success' }));
    await user.click(screen.getByRole('button', { name: 'Error' }));

    expect(screen.getByText('Guardado correctamente')).toBeInTheDocument();
    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Cerrar' })[0]);

    expect(screen.queryByText('Guardado correctamente')).not.toBeInTheDocument();
    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument();
  });
});
