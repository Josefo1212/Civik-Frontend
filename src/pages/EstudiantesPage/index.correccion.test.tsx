import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Estudiante } from '../../domain/estudiante'
import type { Evento } from '../../domain/evento'
import type { Lapso } from '../../domain/lapso'
import type { Seccion } from '../../domain/seccion'
import type { FilaFusionada } from '../../sync/fusionar'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useSeccionMutations } from '../../features/secciones/hooks/useSeccionMutations'
import { useEstudiantes, useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import { useEstudianteMutations } from '../../features/estudiantes/hooks/useEstudianteMutations'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useAsistenciaLapso } from '../../features/estudiantes/hooks/useAsistenciaLapso'
import { useGuardarAsistencia } from '../../features/asistencia/hooks/useGuardarAsistencia'
import { listarNotas } from '../../features/notas/api'
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
vi.mock('../../features/notas/api')

const listarNotasMock = vi.mocked(listarNotas)

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

const evento: Evento = {
  id: 'e1',
  id_lapse: 'l2',
  event_date: '2999-01-01',
  type_event: 'PRACTICA_REGULAR',
  source: 'AUTO',
  event_name: 'Práctica 1',
  status: 'SCHEDULED',
  cancelled_reason: null,
  created_at: null,
  updated_at: null,
}

const seccion: Seccion = {
  id: 'sec1',
  grade_level: '1ro',
  section: 'A',
  shift: 'MATUTINO',
  active: true,
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

const filaAsistencia: FilaFusionada = {
  id_student: 'ana',
  first_name: 'Ana',
  last_name: 'López',
  state: 'PRESENTE',
  estadoSync: null,
}

const mutacion = () => ({ mutate: vi.fn(), isPending: false })
const guardarAsistenciaFn = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  listarNotasMock.mockResolvedValue([
    { id_student: 'ana', first_name: 'Ana', last_name: 'López', nota: '18.50', es_override: false },
  ])
  vi.mocked(useSecciones).mockReturnValue({
    data: [seccion],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useSecciones>)
  vi.mocked(useEstudiantes).mockReturnValue({
    data: [
      ana,
      { ...ana, id: 'beto', first_name: 'Beto' },
      { ...ana, id: 'carl', first_name: 'Carl' },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useEstudiantes>)
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
    reactivar: mutacion(),
  } as unknown as ReturnType<typeof useSeccionMutations>)
  vi.mocked(useLapsos).mockReturnValue({
    data: [lapsoActivo],
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
  vi.mocked(useAsistenciaLapso).mockReturnValue({
    porEstudiante: new Map([['ana', new Map([['e1', filaAsistencia]])]]),
    cargando: false,
    error: null,
  })
  vi.mocked(useGuardarAsistencia).mockReturnValue({
    mutate: guardarAsistenciaFn,
    isPending: false,
  } as unknown as ReturnType<typeof useGuardarAsistencia>)
})

const abrirSeccion = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.selectOptions(screen.getByLabelText('selector-seccion'), 'sec1')
}

const envoltorio = () => {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

describe('EstudiantesPage — corrección inline', () => {
  it('encola la corrección con evento, estudiante y estado al corregir desde el detalle', async () => {
    const usuario = userEvent.setup()
    render(<EstudiantesPage />, { wrapper: envoltorio() })
    await abrirSeccion(usuario)

    await usuario.click(screen.getByRole('button', { name: 'expandir-estudiante-ana' }))
    expect(await screen.findByText('Práctica 1')).toBeInTheDocument()

    await usuario.click(screen.getByRole('radio', { name: 'AUSENTE-ana-e1' }))
    expect(guardarAsistenciaFn).toHaveBeenCalledWith([
      { id_event: 'e1', id_student: 'ana', state: 'AUSENTE' },
    ])
  })
})
