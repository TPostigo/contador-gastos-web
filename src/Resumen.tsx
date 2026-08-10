import type { Gasto, Categoria } from './types';
import { CATEGORIAS } from './types';

interface ResumenProps {
  gastos: Gasto[];
  saldoInicial: number | null; // null mientras carga o si no hay dato
}

// Colores de las barras (claros, para el fondo morado)
const COLORES: Record<Categoria, string> = {
  comida: '#fbbf24',
  casa: '#38bdf8',
  ocio: '#f472b6',
  transporte: '#34d399',
  otros: '#c4b5fd',
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

  return (
    <div className="resumen">
      {saldoInicial !== null ? (
        <div className="resumen-saldo">
          <div className="saldo-linea">
            <span>Dinero inicial</span>
            <strong>{saldoInicial.toFixed(2)} €</strong>
          </div>
          <div className="saldo-linea">
            <span>Gastado</span>
            <strong>−{total.toFixed(2)} €</strong>
          </div>
          <div
            className={`saldo-linea saldo-disponible ${
              saldoInicial - total < 0 ? 'negativo' : ''
            }`}
          >
            <span>Disponible</span>
            <strong>{(saldoInicial - total).toFixed(2)} €</strong>
          </div>
        </div>
      ) : (
        <h2>Total: {total.toFixed(2)} €</h2>
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
                  {porCategoria[cat].toFixed(2)} €
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