import { useEffect } from 'react'
import { observarPendientes, setEnLinea } from './syncManager'

const RegistrarSincronizacion = () => {
  useEffect(() => {
    setEnLinea(navigator.onLine)

    const desuscribirPendientes = observarPendientes()

    const alVolver = () => {
      setEnLinea(true)
    }
    const alCaer = () => setEnLinea(false)

    window.addEventListener('online', alVolver)
    window.addEventListener('offline', alCaer)
    return () => {
      window.removeEventListener('online', alVolver)
      window.removeEventListener('offline', alCaer)
      desuscribirPendientes()
    }
  }, [])

  return null
}

export default RegistrarSincronizacion
