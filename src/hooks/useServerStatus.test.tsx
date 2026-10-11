import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { useServerStatus } from './useServerStatus'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

const crearCliente = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const envoltorio = (cliente: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  )
  return Wrapper
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useServerStatus', () => {
  it('empieza en loading y pasa a online cuando el backend responde 200', async () => {
    const cliente = crearCliente()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))

    const { result } = renderHook(() => useServerStatus(), { wrapper: envoltorio(cliente) })

    expect(result.current).toBe('loading')

    await waitFor(() => expect(result.current).toBe('online'))
  })

  it('empieza en loading y pasa a offline cuando falla la red', async () => {
    const cliente = crearCliente()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    const { result } = renderHook(() => useServerStatus(), { wrapper: envoltorio(cliente) })

    expect(result.current).toBe('loading')

    await waitFor(() => expect(result.current).toBe('offline'))
  })
})