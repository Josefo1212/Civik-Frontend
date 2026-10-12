import { useQuery } from '@tanstack/react-query'
import { listarLapsos } from '../api'
import { clavesCache, conRespaldo } from '../../../sync/cache'

export const lapsosQueryKeys = {
  todos: ['lapsos'] as const,
}

export const useLapsos = () => {
  return useQuery({
    queryKey: lapsosQueryKeys.todos,
    queryFn: () => conRespaldo(clavesCache.lapsos(), listarLapsos),
  })
}
