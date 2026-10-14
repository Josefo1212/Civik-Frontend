import { Link } from 'react-router-dom'
import { RUTAS } from '../../constants/routes'
import EmptyState from '../ui/EmptyState/EmptyState'
import styles from './NotFound.module.css'

const NotFound = () => (
  <section>
    <EmptyState
      icono="404"
      acciones={
        <Link to={RUTAS.secciones} className={styles.enlace}>
          Volver a Secciones
        </Link>
      }
    >
      <h1 className={styles.titulo}>Página no encontrada</h1>
      <p className={styles.texto}>La dirección no existe o fue movida.</p>
    </EmptyState>
  </section>
)

export default NotFound
