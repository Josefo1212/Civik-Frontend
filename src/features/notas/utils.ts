import type { EstadoLapso } from '../../domain/lapso'
import { AVISO_DEFINITIVA, AVISO_PROVISIONAL } from './constants'

export const esNotaProvisional = (estado: EstadoLapso): boolean => estado !== 'CLOSED'

export const textoEstadoNota = (estado: EstadoLapso): string =>
  esNotaProvisional(estado) ? AVISO_PROVISIONAL : AVISO_DEFINITIVA
