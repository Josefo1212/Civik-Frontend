import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import { contarActivosPorSeccion } from '../../features/estudiantes/utils'
import { etiquetaLapso, lapsoActivo } from '../../features/lapsos/utils'
import { etiquetaSeccion } from '../../features/secciones/utils'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { RUTAS } from '../../constants/routes'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import Spinner from '../../components/ui/Spinner/Spinner'
import styles from './DashboardPage.module.css'

const DashboardPage = () => {
  const {
    data: lapsos = [],
    isLoading: cargandoLapsos,
    error: errorLapsos,
    refetch: refetchLapsos,
  } = useLapsos()
  const {
    data: secciones = [],
    isLoading: cargandoSecciones,
    error: errorSecciones,
    refetch: refetchSecciones,
  } = useSecciones(undefined)
  const {
    data: estudiantes = [],
    isLoading: cargandoEstudiantes,
    error: errorEstudiantes,
    refetch: refetchEstudiantes,
  } = useEstudiantesGlobal(false)

  const activo = lapsoActivo(lapsos)
  const conteo = useMemo(() => contarActivosPorSeccion(estudiantes), [estudiantes])
  const seccionesActivas = secciones.filter((seccion) => seccion.active)
  const { data: eventos = [], isLoading: cargandoEventos } = useEventos(activo?.id ?? null)

  const cargando = cargandoLapsos || cargandoSecciones || cargandoEstudiantes || cargandoEventos
  const error = errorLapsos ?? errorSecciones ?? errorEstudiantes
  const errorMensaje = error instanceof Error ? error.message : null

  const totalActivos = useMemo(() => {
    let total = 0
    for (const valor of conteo.values()) {
      total += valor
    }
    return total
  }, [conteo])

  const reintentar = () => {
    refetchLapsos()
    refetchSecciones()
    refetchEstudiantes()
  }

  const tieneEventos = eventos.length > 0

  return (
    <div className={styles.pagina}>
      <PageHeader
        titulo="Inicio"
        subtitulo="Sigue el flujo: crea tu lapso, agrega eventos y pasa asistencia."
      />

      <section className={`${styles.panelGlass} glass-panel`} aria-label="Acción principal">
        <div className={styles.accionPrincipal}>
          <div className={styles.accionInfo}>
            <h2 className={styles.panelTitulo}>Siguiente paso</h2>
            {activo === null ? (
              <p className={styles.lapsoVacio}>
                No hay un lapso activo. Configura un lapso para poder crear eventos y tomar asistencia.
              </p>
            ) : !tieneEventos ? (
              <p className={styles.lapsoVacio}>
                Hay un lapso activo, pero aún no hay eventos. Crea eventos para poder tomar asistencia.
              </p>
            ) : (
              <p className={styles.lapsoVacio}>
                Hay un lapso activo con eventos. Ya puedes tomar asistencia desde la sección Asistencia.
              </p>
            )}
          </div>
          <div className={styles.accionBotones}>
            {activo === null ? (
              <Link to={RUTAS.eventos}>
                <Button variante="primary">Configurar lapsos en Eventos</Button>
              </Link>
            ) : !tieneEventos ? (
              <Link to={RUTAS.eventos}>
                <Button variante="primary">Crear eventos</Button>
              </Link>
            ) : (
              <Link to={RUTAS.asistencia}>
                <Button variante="primary">Tomar asistencia</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={`${styles.panelGlass} glass-panel`} aria-label="Lapso activo">
        <h2 className={styles.panelTitulo}>Lapso activo</h2>
        {activo === null ? (
          <p className={styles.lapsoVacio} aria-live="polite">
            No hay un lapso activo. Activá uno en Eventos para ver el resumen del período.
          </p>
        ) : (
          <p className={styles.lapso}>
            <span className={styles.lapsoNombre}>{etiquetaLapso(activo)}</span>
            <span className={styles.lapsoFechas}>
              {activo.start_date} → {activo.end_date}
            </span>
          </p>
        )}
      </section>

      <div className={styles.resumenGrid}>
        <section className={styles.panel}>
          <header className={styles.panelCabecera}>
            <h2 className={styles.panelTitulo}>Resumen rápido</h2>
          </header>
          <div className={styles.resumenCuerpo}>
            <div className={styles.resumenItem}>
              <span className={styles.resumenEtiqueta}>Alumnos activos</span>
              <span className={`${styles.resumenValor} dato`}>{totalActivos}</span>
            </div>
            <div className={styles.resumenItem}>
              <span className={styles.resumenEtiqueta}>Eventos en el lapso activo</span>
              <span className={`${styles.resumenValor} dato`}>{eventos.length}</span>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <header className={styles.panelCabecera}>
            <h2 className={styles.panelTitulo}>Estudiantes activos por sección</h2>
          </header>
          <div className={styles.panelCuerpo}>
            {cargando ? (
              <p className={styles.estado} aria-live="polite">
                <Spinner /> Cargando…
              </p>
            ) : null}
            {errorMensaje !== null && !cargando ? (
              <Alert
                variante="error"
                acciones={
                  <Button variante="secondary" tamano="sm" onClick={reintentar}>
                    Reintentar
                  </Button>
                }
              >
                {errorMensaje}
              </Alert>
            ) : null}
            {!cargando && errorMensaje === null && seccionesActivas.length === 0 ? (
              <div aria-live="polite">
                <EmptyState>No hay secciones activas para mostrar.</EmptyState>
              </div>
            ) : null}
            {!cargando && errorMensaje === null && seccionesActivas.length > 0 ? (
              <ul className={styles.lista}>
                {seccionesActivas.map((seccion) => (
                  <li key={seccion.id} className={styles.fila}>
                    <span className={styles.seccionNombre}>{etiquetaSeccion(seccion)}</span>
                    <span className={`${styles.conteo} dato`}>{conteo.get(seccion.id) ?? 0}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
