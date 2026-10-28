import type { Gasto } from './types';

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'contador-gastos-token';

// ---------- Gestión del token ----------

export function guardarToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function leerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function borrarToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------- Ayudante genérico de peticiones ----------

// Hace una petición añadiendo el token y gestionando errores comunes.
// <T> es un genérico: cada llamada declara qué tipo de dato espera recibir.
async function peticion<T>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const token = leerToken();

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        // Solo añadimos Authorization si tenemos token
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    // fetch solo lanza error cuando no hay conexión con el servidor
    throw new Error('No se pudo conectar con el servidor. Inténtalo de nuevo en un momento.');
  }

  if (!respuesta.ok) {
    // Intentamos leer el "detail" que manda FastAPI en los errores
    let mensaje = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo.detail) mensaje = cuerpo.detail;
    } catch {
      // el cuerpo no era JSON; nos quedamos con el mensaje genérico
    }
    throw new Error(mensaje);
  }

  // Los 204 (No Content) no traen cuerpo que parsear
  if (respuesta.status === 204) {
    return undefined as T;
  }

  return respuesta.json() as Promise<T>;
}

// ---------- Asistente de IA ----------

// Envía una pregunta al asistente y devuelve su respuesta en texto
export async function preguntarAsistente(pregunta: string): Promise<string> {
  const datos = await peticion<{ respuesta: string }>('/asistente', {
    method: 'POST',
    body: JSON.stringify({ pregunta }),
  });
  return datos.respuesta;
}

// ---------- Autenticación ----------

export async function registrar(
  email: string,
  password: string,
  saldoInicial: number
): Promise<void> {
  const datos = await peticion<{ token: string }>('/registro', {
    method: 'POST',
    body: JSON.stringify({ email, password, saldo_inicial: saldoInicial }),
  });
  guardarToken(datos.token);
}

export async function login(email: string, password: string): Promise<void> {
  const datos = await peticion<{ token: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  guardarToken(datos.token);
}

export interface DatosUsuario {
  email: string;
  saldo_inicial: number;
}

export async function misDatos(): Promise<DatosUsuario> {
  return peticion<DatosUsuario>('/yo');
}

// Fija el saldo inicial del usuario. La API recibe el total final, no una suma.
export async function cambiarSaldo(saldoInicial: number): Promise<void> {
  await peticion<{ saldo_inicial: number }>('/saldo', {
    method: 'PUT',
    body: JSON.stringify({ saldo_inicial: saldoInicial }),
  });
}

// ---------- Gastos (los usaremos en la fase 4B) ----------

export async function listarGastos(): Promise<Gasto[]> {
  return peticion<Gasto[]>('/gastos');
}

export async function crearGasto(gasto: Gasto): Promise<Gasto> {
  return peticion<Gasto>('/gastos', {
    method: 'POST',
    body: JSON.stringify(gasto),
  });
}

export async function actualizarGasto(gasto: Gasto): Promise<Gasto> {
  return peticion<Gasto>(`/gastos/${gasto.id}`, {
    method: 'PUT',
    body: JSON.stringify(gasto),
  });
}

export async function borrarGasto(id: string): Promise<void> {
  return peticion<void>(`/gastos/${id}`, {
    method: 'DELETE',
  });
}