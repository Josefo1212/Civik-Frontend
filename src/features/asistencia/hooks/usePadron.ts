import { useQuery } from '@tanstack/react-query'
import { listarPadron } from '../api'
import { clavesCache, conRespaldo } from '../../../sync/cache'

export const asistenciaQueryKeys = {
  todas: ['asistencia'] as const,
  porEvento: (eventoId?: string) => ['asistencia', { eventoId }] as const,
}

export const usePadron = (eventoId: string | null) => {
  return useQuery({
    queryKey: asistenciaQueryKeys.porEvento(eventoId ?? undefined),
    queryFn: () =>
      conRespaldo(clavesCache.padron(eventoId ?? ''), () => listarPadron(eventoId ?? '')),
    enabled: eventoId !== null,
  })
}
