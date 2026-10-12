import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { clavesCache, conRespaldo, guardarCache, leerCache } from './cache'
import { db } from './db'

beforeEach(async () => {
  await db.cache.clear()
  await db.outbox.clear()
})

describe('conRespaldo', () => {
  it('guarda el valor remoto en la caché', async () => {
    const remoto = vi.fn().mockResolvedValue([1, 2])
    const valor = await conRespaldo('clave', remoto)

    expect(valor).toEqual([1, 2])
    expect(await leerCache('clave')).toEqual([1, 2])
  })

  it('cae a la caché cuando falla la red', async () => {
    await guardarCache('clave', ['viejo'])
    const remoto = vi.fn().mockRejectedValue(new ApiError('sin conexión', null))

    expect(await conRespaldo('clave', remoto)).toEqual(['viejo'])
  })

  it('re-lanza si no hay nada cacheado', async () => {
    const remoto = vi.fn().mockRejectedValue(new ApiError('sin conexión', null))

    await expect(conRespaldo('clave', remoto)).rejects.toBeInstanceOf(ApiError)
  })

  it('re-lanza si el error no es de red', async () => {
    await guardarCache('clave', ['viejo'])
    const remoto = vi.fn().mockRejectedValue(new ApiError('no encontrado', 404))

    await expect(conRespaldo('clave', remoto)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('clavesCache', () => {
  it('arma claves por id', () => {
    expect(clavesCache.lapsos()).toBe('lapsos')
    expect(clavesCache.eventos('l1')).toBe('eventos:l1')
    expect(clavesCache.padron('e1')).toBe('padron:e1')
  })
})
