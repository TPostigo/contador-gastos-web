import type { Gasto } from './types';

export function exportarCSV(gastos: Gasto[]): void {
  // 1. Cabecera del CSV
  const cabecera = 'descripcion;importe;categoria;fecha';

  // 2. Una línea por gasto. Usamos ; como separador porque Excel
  //    en español usa la coma como decimal (3,50 €) y se liaría.
  const lineas = gastos.map(
    (g) => `${g.descripcion};${g.importe};${g.categoria};${g.fecha}`
  );

  // 3. Unimos todo con saltos de línea
  const contenido = [cabecera, ...lineas].join('\n');

  // 4. Blob: un "archivo en memoria". El \uFEFF es el BOM,
  //    una marca que hace que Excel reconozca bien los acentos (UTF-8)
  const blob = new Blob(['\uFEFF' + contenido], {
    type: 'text/csv;charset=utf-8;',
  });

  // 5. Truco estándar de descarga: creamos un enlace invisible,
  //    lo apuntamos al blob, hacemos clic virtual y lo eliminamos
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'gastos.csv';
  enlace.click();
  URL.revokeObjectURL(url); // liberamos la memoria del blob
}