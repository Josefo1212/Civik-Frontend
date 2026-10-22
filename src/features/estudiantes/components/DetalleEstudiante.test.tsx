import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Estudiante } from '../../../domain/estudiante'
import type { Evento } from '../../../domain/evento'
import type { FilaNota } from '../../../domain/nota'
import type { FilaFusionada } from '../../../sync/fusionar'
import { listarNotas } from '../../notas/api'
import DetalleEstudiante from './DetalleEstudiante'

vi.mock('../../notas/api')

const listarNotasMock = vi.mocked(listarNotas)

const estudiante: Estudiante = {
  id: 's1',
  id_section: 'sec1',
  first_name: 'Ana',
  last_name: 'López',
  phone: null,
  active: true,
  created_at: '',
  updated_at: '',
}

const evento: Evento = {
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

const filaAsistencia: FilaFusionada = {
  id_student: 's1',
  first_name: 'Ana',
  last_name: 'López',
  state: 'PRESENTE',
  estadoSync: null,
}

const nota: FilaNota = {
  id_student: 's1',
  first_name: 'Ana',
  last_name: 'López',
  nota: '18.50',
  es_override: false,
}

const crearCliente = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const envoltorio = (cliente: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

beforeEach(() => {
  listarNotasMock.mockReset()
  listarNotasMock.mockResolvedValue([nota])
})

describe('DetalleEstudiante', () => {
  it('muestra la asistencia por evento y la nota del estudiante', async () => {
    render(
      <DetalleEstudiante
        estudiante={estudiante}
        lapsoId="l1"
        estadoLapso="ACTIVE"
        eventos={[evento]}
        asistencia={new Map([['e1', filaAsistencia]])}
        onCorregir={vi.fn()}
      />,
      { wrapper: envoltorio(crearCliente()) },
    )

    expect(await screen.findByText('18.50')).toBeInTheDocument()
    expect(screen.getByText('Práctica 1')).toBeInTheDocument()
  })

  it('pide las notas de la sección del estudiante', async () => {
    render(
      <DetalleEstudiante
        estudiante={estudiante}
        lapsoId="l1"
        estadoLapso="ACTIVE"
        eventos={[evento]}
        asistencia={new Map()}
        onCorregir={vi.fn()}
      />,
      { wrapper: envoltorio(crearCliente()) },
    )

    await screen.findByText('18.50')
    expect(listarNotasMock).toHaveBeenCalledWith('l1', 'sec1')
  })

  it('propaga la corrección con el evento y el estado elegidos', async () => {
    const onCorregir = vi.fn()
    const usuario = userEvent.setup()
    render(
      <DetalleEstudiante
        estudiante={estudiante}
        lapsoId="l1"
        estadoLapso="ACTIVE"
        eventos={[evento]}
        asistencia={new Map([['e1', filaAsistencia]])}
        onCorregir={onCorregir}
      />,
      { wrapper: envoltorio(crearCliente()) },
    )

    await screen.findByText('Práctica 1')
    await usuario.click(screen.getByRole('radio', { name: 'AUSENTE-s1-e1' }))
    expect(onCorregir).toHaveBeenCalledWith('e1', 'AUSENTE')
  })

  it('avisa cuando no hay lapso elegido', () => {
    render(
      <DetalleEstudiante
        estudiante={estudiante}
        lapsoId={null}
        estadoLapso="ACTIVE"
        eventos={[]}
        asistencia={new Map()}
        onCorregir={vi.fn()}
      />,
      { wrapper: envoltorio(crearCliente()) },
    )
    expect(screen.getByText(/Elegí un lapso/i)).toBeInTheDocument()
  })
})
