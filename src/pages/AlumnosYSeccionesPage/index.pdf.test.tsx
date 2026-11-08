import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Lapso } from '../../domain/lapso'
import type { Seccion } from '../../domain/seccion'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useSeccionMutations } from '../../features/secciones/hooks/useSeccionMutations'
import { useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import { useEstudianteMutations } from '../../features/estudiantes/hooks/useEstudianteMutations'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useAsistenciaLapso } from '../../features/estudiantes/hooks/useAsistenciaLapso'
import { useGuardarAsistencia } from '../../features/asistencia/hooks/useGuardarAsistencia'
import { useNotasPdf } from '../../features/notas/hooks/useNotasPdf'
import AlumnosYSeccionesPage from './index'

vi.mock('../../features/secciones/hooks/useSecciones', () => ({ useSecciones: vi.fn() }))
vi.mock('../../features/secciones/hooks/useSeccionMutations', () => ({ useSeccionMutations: vi.fn() }))
vi.mock('../../features/estudiantes/hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
  useEstudiantesGlobal: vi.fn(),
}))
vi.mock('../../features/estudiantes/hooks/useEstudianteMutations', () => ({ useEstudianteMutations: vi.fn() }))
vi.mock('../../features/lapsos/hooks/useLapsos', () => ({ useLapsos: vi.fn() }))
vi.mock('../../features/eventos/hooks/useEventos', () => ({ useEventos: vi.fn() }))
vi.mock('../../features/estudiantes/hooks/useAsistenciaLapso', () => ({ useAsistenciaLapso: vi.fn() }))
vi.mock('../../features/asistencia/hooks/useGuardarAsistencia', () => ({ useGuardarAsistencia: vi.fn() }))
vi.mock('../../features/notas/hooks/useNotasPdf', () => ({ useNotasPdf: vi.fn() }))

const seccionActiva: Seccion = {
  id: 'sec1',
  grade_level: '1ro',
  section: 'a',
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
}

const lapsoActivo: Lapso = {
  id: 'l2',
  school_year: 2026,
  lapse_number: 2,
  start_date: '2026-04-01',
  end_date: '2026-06-30',
  practice_day: 'SATURDAY',
  status: 'ACTIVE',
  created_at: '',
  updated_at: '',
}

const mutacion = () => ({ mutate: vi.fn(), isPending: false })
const generarFn = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useSecciones).mockReturnValue({
    data: [seccionActiva],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useSecciones>)
  vi.mocked(useEstudiantesGlobal).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useEstudiantesGlobal>)
  vi.mocked(useEstudianteMutations).mockReturnValue({
    crear: mutacion(),
    editar: mutacion(),
    baja: mutacion(),
    reactivar: mutacion(),
  } as unknown as ReturnType<typeof useEstudianteMutations>)
  vi.mocked(useSeccionMutations).mockReturnValue({
    crear: mutacion(),
    editar: mutacion(),
    darDeBaja: mutacion(),
    reactivar: mutacion(),
    eliminar: mutacion(),
  } as unknown as ReturnType<typeof useSeccionMutations>)
  vi.mocked(useLapsos).mockReturnValue({
    data: [lapsoActivo],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useLapsos>)
  vi.mocked(useEventos).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useEventos>)
  vi.mocked(useAsistenciaLapso).mockReturnValue({
    porEstudiante: new Map(),
    cargando: false,
    error: null,
  })
  vi.mocked(useGuardarAsistencia).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useGuardarAsistencia>)
  vi.mocked(useNotasPdf).mockReturnValue({ generar: generarFn, generando: false, error: null })
})

describe('AlumnosYSeccionesPage — barra del PDF', () => {
  it('muestra el selector de alcance y el botón junto al selector de lapso', () => {
    render(<AlumnosYSeccionesPage />)

    expect(screen.getByRole('combobox', { name: 'selector-lapso' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Sección' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generar pdf/i })).toBeEnabled()
  })

  it('deshabilita el botón y explica que falta el lapso', () => {
    vi.mocked(useLapsos).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useLapsos>)

    render(<AlumnosYSeccionesPage />)

    const boton = screen.getByRole('button', { name: /generar pdf/i })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('title', 'Elige un lapso')
  })

  it('deshabilita el botón cuando no hay secciones activas', () => {
    vi.mocked(useSecciones).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useSecciones>)

    render(<AlumnosYSeccionesPage />)

    const boton = screen.getByRole('button', { name: /generar pdf/i })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('title', 'No hay secciones activas')
  })

  it('llama a generar al pulsar el botón', async () => {
    const usuario = userEvent.setup()
    render(<AlumnosYSeccionesPage />)

    await usuario.click(screen.getByRole('button', { name: /generar pdf/i }))

    expect(generarFn).toHaveBeenCalledTimes(1)
  })

  it('pasa el alcance elegido al hook del PDF', async () => {
    const usuario = userEvent.setup()
    render(<AlumnosYSeccionesPage />)

    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Sección' }), 'sec1')

    expect(vi.mocked(useNotasPdf).mock.lastCall?.[0].seccionId).toBe('sec1')
  })

  it('muestra el error del hook', () => {
    vi.mocked(useNotasPdf).mockReturnValue({
      generar: generarFn,
      generando: false,
      error: 'No hay estudiantes para incluir en el PDF.',
    })

    render(<AlumnosYSeccionesPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('No hay estudiantes para incluir en el PDF.')
  })
})
