import { Link } from 'react-router-dom'
import { RUTAS } from '../../constants/routes'

const NotFound = () => (
  <section>
    <h1>Página no encontrada</h1>
    <p>La dirección no existe o fue movida.</p>
    <Link to={RUTAS.secciones}>Volver a Secciones</Link>
  </section>
)

export default NotFound