import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '../api/client'

export type ServerStatus = 'loading' | 'online' | 'offline'

export const useServerStatus = (): ServerStatus => {
  const { status } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: 1,
    retryDelay: 250,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  if (status === 'success') return 'online'
  if (status === 'error') return 'offline'
  return 'loading'
}