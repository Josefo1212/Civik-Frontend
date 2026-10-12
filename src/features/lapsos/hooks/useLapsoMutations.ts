import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activarLapso, cerrarLapso, crearLapso } from '../api'
import type { CrearLapsoPayload } from '../api'
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

  const activar = useMutation({
    mutationFn: (id: string) => activarLapso(id),
    onSuccess: invalidarLapsos,
  })

  const cerrar = useMutation({
    mutationFn: (id: string) => cerrarLapso(id),
    onSuccess: invalidarLapsos,
  })

  return { crear, activar, cerrar }
}
