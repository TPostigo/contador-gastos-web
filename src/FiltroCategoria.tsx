import type { Filtro } from './types';
import { CATEGORIAS } from './types';

interface FiltroCategoriaProps {
  filtro: Filtro;
  onCambiar: (filtro: Filtro) => void;
}

function FiltroCategoria({ filtro, onCambiar }: FiltroCategoriaProps) {
  return (
    <div className="filtro">
      <button
        className={filtro === 'todas' ? 'activo' : ''}
        onClick={() => onCambiar('todas')}
      >
        todas
      </button>
      {CATEGORIAS.map((cat) => (
        <button
          key={cat}
          className={filtro === cat ? 'activo' : ''}
          onClick={() => onCambiar(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default FiltroCategoria;