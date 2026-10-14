import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface Props {
  titulo?: ReactNode
  acciones?: ReactNode
  children: ReactNode
  className?: string
}

const Card = ({ titulo, acciones, children, className }: Props) => (
  <section className={[styles.card, className].filter(Boolean).join(' ')}>
    {titulo !== undefined || acciones !== undefined ? (
      <header className={styles.cabecera}>
        {titulo !== undefined ? <h2 className={styles.titulo}>{titulo}</h2> : <span />}
        {acciones !== undefined ? <div className={styles.acciones}>{acciones}</div> : null}
      </header>
    ) : null}
    <div className={styles.cuerpo}>{children}</div>
  </section>
)

export default Card
