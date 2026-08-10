import { useState } from 'react';
import * as api from './api';

interface AuthFormProps {
  onAutenticado: () => void; // avisamos a App cuando el login/registro funciona
}

function AuthForm({ onAutenticado }: AuthFormProps) {
  // ¿Estamos en modo login o registro?
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Rellena email y contraseña');
      return;
    }

    setCargando(true);
    try {
      if (modo === 'login') {
        await api.login(email.trim(), password);
      } else {
        await api.registrar(email.trim(), password, Number(saldoInicial) || 0);
      }
      onAutenticado(); // el token ya está guardado; App puede continuar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth">
      <h1>💰 Contador de Gastos</h1>

      <form onSubmit={manejarSubmit} className="auth-form">
        <h2>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* El saldo inicial solo aparece al registrarse */}
        {modo === 'registro' && (
          <input
            type="number"
            placeholder="¿Cuánto dinero tienes ahora? (€)"
            step="0.01"
            min="0"
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
          />
        )}

        {error && <p className="auth-error">⚠️ {error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando
            ? 'Un momento…'
            : modo === 'login'
            ? 'Entrar'
            : 'Registrarme'}
        </button>

        <p className="auth-cambio">
          {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            className="auth-enlace"
            onClick={() => {
              setModo(modo === 'login' ? 'registro' : 'login');
              setError(null);
            }}
          >
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default AuthForm;