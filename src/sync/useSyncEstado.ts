import { useSyncExternalStore } from 'react'
import { obtenerEstado, suscribir } from './syncManager'

export const useSyncEstado = () => useSyncExternalStore(suscribir, obtenerEstado, obtenerEstado)
