import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { contarPendientes, eliminar, encolar, listarPendientes, listarPendientesDeEvento } from './outbox'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

beforeEach(async () => {
  await db.outbox.clear()
})

describe('encolar', () => {
  it('crea un ítem con id de cliente y su instante de cambio', async () => {
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'PRESENTE' }])

    const [item] = await listarPendientes()
    expect(item.id).toMatch(UUID)
    expect(item.state).toBe('PRESENTE')
    expect(item.cambio_en).toEqual(expect.any(String))
  })

  it('reencolar el mismo par conserva el id y actualiza el estado', async () => {
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'PRESENTE' }])
    const [primero] = await listarPendientes()
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'AUSENTE' }])

    const items = await listarPendientes()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(primero.id)
    expect(items[0].state).toBe('AUSENTE')
  })

  it('separa pares distintos y eventos distintos', async () => {
    await encolar([
      { id_event: 'e1', id_student: 's1', state: 'PRESENTE' },
      { id_event: 'e1', id_student: 's2', state: 'AUSENTE' },
      { id_event: 'e2', id_student: 's1', state: 'PRESENTE' },
    ])

    expect(await contarPendientes()).toBe(3)
    expect(await listarPendientesDeEvento('e1')).toHaveLength(2)
    expect(await listarPendientesDeEvento('e2')).toHaveLength(1)
  })
})

describe('eliminar', () => {
  it('borra los ítems indicados', async () => {
    await encolar([
      { id_event: 'e1', id_student: 's1', state: 'PRESENTE' },
      { id_event: 'e1', id_student: 's2', state: 'AUSENTE' },
    ])
    const items = await listarPendientes()

    await eliminar([items[0].id])

    expect(await contarPendientes()).toBe(1)
    expect((await listarPendientes())[0].id).toBe(items[1].id)
  })
})
