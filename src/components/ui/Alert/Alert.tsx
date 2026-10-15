import type { ReactNode } from 'react'
import styles from './Alert.module.css'

type Variante = 'error' | 'info' | 'aviso'

interface Props {
  variante?: Variante
  children: ReactNode
  acciones?: ReactNode
}

const ICONOS: Record<Variante, ReactNode> = {
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="1" fill="currentColor" />
    </svg>
  ),
  aviso: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M12 3.2 21 19H3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.3" r="1" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.8" r="1" fill="currentColor" />
    </svg>
  ),
}

const Alert = ({ variante = 'info', children, acciones }: Props) => (
  <div
    className={`${styles.alerta} ${styles[variante]}`}
    role={variante === 'error' ? 'alert' : undefined}
  >
    <span className={styles.icono} aria-hidden="true">
      {ICONOS[variante]}
    </span>
    <p className={styles.mensaje}>{children}</p>
    {acciones !== undefined ? <div className={styles.acciones}>{acciones}</div> : null}
  </div>
)

export default Alert
