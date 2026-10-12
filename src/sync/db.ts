import Dexie from 'dexie'
import type { EntityTable } from 'dexie'
import type { EstadoAsistencia } from '../domain/asistencia'

export type ItemOutbox = {
  id: string
  id_event: string
  id_student: string
  state: EstadoAsistencia
  cambio_en: string
  creado_en: string
  error: string | null
}

export type EntradaCache = {
  clave: string
  valor: unknown
  actualizado_en: string
}

class CivikDb extends Dexie {
  outbox!: EntityTable<ItemOutbox, 'id'>
  cache!: EntityTable<EntradaCache, 'clave'>

  constructor() {
    super('civik')
    this.version(1).stores({
      outbox: '&id, id_event, id_student',
      cache: '&clave',
    })
  }
}

export const db = new CivikDb()
