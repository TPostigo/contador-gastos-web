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

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      // Solo añadimos Authorization si tenemos token
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

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