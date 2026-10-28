import type { Gasto, Categoria } from './types';
import { formatearEuros } from "./formato";
import { CATEGORIAS } from './types';

interface ResumenProps {
  gastos: Gasto[];
  saldoInicial: number | null; // null mientras carga o si no hay dato
}

// Colores de las barras (claros, para el fondo morado)
const COLORES: Record<Categoria, string> = {
  comida: '#fcd34d',
  casa: '#5eead4',
  ocio: '#f9a8d4',
  transporte: '#93c5fd',
  otros: '#ddd6fe',
};

function Resumen({ gastos, saldoInicial }: ResumenProps) {
  const total = gastos.reduce((acum, gasto) => acum + gasto.importe, 0);

  const porCategoria = gastos.reduce<Record<Categoria, number>>(
    (acum, gasto) => {
      acum[gasto.categoria] += gasto.importe;
      return acum;
    },
    { comida: 0, casa: 0, ocio: 0, transporte: 0, otros: 0 }
  );

  // El mayor total marca el 100% del ancho de barra
  const maximo = Math.max(...Object.values(porCategoria));

  const disponible = saldoInicial !== null ? saldoInicial - total : 0;

  return (
    <div className="resumen">
      {saldoInicial !== null ? (
        <>
          <div className="resumen-saldo">
            <div className="saldo-linea">
              <span>Dinero inicial</span>
              <strong>{formatearEuros(saldoInicial)}</strong>
            </div>
            <div className="saldo-linea">
              <span>Gastado</span>
              <strong>−{formatearEuros(total)}</strong>
            </div>
            <div
              className={`saldo-linea saldo-disponible ${disponible < 0 ? 'negativo' : ''}`}
            >
              <span>Disponible</span>
              <strong>{formatearEuros(disponible)}</strong>
            </div>
          </div>

          {disponible < 0 && (
            <p className="aviso-saldo" role="alert">
              Saldo negativo: llevas {formatearEuros(Math.abs(disponible))} más gastados de lo que tienes.
            </p>
          )}
        </>
      ) : (
        <h2>Total: {formatearEuros(total)}</h2>
      )}

      {gastos.length === 0 ? (
        <p className="resumen-vacio">Añade gastos para ver el desglose</p>
      ) : (
        <div className="resumen-grafico">
          {CATEGORIAS.filter((cat) => porCategoria[cat] > 0).map((cat) => (
            <div key={cat} className="grafico-fila">
              <span className="grafico-etiqueta">{cat}</span>
              <div className="grafico-barra-fondo">
                <div
                  className="grafico-barra"
                  style={{
                    width: `${(porCategoria[cat] / maximo) * 100}%`,
                    backgroundColor: COLORES[cat],
                  }}
                >
                  {formatearEuros(porCategoria[cat])}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Resumen;