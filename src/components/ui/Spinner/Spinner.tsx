import styles from './Spinner.module.css'

interface Props {
  etiqueta?: string
}

const Spinner = ({ etiqueta }: Props) =>
  etiqueta === undefined ? (
    <span className={styles.spinner} aria-hidden="true" />
  ) : (
    <span className={styles.spinner} role="status" aria-label={etiqueta} />
  )

export default Spinner
