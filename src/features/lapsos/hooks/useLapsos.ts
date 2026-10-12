import { useQuery } from '@tanstack/react-query'
import { listarLapsos } from '../api'

export const lapsosQueryKeys = {
  todos: ['lapsos'] as const,
}

export const useLapsos = () => {
  return useQuery({
    queryKey: lapsosQueryKeys.todos,
    queryFn: listarLapsos,
  })
}
