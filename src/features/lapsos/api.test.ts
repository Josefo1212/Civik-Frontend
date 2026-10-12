import { afterEach, describe, expect, it, vi } from 'vitest'
import { activarLapso, cerrarLapso, crearLapso, listarLapsos } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const respuestaOk = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado })

const lapso = {
  id: '1',
  school_year: 2026,
  lapse_number: 1,
  start_date: '2026-09-01',
  end_date: '2026-09-30',
  practice_day: 'THURSDAY',
  status: 'PLANNED',
  created_at: '',
  updated_at: '',
}

describe('listarLapsos', () => {
  it('llama GET /lapses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarLapsos()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/lapses')
    expect(init).toMatchObject({ method: 'GET' })
  })
})

describe('crearLapso', () => {
  it('envía POST /lapses con el payload', async () => {
    const payload = {
      school_year: '2026',
      lapse_number: '1',
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      practice_day: 'THURSDAY',
    }
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk(lapso, 201))
    vi.stubGlobal('fetch', fetchMock)

    const res = await crearLapso(payload)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/lapses')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(payload))
    expect(res.id).toBe('1')
  })
})

describe('activarLapso', () => {
  it('envía POST /lapses/:id/activar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ ...lapso, status: 'ACTIVE' }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await activarLapso('1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/lapses/1/activar')
    expect(init.method).toBe('POST')
    expect(res.status).toBe('ACTIVE')
  })
})

describe('cerrarLapso', () => {
  it('envía POST /lapses/:id/cerrar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk({ ...lapso, status: 'CLOSED' }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await cerrarLapso('1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/lapses/1/cerrar')
    expect(init.method).toBe('POST')
    expect(res.status).toBe('CLOSED')
  })
})
