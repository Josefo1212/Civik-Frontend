import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import type { ItemResultadoSync } from '../domain/asistencia'
import { sincronizarAsistencia } from '../features/asistencia/api'
import { clavesCache, guardarCache, leerCache } from './cache'
import type { FilaPadron } from '../domain/asistencia'
import { db } from './db'
import type { ItemOutbox } from './db'
import { encolar, listarPendientes } from './outbox'
import {
  MENSAJE_CONFLICTO,
  agruparPorEvento,
  dividirPorResultado,
  esRechazoDeLote,
  observarPendientes,
  obtenerEstado,
  sincronizar,
} from './syncManager'

vi.mock('../features/asistencia/api')

const sincronizarMock = vi.mocked(sincronizarAsistencia)

const item = (over: Partial<ItemOutbox>): ItemOutbox => ({
  id: 'x',
  id_event: 'e1',
  id_student: 's1',
  state: 'PRESENTE',
  cambio_en: '2026-01-01T00:00:00.000Z',
  creado_en: '2026-01-01T00:00:00.000Z',
  error: null,
  ...over,
})

const fila = (over: Partial<FilaPadron>): FilaPadron => ({
  id_student: 's1',
  first_name: 'Ana',
  last_name: 'López',
  state: null,
  ...over,
})

beforeEach(async () => {
  await db.outbox.clear()
  await db.cache.clear()
  sincronizarMock.mockReset()
})

describe('agruparPorEvento', () => {
  it('agrupa por id_event', () => {
    const grupos = agruparPorEvento([
      item({ id: 'a', id_event: 'e1' }),
      item({ id: 'b', id_event: 'e1', id_student: 's2' }),
      item({ id: 'c', id_event: 'e2' }),
    ])

    expect(grupos.get('e1')).toHaveLength(2)
    expect(grupos.get('e2')).toHaveLength(1)
  })
})

describe('dividirPorResultado', () => {
  const resultados: ItemResultadoSync[] = [
    { id_student: 's1', resultado: 'aplicado', state: 'PRESENTE', updated_at: 'x' },
    { id_student: 's2', resultado: 'conflicto', state: 'AUSENTE', updated_at: 'x' },
  ]

  it('separa confirmados de conflictos', () => {
    const division = dividirPorResultado([item({ id: 'a' }), item({ id: 'b', id_student: 's2' })], resultados)

    expect(division.confirmados.map((i) => i.id)).toEqual(['a'])
    expect(division.conflictos.map((i) => i.id)).toEqual(['b'])
  })

  it('conserva el ítem si el servidor no lo devolvió', () => {
    const division = dividirPorResultado([item({ id: 'z', id_student: 's9' })], resultados)

    expect(division.confirmados).toHaveLength(0)
    expect(division.conflictos.map((i) => i.id)).toEqual(['z'])
  })
})

describe('sincronizar', () => {
  it('quita los confirmados, conserva el conflicto y actualiza la caché', async () => {
    await encolar([
      { id_event: 'e1', id_student: 's1', state: 'PRESENTE' },
      { id_event: 'e1', id_student: 's2', state: 'AUSENTE' },
    ])
    await guardarCache(clavesCache.padron('e1'), [
      fila({ id_student: 's1', state: 'AUSENTE' }),
      fila({ id_student: 's2', state: 'PRESENTE' }),
    ])
    sincronizarMock.mockResolvedValue([
      { id_student: 's1', resultado: 'aplicado', state: 'PRESENTE', updated_at: 'x' },
      { id_student: 's2', resultado: 'conflicto', state: 'PRESENTE', updated_at: 'x' },
    ])

    await sincronizar()

    const pendientes = await listarPendientes()
    expect(pendientes).toHaveLength(1)
    expect(pendientes[0].id_student).toBe('s2')
    expect(pendientes[0].error).toBe(MENSAJE_CONFLICTO)
    expect(obtenerEstado().conflictos).toBe(1)
    expect(obtenerEstado().pendientes).toBe(1)

    const cache = await leerCache<FilaPadron[]>(clavesCache.padron('e1'))
    expect(cache?.find((f) => f.id_student === 's1')?.state).toBe('PRESENTE')
  })

  it('envía el lote con id_student, state y cambio_en', async () => {
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'JUSTIFICADO' }])
    sincronizarMock.mockResolvedValue([
      { id_student: 's1', resultado: 'creado', state: 'JUSTIFICADO', updated_at: 'x' },
    ])

    await sincronizar()

    const [idEvent, items] = sincronizarMock.mock.calls[0]
    expect(idEvent).toBe('e1')
    expect(items[0]).toMatchObject({ id_student: 's1', state: 'JUSTIFICADO' })
    expect(items[0].cambio_en).toEqual(expect.any(String))
  })

  it('conserva todo sin marcar error por ítem si falla la red', async () => {
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'PRESENTE' }])
    sincronizarMock.mockRejectedValue(new ApiError('No se pudo conectar con el servidor', null))

    await sincronizar()

    const pendientes = await listarPendientes()
    expect(pendientes).toHaveLength(1)
    expect(pendientes[0].error).toBeNull()
    expect(obtenerEstado().ultimoError).toBe('No se pudo conectar con el servidor')
  })

  it('conserva el lote y marca error por ítem si el servidor lo rechaza', async () => {
    await encolar([
      { id_event: 'e1', id_student: 's1', state: 'PRESENTE' },
      { id_event: 'e1', id_student: 's2', state: 'AUSENTE' },
    ])
    sincronizarMock.mockRejectedValue(
      new ApiError('No se puede registrar asistencia en un evento cancelado', 409),
    )

    await sincronizar()

    const pendientes = await listarPendientes()
    expect(pendientes).toHaveLength(2)
    expect(
      pendientes.every(
        (item) => item.error === 'No se puede registrar asistencia en un evento cancelado',
      ),
    ).toBe(true)
    expect(obtenerEstado().ultimoError).toContain('evento cancelado')
  })
})

describe('esRechazoDeLote', () => {
  it('distingue el rechazo del servidor del fallo de red', () => {
    expect(esRechazoDeLote(new ApiError('inválido', 400))).toBe(true)
    expect(esRechazoDeLote(new ApiError('cancelado', 409))).toBe(true)
    expect(esRechazoDeLote(new ApiError('sin red', null))).toBe(false)
    expect(esRechazoDeLote(new ApiError('servidor caído', 500))).toBe(false)
    expect(esRechazoDeLote(new Error('otro'))).toBe(false)
  })
})

describe('observarPendientes', () => {
  it('actualiza el contador al encolar sin sincronizar', async () => {
    const desuscribir = observarPendientes()

    await encolar([{ id_event: 'e1', id_student: 's1', state: 'PRESENTE' }])

    await vi.waitFor(() => expect(obtenerEstado().pendientes).toBe(1))

    await db.outbox.clear()

    await vi.waitFor(() => expect(obtenerEstado().pendientes).toBe(0))

    desuscribir()
  })
})
