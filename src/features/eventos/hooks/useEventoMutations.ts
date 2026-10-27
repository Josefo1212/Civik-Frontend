import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarEvento, crearEvento, generarPracticasAuto } from '../api'
import type { CrearEventoPayload } from '../api'
import { eventosQueryKeys } from './useEventos'

export const useEventoMutations = () => {
  const queryClient = useQueryClient()

  const invalidarEventos = () => {
    queryClient.invalidateQueries({ queryKey: eventosQueryKeys.todos })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearEventoPayload) => crearEvento(payload),
    onSuccess: invalidarEventos,
  })

  const cancelar = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => cancelarEvento(id, motivo),
    onSuccess: invalidarEventos,
  })

  const generarAuto = useMutation({
    mutationFn: (idLapse: string) => generarPracticasAuto(idLapse),
    onSuccess: invalidarEventos,
  })

  return { crear, cancelar, generarAuto }
}
