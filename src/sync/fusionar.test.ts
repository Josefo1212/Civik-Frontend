import { describe, expect, it } from 'vitest'
import type { FilaPadron } from '../domain/asistencia'
import type { ItemOutbox } from './db'
import { fusionarPadron } from './fusionar'

const fila = (over: Partial<FilaPadron> = {}): FilaPadron => ({
  id_student: 's1',
  first_name: 'Ana',
  last_name: 'López',
  state: null,
  ...over,
})

const pendiente = (over: Partial<ItemOutbox> = {}): ItemOutbox => ({
  id: 'p1',
  id_event: 'e1',
  id_student: 's1',
  state: 'PRESENTE',
  cambio_en: '2026-01-01T00:00:00.000Z',
  creado_en: '2026-01-01T00:00:00.000Z',
  error: null,
  ...over,
})

describe('fusionarPadron', () => {
  it('deja el estado del servidor cuando no hay pendiente', () => {
    const [resultado] = fusionarPadron([fila({ state: 'AUSENTE' })], [])

    expect(resultado.state).toBe('AUSENTE')
    expect(resultado.estadoSync).toBeNull()
  })

  it('el cambio local pisa al del servidor y queda pendiente', () => {
    const [resultado] = fusionarPadron(
      [fila({ state: 'AUSENTE' })],
      [pendiente({ state: 'PRESENTE' })],
    )

    expect(resultado.state).toBe('PRESENTE')
    expect(resultado.estadoSync).toBe('pendiente')
  })

  it('marca error cuando el pendiente falló', () => {
    const [resultado] = fusionarPadron(
      [fila()],
      [pendiente({ error: 'conflicto' })],
    )

    expect(resultado.estadoSync).toBe('error')
  })
})
