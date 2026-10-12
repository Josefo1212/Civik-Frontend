import { useQuery } from '@tanstack/react-query'
import { listarSecciones } from '../api'

export const seccionesQueryKeys = {
  todas: ['secciones'] as const,
  porGrado: (grado?: string, incluirInactivas = false) =>
    ['secciones', { grado, incluirInactivas }] as const,
}

type GradoFiltro = string | undefined

export const useSecciones = (grado: GradoFiltro, incluirInactivas = false) => {
  return useQuery({
    queryKey: seccionesQueryKeys.porGrado(grado, incluirInactivas),
    queryFn: () => listarSecciones(grado, incluirInactivas),
  })
}
