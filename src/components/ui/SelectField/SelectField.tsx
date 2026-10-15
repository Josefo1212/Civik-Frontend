import type { ReactNode, SelectHTMLAttributes } from 'react'
import styles from './SelectField.module.css'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  etiqueta?: string
  error?: string
  ayuda?: string
  children: ReactNode
}

const IconoError = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 7.5v5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.4" r="1" fill="currentColor" />
  </svg>
)

const SelectField = ({
  id,
  etiqueta,
  error,
  ayuda,
  className,
  children,
  ...resto
}: Props) => (
  <div className={styles.campo}>
    {etiqueta !== undefined ? (
      <label htmlFor={id} className={styles.etiqueta}>
        {etiqueta}
      </label>
    ) : null}
    <select
      id={id}
      className={[styles.control, error !== undefined ? styles.conError : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={error !== undefined || undefined}
      aria-describedby={error !== undefined ? `${id}-error` : undefined}
      {...resto}
    >
      {children}
    </select>
    {ayuda !== undefined && error === undefined ? (
      <p className={styles.ayuda}>{ayuda}</p>
    ) : null}
    {error !== undefined ? (
      <p id={`${id}-error`} className={styles.error}>
        <IconoError />
        <span>{error}</span>
      </p>
    ) : null}
  </div>
)

export default SelectField
