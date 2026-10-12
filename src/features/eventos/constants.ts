import type { EstadoEvento, OrigenEvento, TipoEvento } from '../../domain/evento'

export const TIPOS_EVENTO: TipoEvento[] = [
  'PRACTICA_REGULAR',
  'PRACTICA_EXTRA',
  'PRESENTACION',
]

export const ETIQUETAS_TIPO: Record<TipoEvento, string> = {
  PRACTICA_REGULAR: 'Práctica regular',
  PRACTICA_EXTRA: 'Práctica extra',
  PRESENTACION: 'Presentación',
}

export const ETIQUETAS_ESTADO_EVENTO: Record<EstadoEvento, string> = {
  SCHEDULED: 'Programado',
  CANCELLED: 'Cancelado',
}

export const ETIQUETAS_ORIGEN: Record<OrigenEvento, string> = {
  AUTO: 'Automático',
  MANUAL: 'Manual',
}
