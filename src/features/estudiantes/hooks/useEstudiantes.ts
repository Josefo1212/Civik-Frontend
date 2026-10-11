import { useQuery } from '@tanstack/react-query'
import { listarPorSeccion } from '../api'

export const estudiantesQueryKeys = {
  todas: ['estudiantes'] as const,
  porSeccion: (seccionId: string, incluirInactivas: boolean) =>
    ['estudiantes', { seccionId, incluirInactivas }] as const,
}

export const useEstudiantes = (seccionId: string | null, incluirInactivas: boolean) => {
  return useQuery({
    queryKey: estudiantesQueryKeys.porSeccion(seccionId ?? '', incluirInactivas),
    queryFn: () => {
      if (seccionId === null) return Promise.resolve([])
      return listarPorSeccion(seccionId, incluirInactivas)
    },
    enabled: seccionId !== null,
  })
}
