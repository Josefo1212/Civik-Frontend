import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Estudiante } from '../../domain/estudiante'
import type { Lapso } from '../../domain/lapso'
import type { Seccion } from '../../domain/seccion'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useSeccionMutations } from '../../features/secciones/hooks/useSeccionMutations'
import { useEstudiantes, useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import { useEstudianteMutations } from '../../features/estudiantes/hooks/useEstudianteMutations'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useAsistenciaLapso } from '../../features/estudiantes/hooks/useAsistenciaLapso'
import { useGuardarAsistencia } from '../../features/asistencia/hooks/useGuardarAsistencia'
import EstudiantesPage from './index'

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
vi.mock('../../features/estudiantes/components/DetalleEstudiante', () => ({
  default: () => <div>detalle-estudiante</div>,
}))

const seccionActiva: Seccion = {
  id: 'sec1',
  grade_level: '1ro',
  section: 'A',
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
}

const seccionBaja: Seccion = {
  id: 'sec2',
  grade_level: '2do',
  section: 'B',
  shift: 'VESPERTINO',
  active: false,
  created_at: '',
  updated_at: '',
}

const ana: Estudiante = {
  id: 'ana',
  id_section: 'sec1',
  first_name: 'Ana',
  last_name: 'López',
  phone: null,
  active: true,
  created_at: '',
  updated_at: '',
}

const luis: Estudiante = {
  id: 'luis',
  id_section: 'sec2',
  first_name: 'Luis',
  last_name: 'Pérez',
  phone: null,
  active: true,
  created_at: '',
  updated_at: '',
}

const beto: Estudiante = {
  id: 'beto',
  id_section: 'sec1',
  first_name: 'Beto',
  last_name: 'Gómez',
  phone: null,
  active: false,
  created_at: '',
  updated_at: '',
}

const reactivarEstudianteFn = vi.fn()
const reactivarSeccionFn = vi.fn()
const refetchGlobalFn = vi.fn()
const refetchSeccionesFn = vi.fn()
const guardarAsistenciaFn = vi.fn()

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

const lapsoCerrado: Lapso = { ...lapsoActivo, id: 'l1', lapse_number: 1, status: 'CLOSED' }

const mutacion = (mutate = vi.fn()) => ({ mutate, isPending: false })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useSecciones).mockReturnValue({
    data: [seccionActiva, seccionBaja],
    isLoading: false,
    error: null,
    refetch: refetchSeccionesFn,
  } as unknown as ReturnType<typeof useSecciones>)
  vi.mocked(useEstudiantes).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useEstudiantes>)
  vi.mocked(useEstudiantesGlobal).mockReturnValue({
    data: [ana, luis, beto],
    isLoading: false,
    error: null,
    refetch: refetchGlobalFn,
  } as unknown as ReturnType<typeof useEstudiantesGlobal>)
  vi.mocked(useEstudianteMutations).mockReturnValue({
    crear: mutacion(),
    editar: mutacion(),
    baja: mutacion(),
    reactivar: mutacion(reactivarEstudianteFn),
  } as unknown as ReturnType<typeof useEstudianteMutations>)
  vi.mocked(useSeccionMutations).mockReturnValue({
    reactivar: mutacion(reactivarSeccionFn),
  } as unknown as ReturnType<typeof useSeccionMutations>)
  vi.mocked(useLapsos).mockReturnValue({
    data: [lapsoCerrado, lapsoActivo],
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
    mutate: guardarAsistenciaFn,
    isPending: false,
  } as unknown as ReturnType<typeof useGuardarAsistencia>)
})

const cambiarATodos = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.click(screen.getByRole('button', { name: 'Todos' }))
}

describe('EstudiantesPage', () => {
  it('muestra el padrón global con el rótulo de sección al pasar a Todos', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('1ro A — Matutino')).toBeInTheDocument()
    expect(screen.getByText('Sección dada de baja')).toBeInTheDocument()
    expect(screen.queryByText('Beto')).not.toBeInTheDocument()
  })

  it('incluye a los inactivos con el toggle', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    await usuario.click(screen.getByLabelText('Mostrar inactivos'))
    expect(screen.getByText('Beto')).toBeInTheDocument()
  })

  it('filtra con el buscador sin volver a pedir al backend', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    await usuario.type(screen.getByLabelText('buscar-estudiante'), 'luis')
    expect(screen.getByText('Luis')).toBeInTheDocument()
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
  })

  it('muestra un estado vacío propio cuando el padrón está vacío', async () => {
    vi.mocked(useEstudiantesGlobal).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: refetchGlobalFn,
    } as unknown as ReturnType<typeof useEstudiantesGlobal>)
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    expect(screen.getByText('No hay estudiantes para mostrar.')).toBeInTheDocument()
  })

  it('distingue el vacío del buscador del de padrón vacío', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    await usuario.type(screen.getByLabelText('buscar-estudiante'), 'zzz')
    expect(screen.getByText('Sin coincidencias para «zzz».')).toBeInTheDocument()
    expect(screen.queryByText('No hay estudiantes para mostrar.')).not.toBeInTheDocument()
  })

  it('muestra el error del listado global con reintento', async () => {
    vi.mocked(useEstudiantesGlobal).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('sin conexión'),
      refetch: refetchGlobalFn,
    } as unknown as ReturnType<typeof useEstudiantesGlobal>)
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    expect(screen.getByText('Error: sin conexión')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('reintentar el padrón reintenta también las secciones', async () => {
    vi.mocked(useEstudiantesGlobal).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('sin conexión'),
      refetch: refetchGlobalFn,
    } as unknown as ReturnType<typeof useEstudiantesGlobal>)
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetchGlobalFn).toHaveBeenCalled()
    expect(refetchSeccionesFn).toHaveBeenCalled()
  })

  it('muestra el error si falla la query de secciones', async () => {
    vi.mocked(useSecciones).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('sin secciones'),
      refetch: refetchSeccionesFn,
    } as unknown as ReturnType<typeof useSecciones>)
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    expect(screen.getByText('Error: sin secciones')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('reactiva a un estudiante inactivo', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)
    await usuario.click(screen.getByLabelText('Mostrar inactivos'))

    await usuario.click(screen.getByRole('button', { name: 'reactivar-estudiante-beto' }))
    expect(reactivarEstudianteFn).toHaveBeenCalledWith('beto', expect.anything())
  })

  it('muestra y reactiva las secciones dadas de baja', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    await usuario.click(screen.getByLabelText('Mostrar secciones dadas de baja'))
    expect(screen.getByText('2do B — Vespertino')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'reactivar-seccion-sec2' }))
    expect(reactivarSeccionFn).toHaveBeenCalledWith('sec2', expect.anything())
  })

  it('preselecciona el lapso activo', () => {
    render(<EstudiantesPage />)
    expect(screen.getByLabelText('selector-lapso')).toHaveValue('l2')
  })

  it('expande y cierra el detalle de un estudiante', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />)
    await cambiarATodos(usuario)

    expect(screen.queryByText('detalle-estudiante')).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'expandir-estudiante-ana' }))
    expect(screen.getByText('detalle-estudiante')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'expandir-estudiante-ana' }))
    expect(screen.queryByText('detalle-estudiante')).not.toBeInTheDocument()
  })
})
