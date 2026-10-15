import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
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
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'

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

  return (
    <main style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Asistencia</h1>

      <section>
        {cargandoLapsos ? <p>Cargando lapsos...</p> : null}
        {!cargandoLapsos && lapsos.length === 0 ? (
          <p aria-live='polite'>Todavía no hay lapsos para tomar asistencia.</p>
        ) : null}
        {lapsos.length > 0 ? (
          <SelectorLapso lapsos={lapsos} valor={lapsoId} onCambiar={cambiarLapso} cargando={cargandoLapsos} />
        ) : null}
      </section>

      {lapsoId !== null ? (
        <section>
          {cargandoEventos ? <p>Cargando eventos...</p> : null}
          {errorEventos && !cargandoEventos ? (
            <Alert variante="error">Error: {errorEventosMensaje}</Alert>
          ) : null}
          {!cargandoEventos && !errorEventos && eventos.length === 0 ? (
            <p aria-live='polite'>Este lapso no tiene eventos. Creá uno en la pantalla de Eventos.</p>
          ) : null}
          {!cargandoEventos && !errorEventos && eventos.length > 0 ? (
            <SelectorEvento eventos={eventos} valor={eventoId} onCambiar={setEventoId} />
          ) : null}
        </section>
      ) : null}

      {eventoId !== null ? (
        <section>
          {cargandoPadron ? <p>Cargando padrón...</p> : null}
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
        </section>
      ) : null}
    </main>
  )
}

export default AsistenciaPage
