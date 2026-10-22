import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Evento } from '../../../domain/evento'
import type { FilaFusionada } from '../../../sync/fusionar'
import { fusionarPadron } from '../../../sync/fusionar'
import { db } from '../../../sync/db'
import type { ItemOutbox } from '../../../sync/db'
import { clavesCache, conRespaldo } from '../../../sync/cache'
import { asistenciaQueryKeys } from '../../asistencia/hooks/usePadron'
import { listarPadron } from '../../asistencia/api'

export type AsistenciaLapso = {
  porEstudiante: Map<string, Map<string, FilaFusionada>>
  cargando: boolean
  error: unknown
}

export const useAsistenciaLapso = (eventos: Evento[]): AsistenciaLapso => {
  const idsEventos = useMemo(() => eventos.map((evento) => evento.id), [eventos])

  const consultas = useQueries({
    queries: idsEventos.map((idEvento) => ({
      queryKey: asistenciaQueryKeys.porEvento(idEvento),
      queryFn: () => conRespaldo(clavesCache.padron(idEvento), () => listarPadron(idEvento)),
    })),
  })

  const padrones = useMemo(() => consultas.map((consulta) => consulta.data), [consultas])

  const pendientes = useLiveQuery(
    () =>
      idsEventos.length === 0
        ? Promise.resolve([] as ItemOutbox[])
        : db.outbox.where('id_event').anyOf(idsEventos).toArray(),
    [idsEventos],
  )

  const porEstudiante = useMemo(() => {
    const porEventoOutbox = new Map<string, ItemOutbox[]>()
    for (const item of pendientes ?? []) {
      const lista = porEventoOutbox.get(item.id_event) ?? []
      lista.push(item)
      porEventoOutbox.set(item.id_event, lista)
    }

    const mapa = new Map<string, Map<string, FilaFusionada>>()
    idsEventos.forEach((idEvento, indice) => {
      const fusionadas = fusionarPadron(
        padrones[indice] ?? [],
        porEventoOutbox.get(idEvento) ?? [],
      )
      for (const fila of fusionadas) {
        const porEvento = mapa.get(fila.id_student) ?? new Map<string, FilaFusionada>()
        porEvento.set(idEvento, fila)
        mapa.set(fila.id_student, porEvento)
      }
    })
    return mapa
  }, [idsEventos, padrones, pendientes])

  return {
    porEstudiante,
    cargando: consultas.some((consulta) => consulta.isLoading),
    error: consultas.find((consulta) => consulta.error)?.error ?? null,
  }
}
