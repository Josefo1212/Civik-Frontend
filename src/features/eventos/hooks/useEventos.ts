import { useQuery } from '@tanstack/react-query'
import { listarEventos } from '../api'
import { clavesCache, conRespaldo } from '../../../sync/cache'

export const eventosQueryKeys = {
  todos: ['eventos'] as const,
  porLapso: (idLapse?: string) => ['eventos', { idLapse }] as const,
}

export const useEventos = (idLapse: string | null) => {
  return useQuery({
    queryKey: eventosQueryKeys.porLapso(idLapse ?? undefined),
    queryFn: () =>
      conRespaldo(clavesCache.eventos(idLapse ?? ''), () => listarEventos(idLapse ?? undefined)),
    enabled: idLapse !== null,
  })
}
