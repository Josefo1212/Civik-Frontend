import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Variante = 'ok' | 'danger' | 'neutral' | 'info'

interface Props {
  variante?: Variante
  children: ReactNode
}

const Badge = ({ variante = 'neutral', children }: Props) => (
  <span className={`${styles.badge} ${styles[variante]}`}>{children}</span>
)

export default Badge
