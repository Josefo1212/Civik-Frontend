import type { EstadoAsistencia } from '../domain/asistencia'
import { db } from './db'
import type { ItemOutbox } from './db'

export type CambioAsistencia = {
  id_event: string
  id_student: string
  state: EstadoAsistencia
}

export const encolar = async (cambios: CambioAsistencia[]): Promise<void> => {
  const ahora = new Date().toISOString()
  await db.transaction('rw', db.outbox, async () => {
    for (const cambio of cambios) {
      const existente = await db.outbox
        .where('id_event')
        .equals(cambio.id_event)
        .filter((item) => item.id_student === cambio.id_student)
        .first()

      if (existente) {
        await db.outbox.update(existente.id, {
          state: cambio.state,
          cambio_en: ahora,
          error: null,
        })
      } else {
        await db.outbox.add({
          id: crypto.randomUUID(),
          id_event: cambio.id_event,
          id_student: cambio.id_student,
          state: cambio.state,
          cambio_en: ahora,
          creado_en: ahora,
          error: null,
        })
      }
    }
  })
}

export const listarPendientes = (): Promise<ItemOutbox[]> => db.outbox.toArray()

export const listarPendientesDeEvento = (id_event: string): Promise<ItemOutbox[]> =>
  db.outbox.where('id_event').equals(id_event).toArray()

export const eliminar = async (ids: string[]): Promise<void> => {
  await db.outbox.bulkDelete(ids)
}

export const marcarError = async (id: string, mensaje: string): Promise<void> => {
  await db.outbox.update(id, { error: mensaje })
}

export const contarPendientes = (): Promise<number> => db.outbox.count()
