import type { ReactNode, SelectHTMLAttributes } from 'react'
import styles from './SelectField.module.css'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  etiqueta?: string
  children: ReactNode
}

const SelectField = ({ id, etiqueta, className, children, ...resto }: Props) => (
  <div className={styles.campo}>
    {etiqueta !== undefined ? (
      <label htmlFor={id} className={styles.etiqueta}>
        {etiqueta}
      </label>
    ) : null}
    <select id={id} className={[styles.control, className].filter(Boolean).join(' ')} {...resto}>
      {children}
    </select>
  </div>
)

export default SelectField
