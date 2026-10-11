import { ApiError, apiFetch, apiJson, apiSend, fetchHealth } from './client'
import { afterEach, describe, expect, it, vi } from 'vitest'

const respuestaOk = () => new Response(null, { status: 200 })

const respuesta = (estado: number) => new Response(null, { status: estado })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('apiFetch', () => {
  it('arma la URL con VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'https://servidor.ts.net')
    const fetchMock = vi.fn().mockResolvedValue(respuestaOk())
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/_health')

    expect(fetchMock.mock.calls[0][0]).toBe('https://servidor.ts.net/_health')
  })

  it('resuelve con la respuesta cuando el status es 2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaOk()))

    await expect(apiFetch('/_health')).resolves.toBeInstanceOf(Response)
  })

  it('lanza ApiError con el status cuando el servidor responde error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(503)))

    const error = await apiFetch('/_health').then(
      () => null,
      (e: unknown) => e,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(503)
  })

  it('lanza ApiError con status null cuando hay fallo de red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    const error = await apiFetch('/_health').then(
      () => null,
      (e: unknown) => e,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBeNull()
  })
})

describe('fetchHealth', () => {
  it('resuelve cuando el backend responde 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaOk()))

    await expect(fetchHealth()).resolves.toBe(true)
  })

  it('lanza ApiError cuando el backend responde 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(503)))

    await expect(fetchHealth()).rejects.toBeInstanceOf(ApiError)
  })
})

describe('apiJson', () => {
  it('parsea el cuerpo JSON de la respuesta', async () => {
    const cuerpo = { hola: 'mundo' }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(cuerpo), { status: 200 })),
    )

    await expect(apiJson('/algo')).resolves.toEqual(cuerpo)
  })
})

describe('mensaje de error del backend', () => {
  it('usa el campo error del cuerpo cuando el servidor responde 4xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'El grado «6to» no existe' }), { status: 400 }),
      ),
    )

    const error = await apiFetch('/sections').then(
      () => null,
      (e: unknown) => e,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe('El grado «6to» no existe')
    expect((error as ApiError).status).toBe(400)
  })

  it('cae a un mensaje genérico si el cuerpo no trae error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>boom</html>', { status: 500 })),
    )

    const error = await apiFetch('/sections').then(
      () => null,
      (e: unknown) => e,
    )

    expect((error as ApiError).message).toContain('500')
  })
})

describe('apiSend', () => {
  it('envía método, cabecera JSON y cuerpo serializado', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 'abc' }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await apiSend('/sections', 'POST', { grade_level: '1ro' })

    expect(fetchMock.mock.calls[0][0]).toBe('/sections')
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ grade_level: '1ro' }))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(resultado).toEqual({ id: 'abc' })
  })

  it('no envía cuerpo ni cabecera cuando no se pasa body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiSend('/sections/1', 'DELETE')

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('DELETE')
    expect(init.body).toBeUndefined()
    expect(init.headers).toBeUndefined()
  })

  it('resuelve undefined cuando el status es 204 sin cuerpo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(apiSend('/sections/1', 'DELETE')).resolves.toBeUndefined()
  })
})