import { afterEach, describe, expect, it, vi } from 'vitest'
import { listarPadron, registrarAsistencia } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const respuestaOk = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado })

describe('listarPadron', () => {
  it('llama GET /events/:id/attendance', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarPadron('e1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/events/e1/attendance')
    expect(init).toMatchObject({ method: 'GET' })
  })
})

describe('registrarAsistencia', () => {
  it('envía POST /events/:id/attendance con { items }', async () => {
    const items = [
      { id_student: 's1', state: 'PRESENTE' },
      { id_student: 's2', state: 'AUSENTE' },
    ]
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await registrarAsistencia('e1', items)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/events/e1/attendance')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ items }))
  })
})
