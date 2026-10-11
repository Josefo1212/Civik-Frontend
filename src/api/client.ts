export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null, cause?: unknown) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
  }
}

const baseUrl = (): string => import.meta.env['VITE_API_URL'] ?? ''

type CuerpoDeError = { error?: unknown }

const leerMensajeDeError = async (respuesta: Response): Promise<string> => {
  const cuerpo = (await respuesta.json().catch(() => null)) as CuerpoDeError | null
  const mensaje = cuerpo?.error
  return typeof mensaje === 'string' && mensaje.length > 0
    ? mensaje
    : `El servidor respondió ${respuesta.status}`
}

export const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const url = `${baseUrl()}${path}`
  let respuesta: Response
  try {
    respuesta = await fetch(url, init)
  } catch (causa) {
    throw new ApiError('No se pudo conectar con el servidor', null, causa)
  }
  if (!respuesta.ok) {
    throw new ApiError(await leerMensajeDeError(respuesta), respuesta.status)
  }
  return respuesta
}

export const apiJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const respuesta = await apiFetch(path, init)
  return (await respuesta.json()) as T
}

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export const apiSend = async <T>(
  path: string,
  method: MetodoHttp,
  body?: unknown,
): Promise<T> => {
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  const respuesta = await apiFetch(path, init)
  if (respuesta.status === 204) {
    return undefined as T
  }
  return (await respuesta.json()) as T
}

export const fetchHealth = async (): Promise<true> => {
  await apiFetch('/_health')
  return true
}