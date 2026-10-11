import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  crearSeccion,
  darDeBajaSeccion,
  editarSeccion,
  eliminarSeccion,
  listarSecciones,
  reactivarSeccion,
} from './api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const respuestaOk = (cuerpo: unknown, estado = 200) => new Response(JSON.stringify(cuerpo), { status: estado })

describe('listarSecciones', () => {
  it('llama GET /sections sin grado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarSecciones()

    expect(fetchMock).toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections')
    expect(init).toMatchObject({ method: 'GET' })
  })

  it('pasa el grado en query cuando se especifica', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarSecciones('1ro')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections?grado=1ro')
  })

  it('no pasa grado cuando es "todos"', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarSecciones('todos')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections')
  })
})

describe('crearSeccion', () => {
  it('envía POST /sections con el payload', async () => {
    const payload = { grade_level: '1ro', section: 'A', shift: 'MATUTINO' }
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: '1', ...payload, active: true }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const res = await crearSeccion(payload)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(payload))
    expect(res.id).toBe('1')
  })
})

describe('editarSeccion', () => {
  it('envía PUT /sections/:id con el payload', async () => {
    const payload = { grade_level: '1ro', section: 'B', shift: 'VESPERTINO' }
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: '1', ...payload, active: true }))
    vi.stubGlobal('fetch', fetchMock)

    await editarSeccion('1', payload)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/1')
    expect(init.method).toBe('PUT')
    expect(init.body).toBe(JSON.stringify(payload))
  })
})

describe('darDeBajaSeccion', () => {
  it('envía POST /sections/:id/baja', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: '1', active: false }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await darDeBajaSeccion('1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/1/baja')
    expect(init.method).toBe('POST')
    expect(res.active).toBe(false)
  })
})

describe('reactivarSeccion', () => {
  it('envía POST /sections/:id/reactivar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: '1', active: true }))
    vi.stubGlobal('fetch', fetchMock)

    await reactivarSeccion('1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/1/reactivar')
    expect(init.method).toBe('POST')
  })
})

describe('eliminarSeccion', () => {
  it('envía DELETE /sections/:id y devuelve void', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(eliminarSeccion('1')).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/1')
    expect(init.method).toBe('DELETE')
  })
})
