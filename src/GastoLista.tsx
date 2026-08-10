import type { Gasto } from './types';

interface GastoListaProps {
  gastos: Gasto[];
  onBorrar: (id: string) => void;
  onEditar: (gasto: Gasto) => void;
}

function GastoLista({ gastos, onBorrar, onEditar }: GastoListaProps) {
  // Renderizado condicional: si no hay gastos, mensaje y salimos
  if (gastos.length === 0) {
    return <p className="vacio">No hay gastos todavía. ¡Añade el primero!</p>;
  }

  return (
    <ul className="gasto-lista">
      {gastos.map((gasto) => (
        <li key={gasto.id} className="gasto-item">
          <span className="gasto-desc">{gasto.descripcion}</span>
          <span className="gasto-cat">{gasto.categoria}</span>
          <span className="gasto-fecha">{gasto.fecha}</span>
          <span className="gasto-importe">{gasto.importe.toFixed(2)} €</span>
          <button onClick={() => onEditar(gasto)} title="Editar">✏️</button>
          <button onClick={() => onBorrar(gasto.id)}>🗑️</button>
        </li>
      ))}
    </ul>
  );
}

export default GastoLista;