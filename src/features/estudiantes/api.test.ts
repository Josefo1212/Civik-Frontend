import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearEnSeccion, darDeBaja, editarEstudiante, listarPorSeccion, reactivar } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

const respuestaOk = (cuerpo: unknown, estado = 200) => new Response(JSON.stringify(cuerpo), { status: estado })

describe('listarPorSeccion', () => {
  it('llama GET /sections/:id/students sin incluir inactivas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)
    await listarPorSeccion('sec1')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/sec1/students')
    expect(init.method).toBe('GET')
  })
  it('agrega query cuando incluirInactivas es true', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)
    await listarPorSeccion('sec1', true)
    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/sec1/students?incluir_inactivas=true')
  })
})

describe('crearEnSeccion', () => {
  it('envía POST /sections/:id/students', async () => {
    const payload = { apellido: 'López', nombre: 'Ana', telefono: '123' }
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: 'e1', ...payload }, 201))
    vi.stubGlobal('fetch', fetchMock)
    await crearEnSeccion('sec1', payload)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/sections/sec1/students')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(payload))
  })
})

describe('editarEstudiante', () => {
  it('envía PUT /students/:id', async () => {
    const payload = { id_seccion: 'sec2', apellido: 'Gómez', nombre: 'Luis', telefono: null }
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: 'e1', ...payload }))
    vi.stubGlobal('fetch', fetchMock)
    await editarEstudiante('e1', payload)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/students/e1')
    expect(init.method).toBe('PUT')
    expect(init.body).toBe(JSON.stringify(payload))
  })
})

describe('baja/reactivar', () => {
  it('baja envía POST /students/:id/baja', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: 'e1', active: false }))
    vi.stubGlobal('fetch', fetchMock)
    await darDeBaja('e1')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/students/e1/baja')
    expect(init.method).toBe('POST')
  })
  it('reactivar envía POST /students/:id/reactivar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ id: 'e1', active: true }))
    vi.stubGlobal('fetch', fetchMock)
    await reactivar('e1')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/students/e1/reactivar')
    expect(init.method).toBe('POST')
  })
})
