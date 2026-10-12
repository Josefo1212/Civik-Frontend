import type { FilaPadron, ItemResultadoSync, ItemSync } from '../../domain/asistencia'
import { apiSend } from '../../api/client'

export type ItemAsistencia = {
  id_student: string
  state: string
}

export const listarPadron = async (eventoId: string): Promise<FilaPadron[]> => {
  return await apiSend<FilaPadron[]>(`/events/${eventoId}/attendance`, 'GET')
}

export const registrarAsistencia = async (
  eventoId: string,
  items: ItemAsistencia[],
): Promise<FilaPadron[]> => {
  return await apiSend<FilaPadron[]>(`/events/${eventoId}/attendance`, 'POST', { items })
}

export const sincronizarAsistencia = async (
  eventoId: string,
  items: ItemSync[],
): Promise<ItemResultadoSync[]> => {
  return await apiSend<ItemResultadoSync[]>(`/events/${eventoId}/attendance/sync`, 'POST', {
    items,
  })
}
