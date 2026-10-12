import { useEffect } from 'react'
import { useSincronizar } from './useSincronizar'
import { observarPendientes, setEnLinea } from './syncManager'

const RegistrarSincronizacion = () => {
  const sincronizar = useSincronizar()

  useEffect(() => {
    setEnLinea(navigator.onLine)
    void sincronizar()

    const desuscribirPendientes = observarPendientes()

    const alVolver = () => {
      setEnLinea(true)
      void sincronizar()
    }
    const alCaer = () => setEnLinea(false)

    window.addEventListener('online', alVolver)
    window.addEventListener('offline', alCaer)
    return () => {
      window.removeEventListener('online', alVolver)
      window.removeEventListener('offline', alCaer)
      desuscribirPendientes()
    }
  }, [sincronizar])

  return null
}

export default RegistrarSincronizacion
