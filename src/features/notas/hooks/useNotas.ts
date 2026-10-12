import { useQuery } from '@tanstack/react-query'
import { listarNotas } from '../api'

export const notasQueryKeys = {
  todas: ['notas'] as const,
  porPar: (lapsoId?: string, seccionId?: string) => ['notas', { lapsoId, seccionId }] as const,
}

export const useNotas = (lapsoId: string | null, seccionId: string | null) => {
  return useQuery({
    queryKey: notasQueryKeys.porPar(lapsoId ?? undefined, seccionId ?? undefined),
    queryFn: () => listarNotas(lapsoId ?? '', seccionId ?? ''),
    enabled: lapsoId !== null && seccionId !== null,
  })
}
