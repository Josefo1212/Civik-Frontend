import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Estudiante } from '../../domain/estudiante'
import type { Lapso } from '../../domain/lapso'
import type { Seccion } from '../../domain/seccion'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import DashboardPage from './index'

vi.mock('../../features/lapsos/hooks/useLapsos', () => ({ useLapsos: vi.fn() }))
vi.mock('../../features/secciones/hooks/useSecciones', () => ({ useSecciones: vi.fn() }))
vi.mock('../../features/estudiantes/hooks/useEstudiantes', () => ({
  useEstudiantesGlobal: vi.fn(),
}))

const lapsoActivo: Lapso = {
  id: 'l1',
  school_year: 2026,
  lapse_number: 2,
  start_date: '2026-04-01',
  end_date: '2026-06-30',
  practice_day: 'SATURDAY',
  status: 'ACTIVE',
  created_at: '',
  updated_at: '',
}

const seccionA: Seccion = {
  id: 'sec1',
  grade_level: '1ro',
  section: 'A',
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
}

const seccionB: Seccion = {
  id: 'sec2',
  grade_level: '2do',
  section: 'B',
  shift: 'VESPERTINO',
  active: true,
  created_at: '',
  updated_at: '',
}

const seccionBaja: Seccion = {
  id: 'sec3',
  grade_level: '3ro',
  section: 'C',
  shift: 'MATUTINO',
  active: false,
  created_at: '',
  updated_at: '',
}

const estudiantesDe = (idSeccion: string, cantidad: number, activo = true): Estudiante[] =>
  Array.from({ length: cantidad }, (_, i) => ({
    id: `${idSeccion}-${i}`,
    id_section: idSeccion,
    first_name: 'N',
    last_name: 'A',
    phone: null,
    active: activo,
    created_at: '',
    updated_at: '',
  }))

const refetchLapsosFn = vi.fn()
const refetchSeccionesFn = vi.fn()
const refetchEstudiantesFn = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useLapsos).mockReturnValue({
    data: [lapsoActivo],
    isLoading: false,
    error: null,
    refetch: refetchLapsosFn,
  } as unknown as ReturnType<typeof useLapsos>)
  vi.mocked(useSecciones).mockReturnValue({
    data: [seccionA, seccionB, seccionBaja],
    isLoading: false,
    error: null,
    refetch: refetchSeccionesFn,
  } as unknown as ReturnType<typeof useSecciones>)
  vi.mocked(useEstudiantesGlobal).mockReturnValue({
    data: [...estudiantesDe('sec1', 3), ...estudiantesDe('sec2', 1), ...estudiantesDe('sec2', 2, false)],
    isLoading: false,
    error: null,
    refetch: refetchEstudiantesFn,
  } as unknown as ReturnType<typeof useEstudiantesGlobal>)
})

describe('DashboardPage', () => {
  it('muestra el lapso activo como contexto', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/2026 · Lapso 2/)).toBeInTheDocument()
    expect(screen.getByText(/Activo/)).toBeInTheDocument()
  })

  it('muestra el conteo de estudiantes activos por sección', () => {
    render(<DashboardPage />)
    expect(screen.getByText('1ro A — Matutino')).toBeInTheDocument()
    expect(screen.getByText('2do B — Vespertino')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('no lista las secciones dadas de baja', () => {
    render(<DashboardPage />)
    expect(screen.queryByText('3ro C — Matutino')).not.toBeInTheDocument()
  })

  it('muestra una sección sin estudiantes activos con conteo cero', () => {
    vi.mocked(useEstudiantesGlobal).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: refetchEstudiantesFn,
    } as unknown as ReturnType<typeof useEstudiantesGlobal>)
    render(<DashboardPage />)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })

  it('indica cuando no hay un lapso activo', () => {
    vi.mocked(useLapsos).mockReturnValue({
      data: [{ ...lapsoActivo, status: 'CLOSED' }],
      isLoading: false,
      error: null,
      refetch: refetchLapsosFn,
    } as unknown as ReturnType<typeof useLapsos>)
    render(<DashboardPage />)
    expect(screen.getByText(/No hay un lapso activo/i)).toBeInTheDocument()
  })

  it('muestra el error con reintento', async () => {
    vi.mocked(useSecciones).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('sin conexión'),
      refetch: refetchSeccionesFn,
    } as unknown as ReturnType<typeof useSecciones>)
    const usuario = userEvent.setup()
    render(<DashboardPage />)

    expect(screen.getByText(/sin conexión/)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetchSeccionesFn).toHaveBeenCalled()
    expect(refetchEstudiantesFn).toHaveBeenCalled()
  })
})
