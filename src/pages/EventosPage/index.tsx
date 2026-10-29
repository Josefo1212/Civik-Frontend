import { useState } from 'react'
import type { Lapso } from '../../domain/lapso'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import FormularioLapso, { type ValoresLapso } from '../../features/lapsos/components/FormularioLapso'
import TablaLapsos from '../../features/lapsos/components/TablaLapsos'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useLapsoMutations } from '../../features/lapsos/hooks/useLapsoMutations'
import { etiquetaLapso, lapsoActivo } from '../../features/lapsos/utils'
import { DIAS_SEMANA, ETIQUETAS_DIA } from '../../features/lapsos/constants'
import FormularioEvento, { type ValoresEvento } from '../../features/eventos/components/FormularioEvento'
import ListaEventos from '../../features/eventos/components/ListaEventos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useEventoMutations } from '../../features/eventos/hooks/useEventoMutations'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'
import Card from '../../components/ui/Card/Card'
import Drawer from '../../components/ui/Drawer/Drawer'
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
  const [drawerEventoAbierto, setDrawerEventoAbierto] = useState(false)
  const [drawerLapsoAbierto, setDrawerLapsoAbierto] = useState(false)
  const [modoLapso, setModoLapso] = useState<'crear' | 'editar' | 'reprogramar'>('crear')
  const [lapsoEditando, setLapsoEditando] = useState<Lapso | null>(null)
  const [diaReprogramar, setDiaReprogramar] = useState<string>('MONDAY')

  const { data: lapsos = [], isLoading: cargandoLapsos, error: errorLapsos, refetch: refetchLapsos } = useLapsos()
  const { crear: crearLapso, editar, activar, cerrar, reprogramar, generarAuto: generarAutoLapso } = useLapsoMutations()
  const activo = lapsoActivo(lapsos)
  const lapsoSeleccionado = lapsoId ?? activo?.id ?? lapsos[0]?.id ?? null
  const { data: eventos = [], isLoading: cargandoEventos, error: errorEventos, refetch: refetchEventos } = useEventos(lapsoSeleccionado)
  const { crear: crearEvento, cancelar, generarAuto } = useEventoMutations()
  const mostrarAdministrarLapsosEfectivo = mostrarAdministrarLapsos || lapsos.length === 0

  const manejarCrearLapso = (valores: ValoresLapso) => {
    setErrorGeneral(null)
    crearLapso.mutate(valores, {
      onSuccess: (lapso) => {
        setClaveFormularioLapso((k) => k + 1)
        setLapsoId(lapso.id)
        if (lapso.status === 'ACTIVE') {
          setMostrarAdministrarLapsos(false)
          generarAuto.mutate(lapso.id, {
            onSuccess: () => {
              refetchEventos()
              refetchLapsos()
            },
          })
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
        generarAuto.mutate(id, {
          onSuccess: () => {
            refetchEventos()
            refetchLapsos()
          },
        })
      },
      onError: (e) => {
        setOperandoId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo activar el lapso')
      },
    })
  }

  const manejarCerrar = (id: string) => {
    if (!window.confirm('¿Estás seguro de cerrar este lapso? Una vez cerrado no se podrá editar.')) {
      return
    }
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

  const manejarGenerarPracticas = (id: string) => {
    setErrorGeneral(null)
    setOperandoId(id)
    generarAutoLapso.mutate(id, {
      onSuccess: () => {
        setOperandoId(null)
        refetchEventos()
        refetchLapsos()
      },
      onError: (e) => {
        setOperandoId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudieron generar las prácticas')
      },
    })
  }

  const abrirCrearLapso = () => {
    setErrorGeneral(null)
    setModoLapso('crear')
    setLapsoEditando(null)
    setClaveFormularioLapso((k) => k + 1)
    setDrawerLapsoAbierto(true)
  }

  const abrirEditarLapso = (lapso: Lapso) => {
    setErrorGeneral(null)
    setModoLapso('editar')
    setLapsoEditando(lapso)
    setClaveFormularioLapso((k) => k + 1)
    setDrawerLapsoAbierto(true)
  }

  const abrirReprogramarLapso = (lapso: Lapso) => {
    setErrorGeneral(null)
    setModoLapso('reprogramar')
    setLapsoEditando(lapso)
    setDiaReprogramar(lapso.practice_day)
    setDrawerLapsoAbierto(true)
  }

  const manejarEditarLapso = (valores: ValoresLapso) => {
    if (!lapsoEditando) return
    setErrorGeneral(null)
    editar.mutate(
      { id: lapsoEditando.id, payload: valores },
      {
        onSuccess: () => {
          setDrawerLapsoAbierto(false)
          setLapsoEditando(null)
        },
        onError: (e) => {
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo editar el lapso')
        },
      },
    )
  }

  const manejarReprogramarLapso = () => {
    if (!lapsoEditando) return
    setErrorGeneral(null)
    reprogramar.mutate(
      { id: lapsoEditando.id, practice_day: diaReprogramar },
      {
        onSuccess: () => {
          setDrawerLapsoAbierto(false)
          setLapsoEditando(null)
          generarAuto.mutate(lapsoEditando.id, {
            onSuccess: () => {
              refetchEventos()
              refetchLapsos()
            },
          })
        },
        onError: (e) => {
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo reprogramar el día de práctica')
        },
      },
    )
  }

  const manejarCrearEvento = (valores: ValoresEvento) => {
    if (lapsoSeleccionado === null) return
    setErrorGeneral(null)
    crearEvento.mutate(
      { id_lapse: lapsoSeleccionado, ...valores },
      {
        onSuccess: () => {
          setClaveFormularioEvento((k) => k + 1)
          setDrawerEventoAbierto(false)
        },
        onError: (e) => {
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear el evento')
        },
      },
    )
  }

  const abrirNuevoEvento = () => {
    setErrorGeneral(null)
    setClaveFormularioEvento((k) => k + 1)
    setDrawerEventoAbierto(true)
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

      {lapsos.length > 0 ? (
        <Card>
          <div className={styles.resumenLapso}>
            <div>
              <p className={styles.resumenEtiqueta}>{activo ? 'Lapso activo' : 'Lapsos'}</p>
              <p className={styles.resumenValor}>{activo ? etiquetaLapso(activo) : 'Gestionar lapsos'}</p>
              {activo ? (
                <p className={styles.resumenFechas}>{activo.start_date} → {activo.end_date}</p>
              ) : (
                <p className={styles.resumenFechas}>Hay {lapsos.length} lapso(s) registrado(s)</p>
              )}
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
              <div>
                <h2 className={styles.panelTitulo} id="titulo-lapsos">
                  Lapsos
                </h2>
                <p className={styles.panelSubtitulo}>Crear, editar, activar, reprogramar o cerrar lapsos.</p>
              </div>
              <Button variante="primary" onClick={abrirCrearLapso}>
                + Nuevo lapso
              </Button>
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
            {!cargandoLapsos && !errorLapsos && lapsos.length > 0 ? (
              <div className={styles.tablaWrapper}>
                <TablaLapsos
                  lapsos={lapsos}
                  onActivar={manejarActivar}
                  onCerrar={manejarCerrar}
                  onEditar={abrirEditarLapso}
                  onReprogramar={abrirReprogramarLapso}
                  onGenerarPracticas={manejarGenerarPracticas}
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
              <h2 className={styles.panelTitulo}>Eventos</h2>
              <p className={styles.panelSubtitulo}>Lista cronológica por lapso seleccionado</p>
            </div>
            {lapsoSeleccionado !== null ? (
              <Button variante="primary" onClick={abrirNuevoEvento}>
                + Nuevo evento
              </Button>
            ) : null}
          </header>
          <div className={styles.panelCuerpo}>
            <div className={styles.filtros}>
              <SelectorLapso
                lapsos={lapsos}
                valor={lapsoSeleccionado}
                onCambiar={setLapsoId}
                cargando={cargandoLapsos}
              />
            </div>
            {lapsoSeleccionado !== null ? (
              <>
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
                    <p className={styles.vacioAyuda}>Crea el primer evento para habilitar el registro de asistencia.</p>
                    <Button variante="primary" onClick={abrirNuevoEvento}>Crear evento</Button>
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
              <p className={styles.ayuda}>Selecciona un lapso para administrar sus eventos.</p>
            )}
          </div>
        </section>
      ) : null}

      <Drawer
        abierto={drawerLapsoAbierto}
        titulo={modoLapso === 'crear' ? 'Nuevo lapso' : modoLapso === 'editar' ? 'Editar lapso' : 'Reprogramar día de práctica'}
        subtitulo={
          modoLapso === 'crear'
            ? 'Configura año, número, fechas y día de práctica regular.'
            : modoLapso === 'editar'
              ? 'Solo editable mientras el lapso esté en PLANNED.'
              : 'Cambia el día y se reubicarán las prácticas pendientes.'
        }
        onCerrar={() => {
          setDrawerLapsoAbierto(false)
          setLapsoEditando(null)
        }}
        pie={
          modoLapso === 'reprogramar' ? (
            <>
              <Button variante="secondary" onClick={() => setDrawerLapsoAbierto(false)}>
                Cancelar
              </Button>
              <Button variante="primary" disabled={reprogramar.isPending} onClick={manejarReprogramarLapso}>
                {reprogramar.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </>
          ) : (
            <>
              <Button variante="secondary" onClick={() => setDrawerLapsoAbierto(false)}>
                Cancelar
              </Button>
              <Button
                form="formulario-lapso"
                type="submit"
                variante="primary"
                disabled={crearLapso.isPending || editar.isPending}
              >
                {crearLapso.isPending || editar.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </>
          )
        }
      >
        {modoLapso === 'reprogramar' && lapsoEditando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: 'var(--texto-sm)', color: 'var(--ink-muted)' }}>Día de práctica regular</span>
              <select
                value={diaReprogramar}
                onChange={(e) => setDiaReprogramar(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radio)',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                }}
              >
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia} value={dia}>
                    {ETIQUETAS_DIA[dia]}
                  </option>
                ))}
              </select>
            </label>
            {errorGeneral ? <Alert variante="error">{errorGeneral}</Alert> : null}
          </div>
        ) : (
          <FormularioLapso
            idFormulario="formulario-lapso"
            key={claveFormularioLapso}
            enviando={crearLapso.isPending || editar.isPending}
            error={errorGeneral}
            valoresIniciales={
              modoLapso === 'editar' && lapsoEditando
                ? {
                    school_year: String(lapsoEditando.school_year),
                    lapse_number: String(lapsoEditando.lapse_number),
                    start_date: lapsoEditando.start_date,
                    end_date: lapsoEditando.end_date,
                    practice_day: lapsoEditando.practice_day,
                  }
                : undefined
            }
            onSubmit={modoLapso === 'crear' ? manejarCrearLapso : manejarEditarLapso}
          />
        )}
      </Drawer>

      <Drawer
        abierto={drawerEventoAbierto}
        titulo="Nuevo evento"
        subtitulo="Agrega una práctica o presentación al lapso seleccionado."
        onCerrar={() => setDrawerEventoAbierto(false)}
        pie={
          <>
            <Button variante="secondary" onClick={() => setDrawerEventoAbierto(false)}>
              Cancelar
            </Button>
            <Button form="formulario-evento" type="submit" variante="primary" disabled={crearEvento.isPending}>
              {crearEvento.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <FormularioEvento
          idFormulario="formulario-evento"
          key={claveFormularioEvento}
          enviando={crearEvento.isPending}
          error={errorGeneral}
          onSubmit={manejarCrearEvento}
        />
      </Drawer>
    </div>
  )
}

export default EventosPage
