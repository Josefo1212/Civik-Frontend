import { ApiError, apiFetch, apiJson, fetchHealth } from './client'
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