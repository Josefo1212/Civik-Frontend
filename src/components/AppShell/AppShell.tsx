import { NavLink, Outlet } from 'react-router-dom'
import { NAVEGACION_PRINCIPAL } from '../../constants/routes'
import ServerStatus from '../ServerStatus/ServerStatus'
import styles from './AppShell.module.css'

const AppShell = () => (
  <div className={styles.shell}>
    <header className={styles.encabezado}>
      <span className={styles.marca}>Civik</span>
      <nav className={styles.nav} aria-label="Navegación principal">
        {NAVEGACION_PRINCIPAL.map(({ ruta, etiqueta }) => (
          <NavLink
            key={ruta}
            to={ruta}
            className={({ isActive }) => (isActive ? styles.activo : undefined)}
          >
            {etiqueta}
          </NavLink>
        ))}
      </nav>
      <ServerStatus />
    </header>
    <main className={styles.contenido}>
      <Outlet />
    </main>
  </div>
)

export default AppShell