import { useState, useEffect } from 'react';
import type { Gasto, Categoria } from './types';
import { CATEGORIAS } from './types';

interface GastoFormProps {
  onAgregar: (gasto: Gasto) => void;
  onActualizar: (gasto: Gasto) => void;
  gastoEnEdicion: Gasto | null;
  onCancelarEdicion: () => void;
}

function GastoForm({
  onAgregar,
  onActualizar,
  gastoEnEdicion,
  onCancelarEdicion,
}: GastoFormProps) {
  const [descripcion, setDescripcion] = useState('');
  const [importe, setImporte] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('comida');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ¿Estamos en modo edición? (booleano derivado, muy legible en el JSX)
  const editando = gastoEnEdicion !== null;

  // Cuando cambia el gasto en edición, rellenamos (o limpiamos) el formulario
  useEffect(() => {
    if (gastoEnEdicion) {
      setDescripcion(gastoEnEdicion.descripcion);
      setImporte(String(gastoEnEdicion.importe));
      setCategoria(gastoEnEdicion.categoria);
      setFecha(gastoEnEdicion.fecha);
    } else {
      setDescripcion('');
      setImporte('');
      setCategoria('comida');
      setFecha('');
    }
  }, [gastoEnEdicion]);

  const manejarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const importeNum = Number(importe);
    if (!descripcion.trim() || !importe || importeNum <= 0 || !fecha) {
      setError('Rellena todos los campos con valores válidos');
      return;
    }
    setError(null);

    if (editando) {
      // Modo edición: conservamos el id original
      onActualizar({
        id: gastoEnEdicion.id,
        descripcion: descripcion.trim(),
        importe: importeNum,
        categoria,
        fecha,
      });
    } else {
      // Modo creación: id nuevo
      onAgregar({
        id: crypto.randomUUID(),
        descripcion: descripcion.trim(),
        importe: importeNum,
        categoria,
        fecha,
      });
    }

    // Limpiamos (en edición, el useEffect también limpiará al volver a null)
    // La categoría y la fecha se mantienen para el siguiente gasto
    setDescripcion('');
    setImporte('');
  };

  return (
    <form onSubmit={manejarSubmit} className="gasto-form">
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <div className="campo-euro">
        <input
          type="number"
          placeholder="Importe"
          step="0.01"
          min="0"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
        />
        <span className="simbolo-euro" aria-hidden="true">€</span>
      </div>

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value as Categoria)}
      >
        {CATEGORIAS.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <button type="submit">
        {editando ? '💾 Guardar cambios' : 'Añadir gasto'}
      </button>

      {editando && (
        <button type="button" className="btn-cancelar" onClick={onCancelarEdicion}>
          Cancelar
        </button>
      )}

      {error && <p className="error-campo" role="alert">{error}</p>}
    </form>
  );
}

export default GastoForm;