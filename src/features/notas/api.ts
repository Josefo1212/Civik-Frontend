import type { FilaNota } from '../../domain/nota'
import { apiSend } from '../../api/client'

export const listarNotas = async (lapsoId: string, seccionId: string): Promise<FilaNota[]> => {
  return await apiSend<FilaNota[]>(
    `/lapses/${lapsoId}/sections/${seccionId}/grades`,
    'GET',
  )
}
