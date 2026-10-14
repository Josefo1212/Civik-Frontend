import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface Props {
  titulo: string
  subtitulo?: string
  acciones?: ReactNode
}

const PageHeader = ({ titulo, subtitulo, acciones }: Props) => (
  <header className={styles.pagina}>
    <div className={styles.textos}>
      <h1 className={styles.titulo}>{titulo}</h1>
      {subtitulo !== undefined ? <p className={styles.subtitulo}>{subtitulo}</p> : null}
    </div>
    {acciones !== undefined ? <div className={styles.acciones}>{acciones}</div> : null}
  </header>
)

export default PageHeader
