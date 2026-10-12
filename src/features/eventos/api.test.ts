import { afterEach, describe, expect, it, vi } from 'vitest'
import { cancelarEvento, crearEvento, listarEventos } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const respuestaOk = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado })

const evento = {
  id: 'e1',
  id_lapse: 'l1',
  event_date: '2026-09-03',
  type_event: 'PRACTICA_REGULAR',
  source: 'MANUAL',
  event_name: 'Práctica 1',
  status: 'SCHEDULED',
  cancelled_reason: null,
  created_at: '',
  updated_at: '',
}

describe('listarEventos', () => {
  it('llama GET /events sin filtro', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarEventos()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/events')
    expect(init).toMatchObject({ method: 'GET' })
  })

  it('pasa lapse_id en query cuando se especifica', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk([]))
    vi.stubGlobal('fetch', fetchMock)

    await listarEventos('l1')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/events?lapse_id=l1')
  })
})

describe('crearEvento', () => {
  it('envía POST /events con el payload', async () => {
    const payload = {
      id_lapse: 'l1',
      event_date: '2026-09-03',
      type_event: 'PRACTICA_REGULAR',
      event_name: 'Práctica 1',
    }
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk(evento, 201))
    vi.stubGlobal('fetch', fetchMock)

    const res = await crearEvento(payload)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/events')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(payload))
    expect(res.id).toBe('e1')
  })
})

describe('cancelarEvento', () => {
  it('envía POST /events/:id/cancel con el motivo', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(respuestaOk({ ...evento, status: 'CANCELLED', cancelled_reason: 'Lluvia' }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await cancelarEvento('e1', 'Lluvia')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/events/e1/cancel')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ motivo: 'Lluvia' }))
    expect(res.status).toBe('CANCELLED')
  })
})
