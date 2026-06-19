import { Link } from 'react-router-dom';
import { PawIcon } from '../components/icons';
import './Pages.css';

export function NotFoundPage() {
  return (
    <div className="container page">
      <div className="state" style={{ paddingBlock: '5rem' }}>
        <div className="state__icon" style={{ width: 64, height: 64 }}>
          <PawIcon size={30} />
        </div>
        <h1 className="state__title" style={{ fontSize: '1.6rem' }}>
          Esta página se perdió
        </h1>
        <p className="state__text">
          No encontramos lo que buscabas. Quizá la publicación fue retirada o el enlace
          cambió.
        </p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: '0.6rem' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
