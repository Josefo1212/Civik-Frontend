import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface Props {
  children: ReactNode
  icono?: ReactNode
  acciones?: ReactNode
}

const EmptyState = ({ children, icono, acciones }: Props) => (
  <div className={styles.vacio}>
    {icono !== undefined ? (
      <div className={styles.icono} aria-hidden="true">
        {icono}
      </div>
    ) : null}
    <p className={styles.mensaje}>{children}</p>
    {acciones !== undefined ? <div className={styles.acciones}>{acciones}</div> : null}
  </div>
)

export default EmptyState
