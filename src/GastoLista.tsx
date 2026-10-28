import type { Gasto } from './types';
import { formatearEuros, formatearFecha } from "./formato";

interface GastoListaProps {
  gastos: Gasto[];
  onBorrar: (id: string) => void;
  onEditar: (gasto: Gasto) => void;
  filtroActivo: boolean;
}

function GastoLista({ gastos, onBorrar, onEditar, filtroActivo }: GastoListaProps) {
  // Renderizado condicional: si no hay gastos, mensaje y salimos
  if (gastos.length === 0) {
    return (
      <p className="vacio">
        {filtroActivo
          ? 'No hay gastos en esta categoría.'
          : 'No hay gastos todavía. ¡Añade el primero!'}
      </p>
    );
  }

  return (
    <ul className="gasto-lista">
      {gastos.map((gasto) => (
        <li key={gasto.id} className={`gasto-item cat-${gasto.categoria}`}>
          <span className="gasto-desc">{gasto.descripcion}</span>
          <span className="gasto-cat">{gasto.categoria}</span>
          <span className="gasto-fecha">{formatearFecha(gasto.fecha)}</span>
          <span className="gasto-importe">{formatearEuros(gasto.importe)}</span>
          <button onClick={() => onEditar(gasto)} title="Editar">✏️</button>
          <button
            onClick={() => {
              if (window.confirm(`¿Borrar «${gasto.descripcion}»?`)) onBorrar(gasto.id);
            }}
            title="Borrar"
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}

export default GastoLista;