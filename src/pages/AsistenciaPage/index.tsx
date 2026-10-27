import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import SelectorEvento from '../../features/asistencia/components/SelectorEvento'
import PadronAsistencia from '../../features/asistencia/components/PadronAsistencia'
import type { CambioPadron } from '../../features/asistencia/components/PadronAsistencia'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { usePadron } from '../../features/asistencia/hooks/usePadron'
import { useGuardarAsistencia } from '../../features/asistencia/hooks/useGuardarAsistencia'
import { fusionarPadron } from '../../sync/fusionar'
import { listarPendientesDeEvento } from '../../sync/outbox'
import { RUTAS } from '../../constants/routes'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'
import Card from '../../components/ui/Card/Card'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import Spinner from '../../components/ui/Spinner/Spinner'
import styles from './AsistenciaPage.module.css'

const AsistenciaPage = () => {
  const [lapsoId, setLapsoId] = useState<string | null>(null)
  const [eventoId, setEventoId] = useState<string | null>(null)

  const { data: lapsos = [], isLoading: cargandoLapsos } = useLapsos()
  const { data: eventos = [], isLoading: cargandoEventos, error: errorEventos } = useEventos(lapsoId)
  const { data: filas = [], isLoading: cargandoPadron, error: errorPadron, refetch: refetchPadron } =
    usePadron(eventoId)
  const guardarAsistencia = useGuardarAsistencia()

  const pendientes = useLiveQuery(
    () => (eventoId === null ? Promise.resolve([]) : listarPendientesDeEvento(eventoId)),
    [eventoId],
  )
  const filasFusionadas = fusionarPadron(filas, pendientes ?? [])

  const cambiarLapso = (id: string | null) => {
    setLapsoId(id)
    setEventoId(null)
  }

  const guardar = (cambios: CambioPadron[]) => {
    if (eventoId === null) return
    guardarAsistencia.mutate(cambios.map((cambio) => ({ ...cambio, id_event: eventoId })))
  }

  const errorEventosMensaje = errorEventos instanceof Error ? errorEventos.message : null
  const errorPadronMensaje = errorPadron instanceof Error ? errorPadron.message : null
  const errorGuardar = guardarAsistencia.error instanceof Error ? guardarAsistencia.error.message : null

  const eventoSeleccionado = eventos.find((evento) => evento.id === eventoId) ?? null

  return (
    <div className={styles.pagina}>
      <PageHeader titulo="Asistencia" subtitulo="Selecciona lapso y evento, luego registra la asistencia." />

      <Card>
        <header className={styles.cabecera}>
          <div>
            <h2 className={styles.titulo}>Flujo de registro</h2>
            <p className={styles.subtitulo}>1) Lapso · 2) Evento · 3) Registro</p>
          </div>
        </header>
        <div className={styles.cuerpo}>
          <div className={styles.seccion}>
            <span className={styles.etiqueta}>Lapso</span>
            {cargandoLapsos ? (
              <p className={styles.estado}>
                <Spinner /> Cargando lapsos…
              </p>
            ) : null}
            {!cargandoLapsos && lapsos.length === 0 ? (
              <p className={styles.ayuda} aria-live="polite">
                No hay lapsos para tomar asistencia. Crea uno en Eventos.
              </p>
            ) : null}
            {lapsos.length > 0 ? (
              <SelectorLapso lapsos={lapsos} valor={lapsoId} onCambiar={cambiarLapso} cargando={cargandoLapsos} />
            ) : null}
          </div>

          {lapsoId !== null ? (
            <div className={styles.seccion}>
              <span className={styles.etiqueta}>Evento</span>
              {cargandoEventos ? (
                <p className={styles.estado}>
                  <Spinner /> Cargando eventos…
                </p>
              ) : null}
              {errorEventos && !cargandoEventos ? (
                <Alert variante="error">Error: {errorEventosMensaje}</Alert>
              ) : null}
              {!cargandoEventos && !errorEventos && eventos.length === 0 ? (
                <div className={styles.vacio}>
                  <EmptyState>Este lapso no tiene eventos.</EmptyState>
                  <p className={styles.vacioAyuda}>Crea un evento para habilitar el registro de asistencia.</p>
                  <Link to={RUTAS.eventos}>
                    <Button variante="primary">Ir a Eventos</Button>
                  </Link>
                </div>
              ) : null}
              {!cargandoEventos && !errorEventos && eventos.length > 0 ? (
                <SelectorEvento eventos={eventos} valor={eventoId} onCambiar={setEventoId} />
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>

      {eventoId !== null ? (
        <Card>
          <header className={styles.cabecera}>
            <div>
              <h2 className={styles.titulo}>Registro de asistencia</h2>
              {eventoSeleccionado ? (
                <p className={styles.subtitulo}>
                  {eventoSeleccionado.event_name} · {eventoSeleccionado.event_date} · {eventoSeleccionado.type_event}
                </p>
              ) : (
                <p className={styles.subtitulo}>Padrón del evento seleccionado</p>
              )}
            </div>
          </header>
          <div className={styles.cuerpo}>
            {cargandoPadron ? (
              <p className={styles.estado}>
                <Spinner /> Cargando padrón…
              </p>
            ) : null}
            {errorPadron && !cargandoPadron ? (
              <Alert
                variante="error"
                acciones={
                  <Button variante="secondary" tamano="sm" onClick={() => refetchPadron()}>
                    Reintentar
                  </Button>
                }
              >
                Error: {errorPadronMensaje}
              </Alert>
            ) : null}
            {!cargandoPadron && !errorPadron ? (
              <PadronAsistencia
                key={eventoId}
                filas={filasFusionadas}
                enviando={guardarAsistencia.isPending}
                error={errorGuardar}
                onGuardar={guardar}
              />
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

export default AsistenciaPage
