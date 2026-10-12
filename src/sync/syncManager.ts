import { liveQuery } from 'dexie'
import { ApiError } from '../api/client'
import { sincronizarAsistencia } from '../features/asistencia/api'
import type { FilaPadron, ItemResultadoSync, ItemSync } from '../domain/asistencia'
import { clavesCache, guardarCache, leerCache } from './cache'
import type { ItemOutbox } from './db'
import { contarPendientes, eliminar, listarPendientes, marcarError } from './outbox'

export const MENSAJE_CONFLICTO = 'El servidor tiene una versión más nueva; refrescá para verla'

export const agruparPorEvento = (items: ItemOutbox[]): Map<string, ItemOutbox[]> => {
  const grupos = new Map<string, ItemOutbox[]>()
  for (const item of items) {
    const grupo = grupos.get(item.id_event) ?? []
    grupo.push(item)
    grupos.set(item.id_event, grupo)
  }
  return grupos
}

export const aItemSync = (item: ItemOutbox): ItemSync => ({
  id_student: item.id_student,
  state: item.state,
  cambio_en: item.cambio_en,
})

export type Division = {
  confirmados: ItemOutbox[]
  conflictos: ItemOutbox[]
}

export const dividirPorResultado = (
  items: ItemOutbox[],
  resultados: ItemResultadoSync[],
): Division => {
  const porEstudiante = new Map(resultados.map((resultado) => [resultado.id_student, resultado]))
  const confirmados: ItemOutbox[] = []
  const conflictos: ItemOutbox[] = []

  for (const item of items) {
    const resultado = porEstudiante.get(item.id_student)
    if (resultado && resultado.resultado !== 'conflicto') {
      confirmados.push(item)
    } else {
      conflictos.push(item)
    }
  }

  return { confirmados, conflictos }
}

const aplicarAlCache = async (
  id_event: string,
  resultados: ItemResultadoSync[],
): Promise<void> => {
  const clave = clavesCache.padron(id_event)
  const padron = await leerCache<FilaPadron[]>(clave)
  if (padron === null) return

  const porEstudiante = new Map(resultados.map((resultado) => [resultado.id_student, resultado]))
  const actualizado = padron.map((fila) => {
    const resultado = porEstudiante.get(fila.id_student)
    return resultado ? { ...fila, state: resultado.state } : fila
  })
  await guardarCache(clave, actualizado)
}

export type SyncEstado = {
  pendientes: number
  sincronizando: boolean
  conflictos: number
  ultimoError: string | null
  enLinea: boolean
}

let estado: SyncEstado = {
  pendientes: 0,
  sincronizando: false,
  conflictos: 0,
  ultimoError: null,
  enLinea: true,
}

const oyentes = new Set<() => void>()

const emitir = (): void => {
  for (const oyente of oyentes) oyente()
}

export const suscribir = (oyente: () => void): (() => void) => {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

export const obtenerEstado = (): SyncEstado => estado

const setEstado = (parcial: Partial<SyncEstado>): void => {
  estado = { ...estado, ...parcial }
  emitir()
}

export const refrescarPendientes = async (): Promise<void> => {
  setEstado({ pendientes: await contarPendientes() })
}

export const observarPendientes = (): (() => void) => {
  const suscripcion = liveQuery(() => contarPendientes()).subscribe({
    next: (pendientes) => setEstado({ pendientes }),
    error: () => undefined,
  })
  return () => suscripcion.unsubscribe()
}

export const setEnLinea = (enLinea: boolean): void => {
  setEstado({ enLinea })
}

const ejecutar = async (): Promise<void> => {
  const items = await listarPendientes()
  if (items.length === 0) {
    setEstado({ ultimoError: null })
    return
  }

  setEstado({ sincronizando: true, ultimoError: null })
  let conflictos = 0

  try {
    for (const [id_event, grupo] of agruparPorEvento(items)) {
      const resultados = await sincronizarAsistencia(id_event, grupo.map(aItemSync))
      const division = dividirPorResultado(grupo, resultados)

      if (division.confirmados.length > 0) {
        await eliminar(division.confirmados.map((item) => item.id))
      }
      for (const item of division.conflictos) {
        await marcarError(item.id, MENSAJE_CONFLICTO)
      }
      conflictos += division.conflictos.length
      await aplicarAlCache(id_event, resultados)
    }
    setEstado({ conflictos })
  } catch (error) {
    const mensaje = error instanceof ApiError ? error.message : 'No se pudo sincronizar'
    setEstado({ ultimoError: mensaje })
  } finally {
    setEstado({ sincronizando: false })
    await refrescarPendientes()
  }
}

let enCurso: Promise<void> | null = null

export const sincronizar = (): Promise<void> => {
  if (enCurso === null) {
    enCurso = ejecutar().finally(() => {
      enCurso = null
    })
  }
  return enCurso
}
