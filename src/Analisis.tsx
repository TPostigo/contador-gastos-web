import { useState, type ReactNode } from 'react';
import { formatearEuros } from "./formato";
import type { Gasto, Analisis } from './types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

interface AnalisisProps {
  gastos: Gasto[];
  acciones?: ReactNode; // botones extra que se muestran al final de la caja
}

// Colores de las porciones, a juego con la paleta de la app
const COLORES_TARTA = ['#4c1d95', '#8b5cf6', '#0f5e63', '#64748b', '#a78bfa'];

// Para ordenar y traducir los días que devuelve pandas (en inglés)
const ORDEN_DIAS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];
const DIAS_ES: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié', Thursday: 'Jue',
  Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom',
};

function AnalisisPanel({ gastos, acciones }: AnalisisProps) {
  // Los TRES estados de toda petición asíncrona:
  const [analisis, setAnalisis] = useState<Analisis | null>(null); // datos
  const [cargando, setCargando] = useState(false);                 // en curso
  const [error, setError] = useState<string | null>(null);         // fallo

  const pedirAnalisis = async () => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/analisis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gastos),
      });

      // fetch NO lanza error con respuestas 4xx/5xx: hay que comprobarlo
      if (!respuesta.ok) {
        throw new Error('El análisis no está disponible ahora. Inténtalo de nuevo en un momento.');
      }

      const datos = (await respuesta.json()) as Analisis;
      setAnalisis(datos);
    } catch (err) {
      // Si la API está apagada, fetch lanza TypeError y caemos aquí
      setError(
        err instanceof TypeError
          ? 'No se pudo conectar con el servidor. Inténtalo de nuevo en un momento.'
          : err instanceof Error
            ? err.message
            : 'El análisis no está disponible ahora. Inténtalo de nuevo en un momento.'
      );
    } finally {
      setCargando(false); // pase lo que pase, dejamos de "cargar"
    }
  };

  return (
    <div className="analisis">
      <div className="analisis-cabecera">
        <h2>Análisis de datos</h2>
        <button onClick={pedirAnalisis} disabled={cargando || gastos.length === 0}>
          {cargando ? 'Analizando…' : 'Analizar gastos'}
        </button>
      </div>

      {error && <p className="analisis-error">{error}</p>}

      {analisis && !error && (
        <div className="analisis-contenido">
          {/* ---- Cifras clave, a lo ancho ---- */}
          <div className="analisis-cifras">
            <div className="cifra">
              <span className="cifra-valor">{formatearEuros(analisis.total)}</span>
              <span className="cifra-etiqueta">Total</span>
            </div>
            <div className="cifra">
              <span className="cifra-valor">{analisis.num_gastos}</span>
              <span className="cifra-etiqueta">Gastos</span>
            </div>
            <div className="cifra">
              <span className="cifra-valor">{formatearEuros(analisis.gasto_medio)}</span>
              <span className="cifra-etiqueta">Gasto medio</span>
            </div>
            <div className="cifra">
              <span className="cifra-valor">{analisis.categoria_top}</span>
              <span className="cifra-etiqueta">Categoría top</span>
            </div>
            <div className="cifra">
              <span className="cifra-valor">{formatearEuros(analisis.ritmo_diario)}</span>
              <span className="cifra-etiqueta">Ritmo diario</span>
            </div>
            {analisis.prediccion_mes_siguiente !== null && (
              <div className="cifra cifra-prediccion">
                <span className="cifra-valor">
                  {formatearEuros(analisis.prediccion_mes_siguiente)}
                </span>
                <span className="cifra-etiqueta">
                  Previsión próximo mes ({analisis.tendencia})
                </span>
              </div>
            )}
          </div>

          {/* ---- Cuadrícula de tarjetas de gráficas ---- */}
          <div className="analisis-grid">

            {/* Tarjeta: evolución mensual */}
            <div className="tarjeta-grafica">
              <h3>Evolución mensual</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={Object.entries(analisis.por_mes).map(([mes, valor]) => ({
                    mes,
                    importe: valor,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" €" />
                  <Tooltip formatter={(valor) => [`${valor} €`, 'Gasto']} />
                  <Line
                    type="monotone"
                    dataKey="importe"
                    stroke="#4c1d95"
                    strokeWidth={3}
                    dot={{ fill: '#4c1d95', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tarjeta: reparto por categoría (donut) */}
            <div className="tarjeta-grafica">
              <h3>Reparto por categoría</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={Object.entries(analisis.por_categoria).map(
                      ([cat, datos]) => ({
                        nombre: cat,
                        valor: datos.total,
                      })
                    )}
                    dataKey="valor"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {Object.entries(analisis.por_categoria).map(([cat], i) => (
                      <Cell
                        key={cat}
                        fill={COLORES_TARTA[i % COLORES_TARTA.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(valor) => [
                      `${formatearEuros(Number(valor))}`,
                      'Total',
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tarjeta: gasto medio por día (barras) */}
            <div className="tarjeta-grafica">
              <h3>Gasto medio por día</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={ORDEN_DIAS.filter(
                    (dia) => dia in analisis.media_por_dia
                  ).map((dia) => ({
                    dia: DIAS_ES[dia],
                    media: analisis.media_por_dia[dia],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" €" />
                  <Tooltip formatter={(valor) => [`${valor} €`, 'Media']} />
                  <Bar dataKey="media" fill="#0f5e63" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tarjeta: top 3 + finde vs semana */}
            <div className="tarjeta-grafica">
              <h3>Top 3 gastos</h3>
              <ol className="analisis-top">
                {analisis.top3.map((g) => (
                  <li key={g.descripcion}>
                    {g.descripcion} — <strong>{formatearEuros(g.importe)}</strong>
                  </li>
                ))}
              </ol>

              <h3>¿Cuándo gastas más?</h3>
              <ul className="analisis-lista">
                <li>
                  <span>Entre semana</span>
                  <strong>
                    {formatearEuros(analisis.finde_vs_semana.entre_semana)}
                  </strong>
                </li>
                <li>
                  <span>Fin de semana</span>
                  <strong>
                    {formatearEuros(analisis.finde_vs_semana.fin_de_semana)}
                  </strong>
                </li>
              </ul>
            </div>
          </div>

          {/* ---- Reparto porcentual con barras CSS, a lo ancho ---- */}
          <h3 className="titulo-seccion">Reparto del gasto (%)</h3>
          <div className="analisis-barras">
            {Object.entries(analisis.porcentajes)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, pct]) => (
                <div key={cat} className={`grafico-fila cat-${cat}`}>
                  <span className="analisis-barra-etiqueta">{cat}</span>
                  <div className="analisis-barra-fondo">
                    <div className="analisis-barra" style={{ width: `${pct}%` }}>
                      {pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {acciones && <div className="analisis-acciones">{acciones}</div>}
    </div>
  );
}

export default AnalisisPanel;