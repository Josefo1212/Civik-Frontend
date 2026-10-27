import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Button from '../Button/Button'
import styles from './Drawer.module.css'

export type DrawerProps = {
  abierto: boolean
  titulo: string
  subtitulo?: string
  children: ReactNode
  pie?: ReactNode
  onCerrar: () => void
}

const Drawer = ({ abierto, titulo, subtitulo, children, pie, onCerrar }: DrawerProps) => {
  useEffect(() => {
    if (!abierto) return
    const handleKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        onCerrar()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    const body = document.body
    const overflowAnterior = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = overflowAnterior
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="drawer-titulo" onClick={onCerrar}>
      <aside
        className={`${styles.drawer} glass-panel`}
        role="document"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className={styles.cabecera}>
          <div className={styles.titulos}>
            <h2 className={styles.titulo} id="drawer-titulo">
              {titulo}
            </h2>
            {subtitulo ? <p className={styles.subtitulo}>{subtitulo}</p> : null}
          </div>
          <Button variante="ghost" tamano="sm" onClick={onCerrar} aria-label="Cerrar panel">
            Cerrar
          </Button>
        </header>
        <div className={styles.contenido}>{children}</div>
        {pie ? <footer className={styles.pie}>{pie}</footer> : null}
      </aside>
    </div>
  )
}

export default Drawer
