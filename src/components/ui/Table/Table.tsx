import type { ReactNode } from 'react'
import styles from './Table.module.css'

interface Props {
  children: ReactNode
  className?: string
}

const Table = ({ children, className }: Props) => (
  <div className={styles.scroll}>
    <table className={[styles.tabla, className].filter(Boolean).join(' ')}>{children}</table>
  </div>
)

export default Table
