import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Evento } from '../../domain/evento'
import type { Lapso } from '../../domain/lapso'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useLapsoMutations } from '../../features/lapsos/hooks/useLapsoMutations'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useEventoMutations } from '../../features/eventos/hooks/useEventoMutations'
import EventosPage from './index'

vi.mock('../../features/lapsos/hooks/useLapsos', () => ({ useLapsos: vi.fn() }))
vi.mock('../../features/lapsos/hooks/useLapsoMutations', () => ({ useLapsoMutations: vi.fn() }))
vi.mock('../../features/eventos/hooks/useEventos', () => ({ useEventos: vi.fn() }))
vi.mock('../../features/eventos/hooks/useEventoMutations', () => ({ useEventoMutations: vi.fn() }))

const lapso: Lapso = {
  id: 'l1',
  school_year: 2026,
  lapse_number: 1,
  start_date: '2026-09-01',
  end_date: '2026-12-15',
  practice_day: 'MONDAY',
  status: 'ACTIVE',
  created_at: '',
  updated_at: '',
}

const evento: Evento = {
  id: 'e1',
  id_lapse: 'l1',
  event_date: '2026-09-14',
  type_event: 'PRACTICA_REGULAR',
  source: 'AUTO',
  event_name: 'Práctica regular',
  status: 'SCHEDULED',
  cancelled_reason: null,
  created_at: null,
  updated_at: null,
}

const mutacion = () => ({ mutate: vi.fn(), isPending: false })

const cancelarMock = vi.fn(
  (
    _variables: { id: string; motivo: string },
    opciones?: { onError?: (error: Error) => void },
  ) => {
    opciones?.onError?.(new Error('No se puede cancelar el evento: tiene asistencia registrada'))
  },
)

const envoltorio = () => {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

const cancelarEvento = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.click(screen.getByRole('button', { name: 'cancelar-evento-e1' }))
  await usuario.type(screen.getByLabelText('motivo-cancelacion'), 'Lluvia')
  await usuario.click(screen.getByRole('button', { name: 'confirmar-cancelacion' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useLapsos).mockReturnValue({
    data: [lapso],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useLapsos>)
  vi.mocked(useEventos).mockReturnValue({
    data: [evento],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useEventos>)
  vi.mocked(useLapsoMutations).mockReturnValue({
    crear: mutacion(),
    editar: mutacion(),
    activar: mutacion(),
    cerrar: mutacion(),
    reprogramar: mutacion(),
    generarAuto: mutacion(),
  } as unknown as ReturnType<typeof useLapsoMutations>)
  vi.mocked(useEventoMutations).mockReturnValue({
    crear: mutacion(),
    cancelar: { mutate: cancelarMock, isPending: false },
    generarAuto: mutacion(),
  } as unknown as ReturnType<typeof useEventoMutations>)
})

describe('EventosPage — cancelación', () => {
  it('muestra el mensaje del backend cuando rechaza la cancelación', async () => {
    const usuario = userEvent.setup()
    render(<EventosPage />, { wrapper: envoltorio() })

    await cancelarEvento(usuario)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se puede cancelar el evento: tiene asistencia registrada',
    )
    expect(screen.getByText('Programado')).toBeInTheDocument()
  })

  it('limpia el error al empezar otra cancelación', async () => {
    const usuario = userEvent.setup()
    render(<EventosPage />, { wrapper: envoltorio() })

    await cancelarEvento(usuario)
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'deshacer-cancelacion' }))
    await usuario.click(screen.getByRole('button', { name: 'cancelar-evento-e1' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
