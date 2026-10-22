import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Evento } from '../../../domain/evento'
import { db } from '../../../sync/db'
import { encolar, marcarError } from '../../../sync/outbox'
import { listarPadron } from '../../asistencia/api'
import { useAsistenciaLapso } from './useAsistenciaLapso'

vi.mock('../../asistencia/api')

const listarPadronMock = vi.mocked(listarPadron)

const evento1: Evento = {
  id: 'e1',
  id_lapse: 'l1',
  event_date: '2026-04-05',
  type_event: 'PRACTICA_REGULAR',
  source: 'AUTO',
  event_name: 'Práctica 1',
  status: 'SCHEDULED',
  cancelled_reason: null,
  created_at: null,
  updated_at: null,
}

const evento2: Evento = {
  id: 'e2',
  id_lapse: 'l1',
  event_date: '2026-04-12',
  type_event: 'PRACTICA_REGULAR',
  source: 'AUTO',
  event_name: 'Práctica 2',
  status: 'SCHEDULED',
  cancelled_reason: null,
  created_at: null,
  updated_at: null,
}

const crearCliente = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const envoltorio = (cliente: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

beforeEach(async () => {
  await db.cache.clear()
  await db.outbox.clear()
  listarPadronMock.mockReset()
  listarPadronMock.mockImplementation(async (eventoId: string) => {
    if (eventoId === 'e1') {
      return [{ id_student: 's1', first_name: 'Ana', last_name: 'López', state: 'PRESENTE' }]
    }
    return [{ id_student: 's1', first_name: 'Ana', last_name: 'López', state: null }]
  })
})

describe('useAsistenciaLapso', () => {
  it('compone el estado del estudiante por cada evento del lapso', async () => {
    const { result } = renderHook(() => useAsistenciaLapso([evento1, evento2]), {
      wrapper: envoltorio(crearCliente()),
    })

    await waitFor(() => expect(result.current.cargando).toBe(false))

    const porEvento = result.current.porEstudiante.get('s1')
    expect(porEvento?.get('e1')?.state).toBe('PRESENTE')
    expect(porEvento?.get('e2')?.state).toBeNull()
  })

  it('fusiona una corrección encolada sobre el estado del servidor', async () => {
    await encolar([{ id_event: 'e2', id_student: 's1', state: 'JUSTIFICADO' }])

    const { result } = renderHook(() => useAsistenciaLapso([evento1, evento2]), {
      wrapper: envoltorio(crearCliente()),
    })

    await waitFor(() =>
      expect(result.current.porEstudiante.get('s1')?.get('e2')?.state).toBe('JUSTIFICADO'),
    )
    expect(result.current.porEstudiante.get('s1')?.get('e2')?.estadoSync).toBe('pendiente')
  })

  it('marca como error una corrección rechazada por el servidor', async () => {
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'AUSENTE' }])
    const items = await db.outbox.toArray()
    await marcarError(items[0].id, 'conflicto')

    const { result } = renderHook(() => useAsistenciaLapso([evento1, evento2]), {
      wrapper: envoltorio(crearCliente()),
    })

    await waitFor(() => expect(result.current.porEstudiante.get('s1')?.get('e1')?.estadoSync).toBe('error'))
  })

  it('no pide padrón cuando no hay eventos', async () => {
    const { result } = renderHook(() => useAsistenciaLapso([]), {
      wrapper: envoltorio(crearCliente()),
    })

    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(listarPadronMock).not.toHaveBeenCalled()
    expect(result.current.porEstudiante.size).toBe(0)
  })
})
