import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { NAVEGACION_PRINCIPAL, RUTAS } from '../../constants/routes'
import ServerStatus from '../ServerStatus/ServerStatus'
import SincronizarBoton from '../../sync/SincronizarBoton'
import RegistrarSincronizacion from '../../sync/RegistrarSincronizacion'
import styles from './AppShell.module.css'

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const IconoSecciones = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const IconoEstudiantes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.8" />
    <path d="M17.5 14.2a5.5 5.5 0 0 1 3 4.8" />
  </svg>
)

const IconoEventos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
)

const IconoAsistencia = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.2l2.6 2.6L16 9.4" />
  </svg>
)

const IconoNotas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

const ICONOS: Record<string, ReactNode> = {
  [RUTAS.secciones]: <IconoSecciones />,
  [RUTAS.estudiantes]: <IconoEstudiantes />,
  [RUTAS.eventos]: <IconoEventos />,
  [RUTAS.asistencia]: <IconoAsistencia />,
  [RUTAS.notas]: <IconoNotas />,
}

const AppShell = () => (
  <div className={styles.shell}>
    <header className={styles.encabezado}>
      <span className={styles.marca}>
        <span className={styles.logo} aria-hidden="true">
          Ci
        </span>
        Civik
      </span>
      <nav className={styles.nav} aria-label="Navegación principal">
        {NAVEGACION_PRINCIPAL.map(({ ruta, etiqueta }) => (
          <NavLink
            key={ruta}
            to={ruta}
            className={({ isActive }) =>
              isActive ? `${styles.enlace} ${styles.activo}` : styles.enlace
            }
          >
            <span className={styles.icono}>{ICONOS[ruta]}</span>
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.acciones}>
        <ServerStatus />
        <SincronizarBoton />
        <RegistrarSincronizacion />
      </div>
    </header>
    <main className={styles.contenido}>
      <Outlet />
    </main>
  </div>
)

export default AppShell
