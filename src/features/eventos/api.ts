import type { Evento } from '../../domain/evento'
import { apiSend } from '../../api/client'

export type CrearEventoPayload = {
  id_lapse: string
  event_date: string
  type_event: string
  event_name: string
}

export const listarEventos = async (idLapse?: string): Promise<Evento[]> => {
  const params = idLapse ? `?lapse_id=${encodeURIComponent(idLapse)}` : ''
  return await apiSend<Evento[]>(`/events${params}`, 'GET')
}

export const crearEvento = async (payload: CrearEventoPayload): Promise<Evento> => {
  return await apiSend<Evento>('/events', 'POST', payload)
}

export const cancelarEvento = async (id: string, motivo: string): Promise<Evento> => {
  return await apiSend<Evento>(`/events/${id}/cancel`, 'POST', { motivo })
}
