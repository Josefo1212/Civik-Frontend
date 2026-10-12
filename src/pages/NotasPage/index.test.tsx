import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FilaNota } from '../../domain/nota'
import type { Lapso } from '../../domain/lapso'
import type { Seccion } from '../../domain/seccion'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useNotas } from '../../features/notas/hooks/useNotas'
import NotasPage from './index'

vi.mock('../../features/lapsos/hooks/useLapsos', () => ({ useLapsos: vi.fn() }))
vi.mock('../../features/secciones/hooks/useSecciones', () => ({ useSecciones: vi.fn() }))
vi.mock('../../features/notas/hooks/useNotas', () => ({ useNotas: vi.fn() }))

const lapso: Lapso = {
  id: 'l1',
  school_year: 2026,
  lapse_number: 1,
  start_date: '2026-01-01',
  end_date: '2026-03-31',
  practice_day: 'MONDAY',
  status: 'ACTIVE',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

const seccion: Seccion = {
  id: 'sec1',
  grade_level: '1',
  section: 'A',
  shift: 'MATUTINO',
  active: true,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

const filas: FilaNota[] = [
  { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '19.5' },
  { id_student: 's2', first_name: 'Luis', last_name: 'Pérez', nota: null },
]

const memoLapsos = (data: Lapso[]) =>
  vi.mocked(useLapsos).mockReturnValue({ data, isLoading: false } as unknown as ReturnType<typeof useLapsos>)

const memoSecciones = (data: Seccion[]) =>
  vi
    .mocked(useSecciones)
    .mockReturnValue({ data, isLoading: false } as unknown as ReturnType<typeof useSecciones>)

const memoNotas = (valor: Record<string, unknown>) =>
  vi.mocked(useNotas).mockReturnValue(valor as unknown as ReturnType<typeof useNotas>)

beforeEach(() => {
  vi.clearAllMocks()
  memoLapsos([lapso])
  memoSecciones([seccion])
  memoNotas({ data: filas, isLoading: false, error: null, refetch: vi.fn() })
})

describe('NotasPage', () => {
  it('muestra la tabla y el aviso provisional al elegir lapso y sección', async () => {
    const usuario = userEvent.setup()
    render(<NotasPage />)

    expect(screen.getByText('Elegí un lapso y una sección para ver las notas.')).toBeInTheDocument()

    await usuario.selectOptions(screen.getByLabelText('selector-lapso'), lapso.id)
    await usuario.selectOptions(screen.getByLabelText('selector-seccion'), seccion.id)

    expect(screen.getByRole('status')).toHaveTextContent('provisional')
    expect(screen.getByText('19.5')).toBeInTheDocument()
    expect(screen.getByText('Sin nota')).toBeInTheDocument()
  })

  it('muestra el vacío cuando no hay secciones activas', () => {
    memoSecciones([])
    render(<NotasPage />)

    expect(screen.getByText('No hay secciones activas. Creá una en la pantalla de Secciones.')).toBeInTheDocument()
  })

  it('muestra el error de la consulta con reintento', async () => {
    memoNotas({ data: [], isLoading: false, error: new Error('No se encontró el lapso'), refetch: vi.fn() })
    const usuario = userEvent.setup()
    render(<NotasPage />)

    await usuario.selectOptions(screen.getByLabelText('selector-lapso'), lapso.id)
    await usuario.selectOptions(screen.getByLabelText('selector-seccion'), seccion.id)

    expect(screen.getByText('Error: No se encontró el lapso')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})
