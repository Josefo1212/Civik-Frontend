import { useState } from 'react'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import SelectorEvento from '../../features/asistencia/components/SelectorEvento'
import PadronAsistencia, { type ItemNuevo } from '../../features/asistencia/components/PadronAsistencia'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { usePadron } from '../../features/asistencia/hooks/usePadron'
import { useRegistrarAsistencia } from '../../features/asistencia/hooks/useRegistrarAsistencia'

const AsistenciaPage = () => {
  const [lapsoId, setLapsoId] = useState<string | null>(null)
  const [eventoId, setEventoId] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const { data: lapsos = [], isLoading: cargandoLapsos } = useLapsos()
  const { data: eventos = [], isLoading: cargandoEventos, error: errorEventos } = useEventos(lapsoId)
  const { data: filas = [], isLoading: cargandoPadron, error: errorPadron, refetch: refetchPadron } =
    usePadron(eventoId)
  const registrar = useRegistrarAsistencia()

  const cambiarLapso = (id: string | null) => {
    setLapsoId(id)
    setEventoId(null)
    setErrorGeneral(null)
  }

  const cambiarEvento = (id: string | null) => {
    setEventoId(id)
    setErrorGeneral(null)
  }

  const guardar = (items: ItemNuevo[]) => {
    if (eventoId === null) return
    setErrorGeneral(null)
    registrar.mutate(
      { eventoId, items },
      {
        onError: (e) => {
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo guardar la asistencia')
        },
      },
    )
  }

  const errorEventosMensaje = errorEventos instanceof Error ? errorEventos.message : errorGeneral
  const errorPadronMensaje = errorPadron instanceof Error ? errorPadron.message : errorGeneral

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
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: '#dc2626' }}>Error: {errorEventosMensaje}</p>
            </div>
          ) : null}
          {!cargandoEventos && !errorEventos && eventos.length === 0 ? (
            <p aria-live='polite'>Este lapso no tiene eventos. Creá uno en la pantalla de Eventos.</p>
          ) : null}
          {!cargandoEventos && !errorEventos && eventos.length > 0 ? (
            <SelectorEvento eventos={eventos} valor={eventoId} onCambiar={cambiarEvento} />
          ) : null}
        </section>
      ) : null}

      {eventoId !== null ? (
        <section>
          {cargandoPadron ? <p>Cargando padrón...</p> : null}
          {errorPadron && !cargandoPadron ? (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: '#dc2626' }}>Error: {errorPadronMensaje}</p>
              <button type='button' onClick={() => refetchPadron()}>
                Reintentar
              </button>
            </div>
          ) : null}
          {!cargandoPadron && !errorPadron ? (
            <PadronAsistencia
              key={eventoId}
              filas={filas}
              enviando={registrar.isPending}
              error={errorGeneral}
              onGuardar={guardar}
            />
          ) : null}
        </section>
      ) : null}
    </main>
  )
}

export default AsistenciaPage
