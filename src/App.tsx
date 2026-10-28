import { useState, useEffect } from 'react';
import type { Gasto, Filtro } from './types';
import GastoForm from './GastoForm';
import AnadirDinero from './AnadirDinero';
import GastoLista from './GastoLista';
import Resumen from './Resumen';
import FiltroCategoria from './FiltroCategoria';
import AnalisisPanel from './Analisis';
import AsistenteChat from './AsistenteChat';
import AuthForm from './AuthForm';
import { exportarCSV } from './exportarCSV';
import {
  leerToken,
  borrarToken,
  listarGastos,
  crearGasto,
  actualizarGasto as apiActualizarGasto,
  borrarGasto as apiBorrarGasto,
  misDatos,
  cambiarSaldo as apiCambiarSaldo,
  type DatosUsuario,
} from './api';
import logo from './assets/logo.png';
import './App.css';

function App() {
  // ¿Hay sesión? Si hay token guardado, arrancamos como autenticados
  const [autenticado, setAutenticado] = useState(leerToken() !== null);

  // Los gastos y los datos del usuario vienen de la API
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [usuario, setUsuario] = useState<DatosUsuario | null>(null);
  const [cargandoGastos, setCargandoGastos] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [gastoEnEdicion, setGastoEnEdicion] = useState<Gasto | null>(null);
  const [error, setError] = useState<string | null>(null); // avisos dentro de la página
  const [orden, setOrden] = useState<'fecha' | 'importe'>('fecha');

  // Al entrar (o cambiar de sesión), pedimos gastos y datos del usuario
  useEffect(() => {
    if (!autenticado) {
      setGastos([]);
      setUsuario(null);
      return;
    }
    setCargandoGastos(true);
    // Promise.all: lanza ambas peticiones EN PARALELO y espera a las dos
    Promise.all([listarGastos(), misDatos()])
      .then(([listaGastos, datosUsuario]) => {
        setGastos(listaGastos);
        setUsuario(datosUsuario);
      })
      .catch(() => {
        // Si el token caducó o la API falla, forzamos re-login
        borrarToken();
        setAutenticado(false);
      })
      .finally(() => setCargandoGastos(false));
  }, [autenticado]);

  const agregarGasto = async (gasto: Gasto) => {
    try {
      await crearGasto(gasto);       // 1º la base de datos
      setGastos([...gastos, gasto]); // 2º la copia local
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const borrarGasto = async (id: string) => {
    try {
      await apiBorrarGasto(id);
      setGastos(gastos.filter((g) => g.id !== id));
      if (gastoEnEdicion?.id === id) {
        setGastoEnEdicion(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar');
    }
  };

  const actualizarGasto = async (gastoActualizado: Gasto) => {
    try {
      await apiActualizarGasto(gastoActualizado);
      setGastos(
        gastos.map((g) => (g.id === gastoActualizado.id ? gastoActualizado : g))
      );
      setGastoEnEdicion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  // Suma dinero al saldo inicial: primero la API, después la copia local
  const anadirDinero = async (cantidad: number) => {
    if (!usuario) return;
    const nuevoSaldo = usuario.saldo_inicial + cantidad;
    await apiCambiarSaldo(nuevoSaldo);
    setUsuario({ ...usuario, saldo_inicial: nuevoSaldo });
  };

  const cerrarSesion = () => {
    borrarToken();
    setAutenticado(false);
  };

  // Estado derivado: la lista filtrada se calcula, no se guarda
  const gastosFiltrados =
    filtro === 'todas' ? gastos : gastos.filter((g) => g.categoria === filtro);

  // Orden: fecha más reciente primero, o importe más alto primero
  const gastosOrdenados = [...gastosFiltrados].sort((a, b) =>
    orden === 'fecha'
      ? b.fecha.localeCompare(a.fecha)
      : b.importe - a.importe
  );

  // Sin sesión → solo se ve la pantalla de entrada
  if (!autenticado) {
    return <AuthForm onAutenticado={() => setAutenticado(true)} />;
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-interior">
          <div className="app-marca-grupo">
            <img src={logo} alt="" className="app-logo" />
            <div className="app-identidad">
              <span className="app-marca">Contador de Gastos</span>
              {usuario && <span className="app-usuario">{usuario.email}</span>}
            </div>
          </div>
          <button className="btn-salir" onClick={cerrarSesion}>
            <span aria-hidden="true">⎋</span> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app">
        {error && (
          <div className="aviso-app" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Cerrar aviso">
              ×
            </button>
          </div>
        )}

        {/* ---- Resumen y alta de gastos, en una misma caja ---- */}
        <section className="seccion panel-resumen">
          <div className="layout-superior">
            <div className="bloque">
              <h3 className="bloque-titulo">Nuevo gasto</h3>
              <GastoForm
                onAgregar={agregarGasto}
                onActualizar={actualizarGasto}
                gastoEnEdicion={gastoEnEdicion}
                onCancelarEdicion={() => setGastoEnEdicion(null)}
              />
              <AnadirDinero onAnadirDinero={anadirDinero} />
            </div>

            <div className="columna-derecha">
              <Resumen
                gastos={gastos}
                saldoInicial={usuario?.saldo_inicial ?? null}
              />
            </div>
          </div>
        </section>

        {/* ---- Movimientos: lista con altura fija y desplazamiento ---- */}
        <section className="seccion">
          <div className="seccion-cabecera">
            <h2 className="seccion-titulo">Movimientos</h2>
            <span className="contador-movimientos">
              {gastosFiltrados.length} {gastosFiltrados.length === 1 ? 'movimiento' : 'movimientos'}
            </span>
            <FiltroCategoria filtro={filtro} onCambiar={setFiltro} />
            <div className="orden" role="group" aria-label="Ordenar movimientos">
              <button
                type="button"
                aria-pressed={orden === 'fecha'}
                className={orden === 'fecha' ? 'activo' : ''}
                onClick={() => setOrden('fecha')}
              >
                Fecha
              </button>
              <button
                type="button"
                aria-pressed={orden === 'importe'}
                className={orden === 'importe' ? 'activo' : ''}
                onClick={() => setOrden('importe')}
              >
                Importe
              </button>
            </div>
          </div>
          <div className="lista-scroll">
            {cargandoGastos ? (
              <p className="vacio">Cargando tus gastos…</p>
            ) : (
              <GastoLista
                gastos={gastosOrdenados}
                onBorrar={borrarGasto}
                onEditar={setGastoEnEdicion}
                filtroActivo={filtro !== 'todas'}
              />
            )}
          </div>
        </section>

        <AsistenteChat />

        <AnalisisPanel
          gastos={gastos}
          acciones={
            <button className="btn-exportar" onClick={() => exportarCSV(gastos)}>
              📥 Exportar CSV
            </button>
          }
        />
      </main>
    </>
  );
}

export default App;