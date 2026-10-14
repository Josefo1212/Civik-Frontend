import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from '../Spinner/Spinner'
import styles from './Button.module.css'

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger'
type Tamano = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
  children: ReactNode
}

const Button = ({
  variante = 'primary',
  tamano = 'md',
  cargando = false,
  disabled,
  className,
  children,
  ...resto
}: Props) => (
  <button
    type="button"
    className={[styles.boton, styles[variante], styles[tamano], className]
      .filter(Boolean)
      .join(' ')}
    disabled={disabled === true || cargando}
    aria-busy={cargando || undefined}
    {...resto}
  >
    {cargando ? <Spinner /> : null}
    <span className={styles.etiqueta}>{children}</span>
  </button>
)

export default Button
