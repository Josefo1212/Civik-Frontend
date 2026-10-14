import type { ReactNode } from 'react'
import styles from './Alert.module.css'

type Variante = 'error' | 'info' | 'aviso'

interface Props {
  variante?: Variante
  children: ReactNode
  acciones?: ReactNode
}

const Alert = ({ variante = 'info', children, acciones }: Props) => (
  <div
    className={`${styles.alerta} ${styles[variante]}`}
    role={variante === 'error' ? 'alert' : undefined}
  >
    <p className={styles.mensaje}>{children}</p>
    {acciones !== undefined ? <div className={styles.acciones}>{acciones}</div> : null}
  </div>
)

export default Alert
