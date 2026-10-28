// Formato español para importes y fechas

const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const formatoFecha = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// 1226 → "1.226,00 €"
export function formatearEuros(cantidad: number): string {
  return formatoEuros.format(cantidad);
}

// "2026-10-10" → "10 oct 2026"
// La fecha se parte a mano para no depender de la zona horaria
export function formatearFecha(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return formatoFecha.format(new Date(anio, mes - 1, dia));
}