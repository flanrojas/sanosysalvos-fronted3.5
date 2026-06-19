import type { ReactNode } from 'react';
import './States.css';

export function Spinner() {
  return <div className="spinner" role="status" aria-label="Cargando" />;
}

export function LoadingState({ text = 'Cargando…' }: { text?: string }) {
  return (
    <div className="state">
      <Spinner />
      <p className="state__text">{text}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="state">
      {icon && <div className="state__icon">{icon}</div>}
      <h3 className="state__title">{title}</h3>
      {text && <p className="state__text">{text}</p>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  text: string;
  action?: ReactNode;
}

export function ErrorState({ title = 'Algo salió mal', text, action }: ErrorStateProps) {
  return (
    <div className="state state--error">
      <div className="state__icon" aria-hidden>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h3 className="state__title">{title}</h3>
      <p className="state__text">{text}</p>
      {action}
    </div>
  );
}
