import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  crearEnSeccion,
  darDeBaja,
  editarEstudiante,
  reactivar,
} from '../api'
import type { CrearEstudiantePayload, EditarEstudiantePayload } from '../api'
import { estudiantesQueryKeys } from './useEstudiantes'

export const useEstudianteMutations = () => {
  const queryClient = useQueryClient()

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: estudiantesQueryKeys.todas })
  }

  const crear = useMutation({
    mutationFn: ({ seccionId, payload }: { seccionId: string; payload: CrearEstudiantePayload }) =>
      crearEnSeccion(seccionId, payload),
    onSuccess: invalidar,
  })

  const editar = useMutation({
    mutationFn: ({ estudianteId, payload }: { estudianteId: string; payload: EditarEstudiantePayload }) =>
      editarEstudiante(estudianteId, payload),
    onSuccess: invalidar,
  })

  const baja = useMutation({
    mutationFn: (estudianteId: string) => darDeBaja(estudianteId),
    onSuccess: invalidar,
  })

  const reactivarMut = useMutation({
    mutationFn: (estudianteId: string) => reactivar(estudianteId),
    onSuccess: invalidar,
  })

  return { crear, editar, baja, reactivar: reactivarMut }
}
