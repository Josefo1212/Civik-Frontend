import { useQuery } from '@tanstack/react-query'
import { listarEventos } from '../api'

export const eventosQueryKeys = {
  todos: ['eventos'] as const,
  porLapso: (idLapse?: string) => ['eventos', { idLapse }] as const,
}

export const useEventos = (idLapse: string | null) => {
  return useQuery({
    queryKey: eventosQueryKeys.porLapso(idLapse ?? undefined),
    queryFn: () => listarEventos(idLapse ?? undefined),
    enabled: idLapse !== null,
  })
}
