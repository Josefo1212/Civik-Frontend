import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sincronizar } from './syncManager'

export const useSincronizar = () => {
  const queryClient = useQueryClient()

  return useCallback(async () => {
    await sincronizar()
    await queryClient.invalidateQueries()
  }, [queryClient])
}
