import type { DiaSemana, EstadoLapso } from '../../domain/lapso'

export const DIAS_SEMANA: DiaSemana[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export const ETIQUETAS_DIA: Record<DiaSemana, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

export const ESTADOS_LAPSO: EstadoLapso[] = ['PLANNED', 'ACTIVE', 'CLOSED']

export const ETIQUETAS_ESTADO: Record<EstadoLapso, string> = {
  PLANNED: 'Planificado',
  ACTIVE: 'Activo',
  CLOSED: 'Cerrado',
}

export const NUMEROS_LAPSO = [1, 2, 3] as const
