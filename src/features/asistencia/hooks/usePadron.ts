import { useQuery } from '@tanstack/react-query'
import { listarPadron } from '../api'

export const asistenciaQueryKeys = {
  todas: ['asistencia'] as const,
  porEvento: (eventoId?: string) => ['asistencia', { eventoId }] as const,
}

export const usePadron = (eventoId: string | null) => {
  return useQuery({
    queryKey: asistenciaQueryKeys.porEvento(eventoId ?? undefined),
    queryFn: () => listarPadron(eventoId ?? ''),
    enabled: eventoId !== null,
  })
}
