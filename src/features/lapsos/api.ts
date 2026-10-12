import type { Lapso } from '../../domain/lapso'
import { apiSend } from '../../api/client'

export type CrearLapsoPayload = {
  school_year: string
  lapse_number: string
  start_date: string
  end_date: string
  practice_day: string
}

export const listarLapsos = async (): Promise<Lapso[]> => {
  return await apiSend<Lapso[]>('/lapses', 'GET')
}

export const crearLapso = async (payload: CrearLapsoPayload): Promise<Lapso> => {
  return await apiSend<Lapso>('/lapses', 'POST', payload)
}

export const activarLapso = async (id: string): Promise<Lapso> => {
  return await apiSend<Lapso>(`/lapses/${id}/activar`, 'POST')
}

export const cerrarLapso = async (id: string): Promise<Lapso> => {
  return await apiSend<Lapso>(`/lapses/${id}/cerrar`, 'POST')
}
