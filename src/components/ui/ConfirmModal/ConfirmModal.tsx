import type { ReactNode } from 'react'
import Button from '../Button/Button'
import styles from './ConfirmModal.module.css'

export type ConfirmModalProps = {
  abierto: boolean
  titulo: string
  descripcion?: ReactNode
  textoConfirmar: string
  textoCancelar?: string
  varianteConfirmar?: 'primary' | 'danger' | 'secondary'
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

const ConfirmModal = ({
  abierto,
  titulo,
  descripcion,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  varianteConfirmar = 'danger',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) => {
  if (!abierto) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-titulo">
      <div className={`${styles.modal} glass-panel`}>
        <header className={styles.cabecera}>
          <h2 className={styles.titulo} id="confirm-modal-titulo">
            {titulo}
          </h2>
        </header>
        {descripcion ? <div className={styles.descripcion}>{descripcion}</div> : null}
        <footer className={styles.pie}>
          <Button variante="secondary" tamano="sm" onClick={onCancelar} disabled={cargando}>
            {textoCancelar}
          </Button>
          <Button variante={varianteConfirmar} tamano="sm" onClick={onConfirmar} disabled={cargando}>
            {cargando ? 'Procesando…' : textoConfirmar}
          </Button>
        </footer>
      </div>
    </div>
  )
}

export default ConfirmModal
