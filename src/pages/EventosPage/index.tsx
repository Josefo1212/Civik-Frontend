import { useState } from 'react'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import FormularioLapso, { type ValoresLapso } from '../../features/lapsos/components/FormularioLapso'
import TablaLapsos from '../../features/lapsos/components/TablaLapsos'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useLapsoMutations } from '../../features/lapsos/hooks/useLapsoMutations'
import FormularioEvento, { type ValoresEvento } from '../../features/eventos/components/FormularioEvento'
import ListaEventos from '../../features/eventos/components/ListaEventos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useEventoMutations } from '../../features/eventos/hooks/useEventoMutations'

const EventosPage = () => {
  const [lapsoId, setLapsoId] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [operandoId, setOperandoId] = useState<string | null>(null)
  const [eventoCancelandoId, setEventoCancelandoId] = useState<string | null>(null)
  const [claveFormularioLapso, setClaveFormularioLapso] = useState(0)
  const [claveFormularioEvento, setClaveFormularioEvento] = useState(0)

  const { data: lapsos = [], isLoading: cargandoLapsos, error: errorLapsos, refetch: refetchLapsos } = useLapsos()
  const { crear: crearLapso, activar, cerrar } = useLapsoMutations()
  const { data: eventos = [], isLoading: cargandoEventos, error: errorEventos, refetch: refetchEventos } = useEventos(lapsoId)
  const { crear: crearEvento, cancelar } = useEventoMutations()

  const manejarCrearLapso = (valores: ValoresLapso) => {
    setErrorGeneral(null)
    crearLapso.mutate(valores, {
      onSuccess: (lapso) => {
        setClaveFormularioLapso((k) => k + 1)
        setLapsoId((actual) => actual ?? lapso.id)
      },
      onError: (e) => {
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear el lapso')
      },
    })
  }

  const manejarActivar = (id: string) => {
    setErrorGeneral(null)
    setOperandoId(id)
    activar.mutate(id, {
      onSuccess: () => setOperandoId(null),
      onError: (e) => {
        setOperandoId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo activar el lapso')
      },
    })
  }

  const manejarCerrar = (id: string) => {
    setErrorGeneral(null)
    setOperandoId(id)
    cerrar.mutate(id, {
      onSuccess: () => setOperandoId(null),
      onError: (e) => {
        setOperandoId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo cerrar el lapso')
      },
    })
  }

  const manejarCrearEvento = (valores: ValoresEvento) => {
    if (lapsoId === null) return
    setErrorGeneral(null)
    crearEvento.mutate(
      { id_lapse: lapsoId, ...valores },
      {
        onSuccess: () => setClaveFormularioEvento((k) => k + 1),
        onError: (e) => {
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear el evento')
        },
      },
    )
  }

  const manejarConfirmarCancelar = (id: string, motivo: string) => {
    setErrorGeneral(null)
    setOperandoId(id)
    cancelar.mutate(
      { id, motivo },
      {
        onSuccess: () => {
          setOperandoId(null)
          setEventoCancelandoId(null)
        },
        onError: (e) => {
          setOperandoId(null)
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo cancelar el evento')
        },
      },
    )
  }

  const errorLapsosMensaje = errorLapsos instanceof Error ? errorLapsos.message : errorGeneral
  const errorEventosMensaje = errorEventos instanceof Error ? errorEventos.message : errorGeneral
  const sinLapsos = !cargandoLapsos && !errorLapsos && lapsos.length === 0

  return (
    <main style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Eventos</h1>

      <section>
        <h2>Lapsos</h2>
        {cargandoLapsos ? <p>Cargando lapsos...</p> : null}
        {errorLapsos && !cargandoLapsos ? (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#dc2626' }}>Error: {errorLapsosMensaje}</p>
            <button type='button' onClick={() => refetchLapsos()}>
              Reintentar
            </button>
          </div>
        ) : null}
        {sinLapsos ? (
          <p aria-live='polite'>
            Todavía no hay lapsos. Creá el primero para empezar a programar eventos.
          </p>
        ) : null}
        <FormularioLapso
          key={claveFormularioLapso}
          enviando={crearLapso.isPending}
          error={errorGeneral}
          onSubmit={manejarCrearLapso}
        />
        {!cargandoLapsos && !errorLapsos ? (
          <TablaLapsos
            lapsos={lapsos}
            onActivar={manejarActivar}
            onCerrar={manejarCerrar}
            operandoId={operandoId}
          />
        ) : null}
      </section>

      {lapsos.length > 0 ? (
        <section>
          <h2>Eventos del lapso</h2>
          <SelectorLapso
            lapsos={lapsos}
            valor={lapsoId}
            onCambiar={setLapsoId}
            cargando={cargandoLapsos}
          />
          {lapsoId !== null ? (
            <>
              <FormularioEvento
                key={claveFormularioEvento}
                enviando={crearEvento.isPending}
                error={errorGeneral}
                onSubmit={manejarCrearEvento}
              />
              {cargandoEventos ? <p>Cargando eventos...</p> : null}
              {errorEventos && !cargandoEventos ? (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#dc2626' }}>Error: {errorEventosMensaje}</p>
                  <button type='button' onClick={() => refetchEventos()}>
                    Reintentar
                  </button>
                </div>
              ) : null}
              {!cargandoEventos && !errorEventos ? (
                <ListaEventos
                  eventos={eventos}
                  eventoCancelandoId={eventoCancelandoId}
                  operandoId={operandoId}
                  onIniciarCancelar={setEventoCancelandoId}
                  onCancelarCancelar={() => setEventoCancelandoId(null)}
                  onConfirmarCancelar={manejarConfirmarCancelar}
                />
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}

export default EventosPage
