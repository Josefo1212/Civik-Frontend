import type { ReactNode } from 'react'
import styles from './Switch.module.css'

interface Props {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  disabled?: boolean
}

const Switch = ({ id, checked, onChange, children, disabled = false }: Props) => (
  <div className={styles.switch}>
    <input
      id={id}
      type="checkbox"
      className={styles.input}
      checked={checked}
      disabled={disabled}
      onChange={(evento) => onChange(evento.target.checked)}
    />
    <label htmlFor={id} className={styles.control}>
      <span className={styles.pista} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      <span className={styles.texto}>{children}</span>
    </label>
  </div>
)

export default Switch
