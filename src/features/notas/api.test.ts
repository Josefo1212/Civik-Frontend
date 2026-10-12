import { afterEach, describe, expect, it, vi } from 'vitest'
import { listarNotas } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

const respuestaOk = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado })

describe('listarNotas', () => {
  it('llama GET /lapses/:lapso/sections/:seccion/grades', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarNotas('l1', 's1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/lapses/l1/sections/s1/grades')
    expect(init).toMatchObject({ method: 'GET' })
  })
})
