export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null, cause?: unknown) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
  }
}

const baseUrl = (): string => import.meta.env['VITE_API_URL'] ?? ''

export const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const url = `${baseUrl()}${path}`
  let respuesta: Response
  try {
    respuesta = await fetch(url, init)
  } catch (causa) {
    throw new ApiError('No se pudo conectar con el servidor', null, causa)
  }
  if (!respuesta.ok) {
    throw new ApiError(`El servidor respondió ${respuesta.status}`, respuesta.status)
  }
  return respuesta
}

export const apiJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const respuesta = await apiFetch(path, init)
  return (await respuesta.json()) as T
}

export const fetchHealth = async (): Promise<true> => {
  await apiFetch('/_health')
  return true
}