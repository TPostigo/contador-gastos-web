import { useState, useEffect } from 'react';
import type { Gasto, Filtro } from './types';
import GastoForm from './GastoForm';
import GastoLista from './GastoLista';
import Resumen from './Resumen';
import FiltroCategoria from './FiltroCategoria';
import AnalisisPanel from './Analisis';
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
  type DatosUsuario,
} from './api';
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
      alert(err instanceof Error ? err.message : 'Error al guardar');
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
      alert(err instanceof Error ? err.message : 'Error al borrar');
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
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const cerrarSesion = () => {
    borrarToken();
    setAutenticado(false);
  };

  // Estado derivado: la lista filtrada se calcula, no se guarda
  const gastosFiltrados =
    filtro === 'todas' ? gastos : gastos.filter((g) => g.categoria === filtro);

  // Sin sesión → solo se ve la pantalla de entrada
  if (!autenticado) {
    return <AuthForm onAutenticado={() => setAutenticado(true)} />;
  }

  return (
    <div className="app">
      <div className="app-cabecera">
        <h1>💰 Contador de Gastos</h1>
        <button className="btn-salir" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div className="layout-superior">
        <GastoForm
          onAgregar={agregarGasto}
          onActualizar={actualizarGasto}
          gastoEnEdicion={gastoEnEdicion}
          onCancelarEdicion={() => setGastoEnEdicion(null)}
        />

        <div className="columna-derecha">
          <Resumen gastos={gastos} saldoInicial={usuario?.saldo_inicial ?? null} />
        </div>
      </div>

      <div className="acciones">
        <button className="btn-exportar" onClick={() => exportarCSV(gastos)}>
          📥 Exportar CSV
        </button>
      </div>

      <FiltroCategoria filtro={filtro} onCambiar={setFiltro} />
      {cargandoGastos ? (
        <p className="vacio">Cargando tus gastos…</p>
      ) : (
        <GastoLista
          gastos={gastosFiltrados}
          onBorrar={borrarGasto}
          onEditar={setGastoEnEdicion}
        />
      )}

      <AnalisisPanel gastos={gastos} />
    </div>
  );
}

export default App;