import type { Seccion } from '../../domain/seccion'
import { ETIQUETAS_TURNO } from './constants'

export const etiquetaSeccion = (seccion: Seccion): string => {
  const turno = ETIQUETAS_TURNO[seccion.shift as keyof typeof ETIQUETAS_TURNO] ?? seccion.shift
  return `${seccion.grade_level} ${seccion.section} — ${turno}`
}
