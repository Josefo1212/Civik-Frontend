import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activarLapso, cerrarLapso, crearLapso, editarLapso, generarPracticasLapso, reprogramarDiaPractica } from '../api'
import type { CrearLapsoPayload, EditarLapsoPayload } from '../api'
import { lapsosQueryKeys } from './useLapsos'

export const useLapsoMutations = () => {
  const queryClient = useQueryClient()

  const invalidarLapsos = () => {
    queryClient.invalidateQueries({ queryKey: lapsosQueryKeys.todos })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearLapsoPayload) => crearLapso(payload),
    onSuccess: invalidarLapsos,
  })

  const editar = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarLapsoPayload }) => editarLapso(id, payload),
    onSuccess: invalidarLapsos,
  })

  const activar = useMutation({
    mutationFn: (id: string) => activarLapso(id),
    onSuccess: invalidarLapsos,
  })

  const cerrar = useMutation({
    mutationFn: (id: string) => cerrarLapso(id),
    onSuccess: invalidarLapsos,
  })

  const reprogramar = useMutation({
    mutationFn: ({ id, practice_day }: { id: string; practice_day: string }) => reprogramarDiaPractica(id, practice_day),
    onSuccess: invalidarLapsos,
  })

  const generarAuto = useMutation({
    mutationFn: (id: string) => generarPracticasLapso(id),
    onSuccess: invalidarLapsos,
  })

  return { crear, editar, activar, cerrar, reprogramar, generarAuto }
}
