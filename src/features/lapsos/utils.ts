import type { Lapso } from '../../domain/lapso'
import { ETIQUETAS_ESTADO } from './constants'

export const etiquetaLapso = (lapso: Lapso): string =>
  `${lapso.school_year} · Lapso ${lapso.lapse_number} (${ETIQUETAS_ESTADO[lapso.status]})`

export const lapsoActivo = (lapsos: Lapso[]): Lapso | null =>
  lapsos.find((lapso) => lapso.status === 'ACTIVE') ?? null
