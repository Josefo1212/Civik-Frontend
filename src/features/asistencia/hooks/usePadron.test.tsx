import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { ApiError } from '../../../api/client'
import type { FilaPadron } from '../../../domain/asistencia'
import { clavesCache, guardarCache } from '../../../sync/cache'
import { db } from '../../../sync/db'
import { listarPadron } from '../api'
import { usePadron } from './usePadron'

vi.mock('../api')

const listarPadronMock = vi.mocked(listarPadron)

const padronCacheado: FilaPadron[] = [
  { id_student: 's1', first_name: 'Ana', last_name: 'López', state: 'PRESENTE' },
]

const crearCliente = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const envoltorio = (cliente: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

beforeEach(async () => {
  await db.cache.clear()
  listarPadronMock.mockReset()
})

describe('usePadron con respaldo en caché', () => {
  it('devuelve el padrón cacheado cuando falla la red', async () => {
    await guardarCache(clavesCache.padron('e1'), padronCacheado)
    listarPadronMock.mockRejectedValue(new ApiError('No se pudo conectar con el servidor', null))

    const { result } = renderHook(() => usePadron('e1'), { wrapper: envoltorio(crearCliente()) })

    await waitFor(() => expect(result.current.data).toEqual(padronCacheado))
  })

  it('usa la red cuando responde y guarda la caché', async () => {
    listarPadronMock.mockResolvedValue(padronCacheado)

    const { result } = renderHook(() => usePadron('e1'), { wrapper: envoltorio(crearCliente()) })

    await waitFor(() => expect(result.current.data).toEqual(padronCacheado))
    await waitFor(async () => {
      const cache = await db.cache.get(clavesCache.padron('e1'))
      expect(cache?.valor).toEqual(padronCacheado)
    })
  })
})
