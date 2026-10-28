import { useState } from 'react';

interface AnadirDineroProps {
  onAnadirDinero: (cantidad: number) => Promise<void>;
}

function AnadirDinero({ onAnadirDinero }: AnadirDineroProps) {
  const [cantidad, setCantidad] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importe = Number(cantidad);
  const valido = importe > 0;

  const manejarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valido) return;

    setGuardando(true);
    setError(null);
    try {
      await onAnadirDinero(importe);
      setCantidad('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir dinero');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="anadir">
      <h3 className="bloque-titulo">Añadir dinero</h3>
      <form className="anadir-form" onSubmit={manejarSubmit}>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Cantidad (€)"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          aria-label="Cantidad a añadir"
        />
        <button type="submit" disabled={guardando || !valido}>
          Añadir
        </button>
      </form>
      {error && <p className="error-campo" role="alert">{error}</p>}
    </div>
  );
}

export default AnadirDinero;