import { useMutation, useQueryClient } from '@tanstack/react-query'
import { encolar } from '../../../sync/outbox'
import type { CambioAsistencia } from '../../../sync/outbox'
import { sincronizar } from '../../../sync/syncManager'
import { asistenciaQueryKeys } from './usePadron'

export const useGuardarAsistencia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cambios: CambioAsistencia[]) => {
      await encolar(cambios)
      if (navigator.onLine) {
        await sincronizar()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asistenciaQueryKeys.todas })
    },
  })
}
