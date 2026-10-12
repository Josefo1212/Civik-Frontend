import { ApiError } from '../api/client'
import { db } from './db'

export const clavesCache = {
  lapsos: () => 'lapsos',
  eventos: (lapsoId: string) => `eventos:${lapsoId}`,
  padron: (eventoId: string) => `padron:${eventoId}`,
}

export const guardarCache = async (clave: string, valor: unknown): Promise<void> => {
  await db.cache.put({ clave, valor, actualizado_en: new Date().toISOString() })
}

export const leerCache = async <T>(clave: string): Promise<T | null> => {
  const entrada = await db.cache.get(clave)
  return entrada ? (entrada.valor as T) : null
}

const esFalloDeRed = (error: unknown): boolean => error instanceof ApiError && error.status === null

export const conRespaldo = async <T>(clave: string, remoto: () => Promise<T>): Promise<T> => {
  try {
    const valor = await remoto()
    await guardarCache(clave, valor)
    return valor
  } catch (error) {
    if (!esFalloDeRed(error)) throw error
    const cacheado = await leerCache<T>(clave)
    if (cacheado === null) throw error
    return cacheado
  }
}
