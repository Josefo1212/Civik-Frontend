import type { EstadoAsistencia } from '../../domain/asistencia'

export const ESTADOS_ASISTENCIA: EstadoAsistencia[] = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO']

export const ETIQUETAS_ESTADO_ASISTENCIA: Record<EstadoAsistencia, string> = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  JUSTIFICADO: 'Justificado',
}

export const SIN_MARCAR = 'Sin marcar'
