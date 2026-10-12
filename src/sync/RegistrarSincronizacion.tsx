import { useEffect } from 'react'
import { useSincronizar } from './useSincronizar'
import { refrescarPendientes, setEnLinea } from './syncManager'

const RegistrarSincronizacion = () => {
  const sincronizar = useSincronizar()

  useEffect(() => {
    setEnLinea(navigator.onLine)
    void refrescarPendientes()
    void sincronizar()

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
    }
  }, [sincronizar])

  return null
}

export default RegistrarSincronizacion
