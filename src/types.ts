// ============================================
// Tipos de la aplicación Contador de Gastos
// ============================================

// Tipo union: la categoría solo puede ser uno de estos valores
export type Categoria = 'comida' | 'casa' | 'ocio' | 'transporte' | 'otros';

// Interface: define la "forma" que debe tener todo gasto
export interface Gasto {
  id: string;          // identificador único
  descripcion: string;
  importe: number;
  categoria: Categoria;
  fecha: string;       // formato 'YYYY-MM-DD'
}

// Array con todas las categorías, para pintar selects y filtros
export const CATEGORIAS: Categoria[] = ['comida', 'casa', 'ocio', 'transporte', 'otros'];

// El filtro admite cualquier Categoria O el valor especial 'todas'
export type Filtro = Categoria | 'todas';

// ============================================
// Tipos de la respuesta de la API de análisis
// ============================================

export interface ResumenCategoria {
  total: number;
  media: number;
  cuantos: number;
}

export interface Analisis {
  total: number;
  num_gastos: number;
  gasto_medio: number;
  por_categoria: Record<string, ResumenCategoria>;
  por_mes: Record<string, number>;
  media_por_dia: Record<string, number>;
  top3: { descripcion: string; importe: number }[];
  porcentajes: Record<string, number>;
  finde_vs_semana: { fin_de_semana: number; entre_semana: number };
  categoria_top: string;
  ritmo_diario: number;
  prediccion_mes_siguiente: number | null;
  tendencia: string | null;
}