import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Lapso } from '../../../domain/lapso'
import type { FilaNota } from '../../../domain/nota'
import type { Seccion } from '../../../domain/seccion'
import { listarNotas } from '../api'
import { generarDocumentoPdf } from '../pdf/documento'
import { useNotasPdf } from './useNotasPdf'

vi.mock('../api')
vi.mock('../pdf/documento')

const listarNotasMock = vi.mocked(listarNotas)
const generarDocumentoPdfMock = vi.mocked(generarDocumentoPdf)

const lapso: Lapso = {
  id: 'l2',
  school_year: 2026,
  lapse_number: 2,
  start_date: '2026-01-01',
  end_date: '2026-04-01',
  practice_day: 'SATURDAY',
  status: 'ACTIVE',
  created_at: '',
  updated_at: '',
}

const seccion = (parcial: Partial<Seccion> & Pick<Seccion, 'id' | 'grade_level' | 'section'>): Seccion => ({
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
  ...parcial,
})

const fila = (id: string, apellido: string): FilaNota => ({
  id_student: id,
  first_name: 'Ana',
  last_name: apellido,
  nota: '18.00',
  es_override: false,
})

const crearCliente = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const envoltorio = (cliente: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

beforeEach(() => {
  listarNotasMock.mockReset()
  generarDocumentoPdfMock.mockReset()
})

describe('useNotasPdf', () => {
  it('consulta solo la sección elegida y genera un grupo', async () => {
    const secciones = [
      seccion({ id: 's1', grade_level: '1ro', section: 'a' }),
      seccion({ id: 's2', grade_level: '2do', section: 'a' }),
    ]
    listarNotasMock.mockResolvedValue([fila('e1', 'Pérez')])

    const { result } = renderHook(
      () => useNotasPdf({ lapso, secciones, seccionId: 's2' }),
      { wrapper: envoltorio(crearCliente()) },
    )

    await act(() => result.current.generar())

    expect(listarNotasMock).toHaveBeenCalledTimes(1)
    expect(listarNotasMock).toHaveBeenCalledWith('l2', 's2')
    expect(generarDocumentoPdfMock).toHaveBeenCalledTimes(1)
    const opciones = generarDocumentoPdfMock.mock.calls[0][0]
    expect(opciones.anioEscolar).toBe(2026)
    expect(opciones.lapso).toBe(2)
    expect(opciones.provisional).toBe(true)
    expect(opciones.unaSeccion).toBe(true)
    expect(opciones.grupos.map((grupo) => grupo.idSeccion)).toEqual(['s2'])
  })

  it('consulta todas las secciones activas en orden canónico', async () => {
    const secciones = [
      seccion({ id: 's5', grade_level: '5to', section: 'a' }),
      seccion({ id: 's1b', grade_level: '1ro', section: 'b' }),
      seccion({ id: 's1a', grade_level: '1ro', section: 'a' }),
      seccion({ id: 'baja', grade_level: '3ro', section: 'a', active: false }),
    ]
    listarNotasMock.mockResolvedValue([fila('e1', 'Pérez')])

    const { result } = renderHook(
      () => useNotasPdf({ lapso, secciones, seccionId: null }),
      { wrapper: envoltorio(crearCliente()) },
    )

    await act(() => result.current.generar())

    expect(listarNotasMock.mock.calls.map(([lapsoId, seccionId]) => [lapsoId, seccionId])).toEqual([
      ['l2', 's1a'],
      ['l2', 's1b'],
      ['l2', 's5'],
    ])
    const opciones = generarDocumentoPdfMock.mock.calls[0][0]
    expect(opciones.unaSeccion).toBe(false)
    expect(opciones.grupos.map((grupo) => grupo.idSeccion)).toEqual(['s1a', 's1b', 's5'])
  })

  it('no descarga nada y muestra el error si falla una sección', async () => {
    const secciones = [
      seccion({ id: 's1', grade_level: '1ro', section: 'a' }),
      seccion({ id: 's2', grade_level: '2do', section: 'a' }),
    ]
    listarNotasMock.mockImplementation((_lapsoId, seccionId) =>
      seccionId === 's2'
        ? Promise.reject(new Error('El servidor respondió 500'))
        : Promise.resolve([fila('e1', 'Pérez')]),
    )

    const { result } = renderHook(
      () => useNotasPdf({ lapso, secciones, seccionId: null }),
      { wrapper: envoltorio(crearCliente()) },
    )

    await act(() => result.current.generar())

    expect(generarDocumentoPdfMock).not.toHaveBeenCalled()
    expect(result.current.error).toBe('El servidor respondió 500')
  })

  it('no descarga nada si el alcance no tiene estudiantes', async () => {
    const secciones = [seccion({ id: 's1', grade_level: '1ro', section: 'a' })]
    listarNotasMock.mockResolvedValue([])

    const { result } = renderHook(
      () => useNotasPdf({ lapso, secciones, seccionId: null }),
      { wrapper: envoltorio(crearCliente()) },
    )

    await act(() => result.current.generar())

    expect(generarDocumentoPdfMock).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/no hay estudiantes/i)
  })

  it('no descarga nada si no hay secciones en el alcance', async () => {
    const secciones = [seccion({ id: 'baja', grade_level: '1ro', section: 'a', active: false })]

    const { result } = renderHook(
      () => useNotasPdf({ lapso, secciones, seccionId: null }),
      { wrapper: envoltorio(crearCliente()) },
    )

    await act(() => result.current.generar())

    expect(listarNotasMock).not.toHaveBeenCalled()
    expect(generarDocumentoPdfMock).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/no hay estudiantes/i)
  })

  it('marca generando mientras trabaja y lo apaga al terminar', async () => {
    const secciones = [seccion({ id: 's1', grade_level: '1ro', section: 'a' })]
    let resolver: (filas: FilaNota[]) => void = () => {}
    listarNotasMock.mockImplementation(
      () =>
        new Promise<FilaNota[]>((resolve) => {
          resolver = resolve
        }),
    )

    const { result } = renderHook(
      () => useNotasPdf({ lapso, secciones, seccionId: 's1' }),
      { wrapper: envoltorio(crearCliente()) },
    )

    let pendiente: Promise<void> = Promise.resolve()
    act(() => {
      pendiente = result.current.generar()
    })

    await waitFor(() => expect(result.current.generando).toBe(true))

    await act(async () => {
      resolver([fila('e1', 'Pérez')])
      await pendiente
    })

    expect(result.current.generando).toBe(false)
    expect(generarDocumentoPdfMock).toHaveBeenCalledTimes(1)
  })

  it('no hace nada si no hay lapso seleccionado', async () => {
    const secciones = [seccion({ id: 's1', grade_level: '1ro', section: 'a' })]

    const { result } = renderHook(
      () => useNotasPdf({ lapso: null, secciones, seccionId: null }),
      { wrapper: envoltorio(crearCliente()) },
    )

    await act(() => result.current.generar())

    expect(listarNotasMock).not.toHaveBeenCalled()
    expect(generarDocumentoPdfMock).not.toHaveBeenCalled()
    expect(result.current.generando).toBe(false)
  })
})
