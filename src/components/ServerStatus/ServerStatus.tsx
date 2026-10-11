import { useServerStatus } from '../../hooks/useServerStatus'
import type { ServerStatus as EstadoServidor } from '../../hooks/useServerStatus'
import styles from './ServerStatus.module.css'

const ETIQUETAS: Record<EstadoServidor, string> = {
  loading: 'Consultando servidor…',
  online: 'Servidor disponible',
  offline: 'Servidor no disponible',
}

const ServerStatus = () => {
  const estado = useServerStatus()

  return (
    <span className={`${styles.estado} ${styles[estado]}`} role="status">
      <span className={styles.punto} aria-hidden="true" />
      {ETIQUETAS[estado]}
    </span>
  )
}

export default ServerStatus