import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrarAsistencia } from '../api'
import type { ItemAsistencia } from '../api'
import { asistenciaQueryKeys } from './usePadron'

export const useRegistrarAsistencia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventoId, items }: { eventoId: string; items: ItemAsistencia[] }) =>
      registrarAsistencia(eventoId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaQueryKeys.todas })
    },
  })
}
