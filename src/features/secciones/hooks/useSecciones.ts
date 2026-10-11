import { useQuery } from '@tanstack/react-query'
import { listarSecciones } from '../api'

export const seccionesQueryKeys = {
  todas: ['secciones'] as const,
  porGrado: (grado?: string) => ['secciones', { grado }] as const,
}

type GradoFiltro = string | undefined

export const useSecciones = (grado: GradoFiltro) => {
  return useQuery({
    queryKey: seccionesQueryKeys.porGrado(grado),
    queryFn: () => listarSecciones(grado),
  })
}
