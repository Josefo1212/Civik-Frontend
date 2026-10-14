import type { InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  etiqueta?: string
  error?: string
  ayuda?: string
}

const TextField = ({ id, etiqueta, error, ayuda, className, ...resto }: Props) => (
  <div className={styles.campo}>
    {etiqueta !== undefined ? (
      <label htmlFor={id} className={styles.etiqueta}>
        {etiqueta}
      </label>
    ) : null}
    <input
      id={id}
      className={[styles.control, error !== undefined ? styles.conError : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={error !== undefined || undefined}
      aria-describedby={error !== undefined ? `${id}-error` : undefined}
      {...resto}
    />
    {ayuda !== undefined && error === undefined ? (
      <p className={styles.ayuda}>{ayuda}</p>
    ) : null}
    {error !== undefined ? (
      <p id={`${id}-error`} className={styles.error}>
        {error}
      </p>
    ) : null}
  </div>
)

export default TextField
