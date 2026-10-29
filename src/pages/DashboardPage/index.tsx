import { useMemo, useState } from 'react'
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
  const [mostrarPorSeccion, setMostrarPorSeccion] = useState(false)

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

      <div className={styles.gridPrincipal}>
        <section className={styles.panel} aria-label="Siguiente paso y lapso">
          <header className={styles.panelCabecera}>
            <div>
              <h2 className={styles.panelTitulo}>Operaciones del lapso</h2>
              <p className={styles.panelSubtitulo}>Estado actual y acción recomendada</p>
            </div>
          </header>
          <div className={styles.panelCuerpo}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: 'var(--texto-sm)', color: 'var(--ink-muted)' }}>Lapso</span>
                <span style={{ fontFamily: 'var(--fuente-ui)', fontWeight: 600 }}>
                  {activo === null ? 'Sin lapso activo' : etiquetaLapso(activo)}
                </span>
                {activo ? <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--ink-muted)' }}>{activo.start_date} → {activo.end_date}</span> : null}
              </div>
              {activo === null ? (
                <Link to={RUTAS.eventos}>
                  <Button variante="primary" tamano="sm">Configurar en Eventos</Button>
                </Link>
              ) : !tieneEventos ? (
                <Link to={RUTAS.eventos}>
                  <Button variante="primary" tamano="sm">Crear evento</Button>
                </Link>
              ) : (
                <Link to={RUTAS.asistencia}>
                  <Button variante="primary" tamano="sm">Tomar asistencia</Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className={styles.panel} aria-label="Resumen rápido">
          <header className={styles.panelCabecera}>
            <h2 className={styles.panelTitulo}>Indicadores</h2>
          </header>
          <div className={styles.indicadores}>
            <div className={styles.indicadorItem}>
              <span className={styles.indicadorEtiqueta}>Eventos en lapso activo</span>
              <span className={`${styles.indicadorValor} dato`}>{eventos.length}</span>
            </div>
          </div>
        </section>

        <section className={styles.panel} aria-label="Distribución por sección">
          <header className={styles.panelCabecera}>
            <div>
              <h2 className={styles.panelTitulo}>Alumnos activos por sección ({totalActivos})</h2>
              <p className={styles.panelSubtitulo}>Distribución actual</p>
            </div>
            {!cargando && errorMensaje === null && seccionesActivas.length > 0 ? (
              <Button variante="secondary" tamano="sm" onClick={() => setMostrarPorSeccion((v) => !v)}>
                {mostrarPorSeccion ? 'Ocultar' : 'Ver por sección'}
              </Button>
            ) : null}
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
              <EmptyState>No hay secciones activas para mostrar.</EmptyState>
            ) : null}
            {!cargando && errorMensaje === null && seccionesActivas.length > 0 && mostrarPorSeccion ? (
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
