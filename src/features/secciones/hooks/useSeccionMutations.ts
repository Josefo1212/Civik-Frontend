import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  crearSeccion,
  darDeBajaSeccion,
  editarSeccion,
  eliminarSeccion,
  reactivarSeccion,
} from '../api'
import type { CrearSeccionPayload, EditarSeccionPayload } from '../api'
import { seccionesQueryKeys } from './useSecciones'

export const useSeccionMutations = () => {
  const queryClient = useQueryClient()

  const invalidarSecciones = () => {
    queryClient.invalidateQueries({ queryKey: seccionesQueryKeys.todas })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearSeccionPayload) => crearSeccion(payload),
    onSuccess: invalidarSecciones,
  })

  const editar = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarSeccionPayload }) =>
      editarSeccion(id, payload),
    onSuccess: invalidarSecciones,
  })

  const darDeBaja = useMutation({
    mutationFn: (id: string) => darDeBajaSeccion(id),
    onSuccess: invalidarSecciones,
  })

  const reactivar = useMutation({
    mutationFn: (id: string) => reactivarSeccion(id),
    onSuccess: invalidarSecciones,
  })

  const eliminar = useMutation({
    mutationFn: (id: string) => eliminarSeccion(id),
    onSuccess: invalidarSecciones,
  })

  return {
    crear,
    editar,
    darDeBaja,
    reactivar,
    eliminar,
  }
}
