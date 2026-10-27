import { useState } from 'react'
import { Link } from 'react-router-dom'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import FormularioLapso, { type ValoresLapso } from '../../features/lapsos/components/FormularioLapso'
import TablaLapsos from '../../features/lapsos/components/TablaLapsos'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useLapsoMutations } from '../../features/lapsos/hooks/useLapsoMutations'
import { etiquetaLapso, lapsoActivo } from '../../features/lapsos/utils'
import FormularioEvento, { type ValoresEvento } from '../../features/eventos/components/FormularioEvento'
import ListaEventos from '../../features/eventos/components/ListaEventos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useEventoMutations } from '../../features/eventos/hooks/useEventoMutations'
import { RUTAS } from '../../constants/routes'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'
import Card from '../../components/ui/Card/Card'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import Spinner from '../../components/ui/Spinner/Spinner'
import styles from './EventosPage.module.css'

const EventosPage = () => {
  const [lapsoId, setLapsoId] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [operandoId, setOperandoId] = useState<string | null>(null)
  const [eventoCancelandoId, setEventoCancelandoId] = useState<string | null>(null)
  const [claveFormularioLapso, setClaveFormularioLapso] = useState(0)
  const [claveFormularioEvento, setClaveFormularioEvento] = useState(0)
  const [mostrarAdministrarLapsos, setMostrarAdministrarLapsos] = useState(false)

  const { data: lapsos = [], isLoading: cargandoLapsos, error: errorLapsos, refetch: refetchLapsos } = useLapsos()
  const { crear: crearLapso, activar, cerrar } = useLapsoMutations()
  const activo = lapsoActivo(lapsos)
  const lapsoSeleccionado = lapsoId ?? activo?.id ?? lapsos[0]?.id ?? null
  const { data: eventos = [], isLoading: cargandoEventos, error: errorEventos, refetch: refetchEventos } = useEventos(lapsoSeleccionado)
  const { crear: crearEvento, cancelar } = useEventoMutations()
  const mostrarAdministrarLapsosEfectivo = mostrarAdministrarLapsos || (activo === null && lapsos.length === 0)

  const manejarCrearLapso = (valores: ValoresLapso) => {
    setErrorGeneral(null)
    crearLapso.mutate(valores, {
      onSuccess: (lapso) => {
        setClaveFormularioLapso((k) => k + 1)
        setLapsoId(lapso.id)
        if (lapso.status === 'ACTIVE') {
          setMostrarAdministrarLapsos(false)
        }
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
      onSuccess: () => {
        setOperandoId(null)
        setLapsoId(id)
        setMostrarAdministrarLapsos(false)
      },
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
    if (lapsoSeleccionado === null) return
    setErrorGeneral(null)
    crearEvento.mutate(
      { id_lapse: lapsoSeleccionado, ...valores },
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
  const sinEventos = !cargandoEventos && !errorEventos && eventos.length === 0

  return (
    <div className={styles.pagina}>
      <PageHeader
        titulo="Eventos"
        subtitulo="Gestiona lapsos y eventos para poder tomar asistencia."
      />

      {activo !== null && !mostrarAdministrarLapsosEfectivo ? (
        <Card>
          <div className={styles.resumenLapso}>
            <div>
              <p className={styles.resumenEtiqueta}>Lapso activo</p>
              <p className={styles.resumenValor}>{etiquetaLapso(activo)}</p>
              <p className={styles.resumenFechas}>{activo.start_date} → {activo.end_date}</p>
            </div>
            <Button variante="secondary" tamano="sm" onClick={() => setMostrarAdministrarLapsos(true)}>
              Administrar lapsos
            </Button>
          </div>
        </Card>
      ) : null}

      {mostrarAdministrarLapsosEfectivo ? (
        <div className={styles.seccion}>
          <section className={`${styles.panelGlass} glass-panel`} aria-labelledby="titulo-lapsos">
            <header className={styles.cabeceraGlass}>
              <h2 className={styles.panelTitulo} id="titulo-lapsos">
                Lapsos
              </h2>
            </header>
            {cargandoLapsos ? (
              <p className={styles.estado}>
                <Spinner /> Cargando lapsos…
              </p>
            ) : null}
            {errorLapsos && !cargandoLapsos ? (
              <Alert
                variante="error"
                acciones={
                  <Button variante="secondary" tamano="sm" onClick={() => refetchLapsos()}>
                    Reintentar
                  </Button>
                }
              >
                Error: {errorLapsosMensaje}
              </Alert>
            ) : null}
            {sinLapsos ? (
              <p className={styles.ayuda} aria-live="polite">
                Todavía no hay lapsos. Creá el primero para empezar a programar eventos.
              </p>
            ) : null}
            <FormularioLapso
              key={claveFormularioLapso}
              enviando={crearLapso.isPending}
              error={errorGeneral}
              onSubmit={manejarCrearLapso}
            />
            {!cargandoLapsos && !errorLapsos && lapsos.length > 0 ? (
              <div className={styles.tablaWrapper}>
                <TablaLapsos
                  lapsos={lapsos}
                  onActivar={manejarActivar}
                  onCerrar={manejarCerrar}
                  operandoId={operandoId}
                />
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {lapsos.length > 0 ? (
        <section className={styles.panel}>
          <header className={styles.panelCabecera}>
            <div>
              <h2 className={styles.panelTitulo}>Eventos del lapso</h2>
              <p className={styles.panelSubtitulo}>Selecciona el lapso para ver, crear o cancelar eventos.</p>
            </div>
          </header>
          <div className={styles.panelCuerpo}>
            <SelectorLapso
              lapsos={lapsos}
              valor={lapsoSeleccionado}
              onCambiar={setLapsoId}
              cargando={cargandoLapsos}
            />
            {lapsoSeleccionado !== null ? (
              <>
                <div className={styles.formularioEvento}>
                  <h3 className={styles.subtitulo}>Crear evento</h3>
                  <FormularioEvento
                    key={claveFormularioEvento}
                    enviando={crearEvento.isPending}
                    error={errorGeneral}
                    onSubmit={manejarCrearEvento}
                  />
                </div>
                {cargandoEventos ? (
                  <p className={styles.estado}>
                    <Spinner /> Cargando eventos…
                  </p>
                ) : null}
                {errorEventos && !cargandoEventos ? (
                  <Alert
                    variante="error"
                    acciones={
                      <Button variante="secondary" tamano="sm" onClick={() => refetchEventos()}>
                        Reintentar
                      </Button>
                    }
                  >
                    Error: {errorEventosMensaje}
                  </Alert>
                ) : null}
                {!cargandoEventos && !errorEventos && sinEventos ? (
                  <div className={styles.vacio}>
                    <EmptyState>Este lapso todavía no tiene eventos.</EmptyState>
                    <p className={styles.vacioAyuda}>Creá el primer evento para empezar a tomar asistencia.</p>
                    <Link to={RUTAS.asistencia}>
                      <Button variante="secondary" tamano="sm">Ir a Asistencia</Button>
                    </Link>
                  </div>
                ) : null}
                {!cargandoEventos && !errorEventos && !sinEventos ? (
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
            ) : (
              <p className={styles.ayuda}>Seleccioná un lapso para administrar sus eventos.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default EventosPage
