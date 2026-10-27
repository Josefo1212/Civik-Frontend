import { useMemo, useState } from 'react'
import type { Estudiante } from '../../domain/estudiante'
import type { EstadoAsistencia } from '../../domain/asistencia'
import type { Seccion } from '../../domain/seccion'
import SelectorSeccion from '../../features/estudiantes/components/SelectorSeccion'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import DetalleEstudiante from '../../features/estudiantes/components/DetalleEstudiante'
import FormularioEstudiante, { type ValoresEstudiante } from '../../features/estudiantes/components/FormularioEstudiante'
import TablaEstudiantes from '../../features/estudiantes/components/TablaEstudiantes'
import TablaEstudiantesGlobal from '../../features/estudiantes/components/TablaEstudiantesGlobal'
import ListaSeccionesInactivas from '../../features/secciones/components/ListaSeccionesInactivas'
import FormularioSeccion, { type ValoresFormulario } from '../../features/secciones/components/FormularioSeccion'
import FiltroGrado from '../../features/secciones/components/FiltroGrado'
import TablaSecciones from '../../features/secciones/components/TablaSecciones'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useSeccionMutations } from '../../features/secciones/hooks/useSeccionMutations'
import { useEstudiantes, useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import { useEstudianteMutations } from '../../features/estudiantes/hooks/useEstudianteMutations'
import { useAsistenciaLapso } from '../../features/estudiantes/hooks/useAsistenciaLapso'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import { useEventos } from '../../features/eventos/hooks/useEventos'
import { useGuardarAsistencia } from '../../features/asistencia/hooks/useGuardarAsistencia'
import { lapsoActivo } from '../../features/lapsos/utils'
import { etiquetaSeccion } from '../../features/secciones/utils'
import { filtrarEstudiantes } from '../../features/estudiantes/utils'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'
import Card from '../../components/ui/Card/Card'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import SegmentedControl from '../../components/ui/SegmentedControl/SegmentedControl'
import Spinner from '../../components/ui/Spinner/Spinner'
import Switch from '../../components/ui/Switch/Switch'
import TextField from '../../components/ui/TextField/TextField'
import styles from './AlumnosYSeccionesPage.module.css'
import estilosSecciones from '../SeccionesPage/SeccionesPage.module.css'

type Modo = 'alumnos' | 'secciones'

const OPCIONES_MODO: { valor: Modo; etiqueta: string }[] = [
  { valor: 'alumnos', etiqueta: 'Alumnos' },
  { valor: 'secciones', etiqueta: 'Secciones' },
]

const AlumnosYSeccionesPage = () => {
  const [modo, setModo] = useState<Modo>('alumnos')
  const [seccionId, setSeccionId] = useState<string | null>(null)
  const [incluirInactivos, setIncluirInactivos] = useState(false)
  const [incluirInactivosGlobal, setIncluirInactivosGlobal] = useState(false)
  const [mostrarSeccionesBajas, setMostrarSeccionesBajas] = useState(false)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [estudianteEditando, setEstudianteEditando] = useState<Estudiante | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [operandoId, setOperandoId] = useState<string | null>(null)
  const [operandoSeccionId, setOperandoSeccionId] = useState<string | null>(null)
  const [claveFormulario, setClaveFormulario] = useState(0)
  const [lapsoId, setLapsoId] = useState<string | null>(null)
  const [filaExpandidaId, setFilaExpandidaId] = useState<string | null>(null)

  const { data: secciones = [], isLoading: cargandoSecciones } = useSecciones(undefined)
  const {
    data: seccionesGlobal = [],
    error: errorSeccionesGlobal,
    refetch: refetchSeccionesGlobal,
  } = useSecciones(undefined, true)
  const { data: estudiantes = [], isLoading, error, refetch } = useEstudiantes(seccionId, incluirInactivos)
  const {
    data: estudiantesGlobal = [],
    isLoading: cargandoGlobal,
    error: errorGlobal,
    refetch: refetchGlobal,
  } = useEstudiantesGlobal(incluirInactivosGlobal)
  const { crear, editar, baja, reactivar } = useEstudianteMutations()

  const { data: lapsos = [] } = useLapsos()
  const lapsoSeleccionado = lapsoId ?? lapsoActivo(lapsos)?.id ?? null
  const { data: eventos = [] } = useEventos(lapsoSeleccionado)
  const { porEstudiante } = useAsistenciaLapso(eventos)
  const guardarAsistencia = useGuardarAsistencia()
  const lapso = lapsos.find((l) => l.id === lapsoSeleccionado) ?? null
  const { reactivar: reactivarSeccion } = useSeccionMutations()

  const mapaSecciones = useMemo(
    () => new Map(seccionesGlobal.map((seccion) => [seccion.id, seccion])),
    [seccionesGlobal],
  )

  const etiquetaPorSeccion = (idSeccion: string) => {
    const seccion = mapaSecciones.get(idSeccion)
    if (seccion === undefined || !seccion.active) return 'Sección dada de baja'
    return etiquetaSeccion(seccion)
  }

  const seccionesInactivas = seccionesGlobal.filter((seccion) => !seccion.active)
  const estudiantesFiltrados = filtrarEstudiantes(estudiantesGlobal, textoBusqueda)
  const mensajeVacio =
    textoBusqueda.trim() === ''
      ? 'No hay estudiantes para mostrar.'
      : `Sin coincidencias para «${textoBusqueda.trim()}».`

  const valorInicial = useMemo<ValoresEstudiante | undefined>(() => {
    if (estudianteEditando === null) return undefined
    return {
      id_seccion: estudianteEditando.id_section,
      apellido: estudianteEditando.last_name,
      nombre: estudianteEditando.first_name,
      telefono: estudianteEditando.phone ?? '',
    }
  }, [estudianteEditando])

  const manejarSubmit = (valores: ValoresEstudiante) => {
    setErrorGeneral(null)
    const telefono = valores.telefono === '' ? null : valores.telefono
    if (estudianteEditando !== null) {
      setOperandoId(estudianteEditando.id)
      editar.mutate(
        { estudianteId: estudianteEditando.id, payload: { id_seccion: valores.id_seccion, apellido: valores.apellido, nombre: valores.nombre, telefono } },
        {
          onSuccess: () => {
            setEstudianteEditando(null)
            setOperandoId(null)
          },
          onError: (e) => {
            setOperandoId(null)
            setErrorGeneral(e instanceof Error ? e.message : 'No se pudo editar')
          },
        },
      )
      return
    }
    if (seccionId === null) {
      setErrorGeneral('Debes seleccionar una sección')
      return
    }
    setOperandoId(null)
    crear.mutate(
      { seccionId, payload: { apellido: valores.apellido, nombre: valores.nombre, telefono } },
      {
        onSuccess: () => {
          setEstudianteEditando(null)
          setClaveFormulario((k) => k + 1)
        },
        onError: (e) => {
          setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear')
        },
      },
    )
  }

  const manejarBaja = (id: string) => {
    setErrorGeneral(null)
    setOperandoId(id)
    baja.mutate(id, {
      onSuccess: () => setOperandoId(null),
      onError: (e) => {
        setOperandoId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo dar de baja')
      },
    })
  }

  const manejarReactivar = (id: string) => {
    setErrorGeneral(null)
    setOperandoId(id)
    reactivar.mutate(id, {
      onSuccess: () => setOperandoId(null),
      onError: (e) => {
        setOperandoId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo reactivar')
      },
    })
  }

  const manejarReactivarSeccion = (id: string) => {
    setErrorGeneral(null)
    setOperandoSeccionId(id)
    reactivarSeccion.mutate(id, {
      onSuccess: () => setOperandoSeccionId(null),
      onError: (e) => {
        setOperandoSeccionId(null)
        setErrorGeneral(e instanceof Error ? e.message : 'No se pudo reactivar la sección')
      },
    })
  }

  const cancelarEdicion = () => setEstudianteEditando(null)
  const errorMensaje = error instanceof Error ? error.message : errorGeneral
  const errorPadron = errorGlobal ?? errorSeccionesGlobal
  const hayErrorPadron = errorPadron != null
  const errorGlobalMensaje = errorPadron instanceof Error ? errorPadron.message : 'No se pudo cargar el padrón'
  const reintentarGlobal = () => {
    refetchGlobal()
    refetchSeccionesGlobal()
  }

  const alternarFila = (id: string) => {
    setFilaExpandidaId((previo) => (previo === id ? null : id))
  }

  const corregirAsistencia = (idEvent: string, state: EstadoAsistencia) => {
    if (filaExpandidaId === null) return
    guardarAsistencia.mutate([{ id_event: idEvent, id_student: filaExpandidaId, state }])
  }

  const renderDetalle = (estudiante: Estudiante) => (
    <DetalleEstudiante
      estudiante={estudiante}
      lapsoId={lapsoSeleccionado}
      estadoLapso={lapso?.status ?? 'ACTIVE'}
      eventos={eventos}
      asistencia={porEstudiante.get(estudiante.id)}
      onCorregir={corregirAsistencia}
      enviando={guardarAsistencia.isPending}
    />
  )

  const [grado, setGrado] = useState<string>('todos')
  const [seccionEditando, setSeccionEditando] = useState<Seccion | null>(null)
  const [bajasEnSesion, setBajasEnSesion] = useState<Seccion[]>([])
  const [errorGeneralSecciones, setErrorGeneralSecciones] = useState<string | null>(null)
  const [operandoIdSeccion, setOperandoIdSeccion] = useState<string | null>(null)

  const { data: seccionesListado = [], isLoading: isLoadingSecciones, error: errorSeccionesListado, refetch: refetchSeccionesListado } = useSecciones(grado === 'todos' ? undefined : grado)
  const { crear: crearSeccion, editar: editarSeccion, darDeBaja: darDeBajaSeccion, reactivar: reactivarSeccionMut, eliminar: eliminarSeccion } = useSeccionMutations()

  const valorInicialFormulario = useMemo<ValoresFormulario | undefined>(() => {
    if (seccionEditando === null) return undefined
    return {
      grade_level: seccionEditando.grade_level,
      section: seccionEditando.section,
      shift: seccionEditando.shift,
    }
  }, [seccionEditando])

  const estaBajaEnSesion = (id: string) => bajasEnSesion.some((s) => s.id === id)

  const manejarSubmitSeccion = (valores: ValoresFormulario) => {
    setErrorGeneralSecciones(null)
    if (seccionEditando !== null) {
      setOperandoIdSeccion(seccionEditando.id)
      editarSeccion.mutate(
        { id: seccionEditando.id, payload: valores },
        {
          onSuccess: () => {
            setSeccionEditando(null)
            setOperandoIdSeccion(null)
          },
          onError: (e: unknown) => {
            setOperandoIdSeccion(null)
            const mensaje = e instanceof Error ? e.message : 'No se pudo editar la sección'
            setErrorGeneralSecciones(mensaje)
          },
        },
      )
      return
    }

    setOperandoIdSeccion(null)
    crearSeccion.mutate(valores, {
      onSuccess: () => {
        setSeccionEditando(null)
        setOperandoIdSeccion(null)
      },
      onError: (e: unknown) => {
        setOperandoIdSeccion(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo crear la sección'
        setErrorGeneralSecciones(mensaje)
      },
    })
  }

  const iniciarEdicionSeccion = (seccion: Seccion) => {
    setSeccionEditando(seccion)
    setErrorGeneralSecciones(null)
  }

  const cancelarEdicionSeccion = () => {
    setSeccionEditando(null)
  }

  const manejarDarDeBajaSeccion = (seccion: Seccion) => {
    setErrorGeneralSecciones(null)
    setOperandoIdSeccion(seccion.id)
    darDeBajaSeccion.mutate(seccion.id, {
      onSuccess: () => {
        setBajasEnSesion((prev) => {
          if (prev.some((s) => s.id === seccion.id)) return prev
          return [...prev, { ...seccion, active: false }]
        })
        setOperandoIdSeccion(null)
      },
      onError: (e: unknown) => {
        setOperandoIdSeccion(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo dar de baja la sección'
        setErrorGeneralSecciones(mensaje)
      },
    })
  }

  const manejarReactivarSeccionDirecto = (seccion: Seccion) => {
    setErrorGeneralSecciones(null)
    setOperandoIdSeccion(seccion.id)
    reactivarSeccionMut.mutate(seccion.id, {
      onSuccess: () => {
        setBajasEnSesion((prev) => prev.filter((s) => s.id !== seccion.id))
        setOperandoIdSeccion(null)
      },
      onError: (e: unknown) => {
        setOperandoIdSeccion(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo reactivar la sección'
        setErrorGeneralSecciones(mensaje)
      },
    })
  }

  const manejarEliminarSeccion = (seccion: Seccion) => {
    setErrorGeneralSecciones(null)
    setOperandoIdSeccion(seccion.id)
    eliminarSeccion.mutate(seccion.id, {
      onSuccess: () => {
        setOperandoIdSeccion(null)
      },
      onError: (e: unknown) => {
        setOperandoIdSeccion(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo eliminar la sección'
        setErrorGeneralSecciones(mensaje)
      },
    })
  }

  const errorMensajeSecciones = errorSeccionesListado instanceof Error ? errorSeccionesListado.message : errorGeneralSecciones

  return (
    <>
      <PageHeader
        titulo="Alumnos y secciones"
        subtitulo="Administra el padrón, las secciones y el acceso al detalle por alumno."
        acciones={
          <SegmentedControl
            etiquetaGrupo="modo-alumnos-secciones"
            opciones={OPCIONES_MODO}
            valor={modo}
            onCambiar={(v) => setModo(v as Modo)}
          />
        }
      />

      {modo === 'alumnos' ? (
        <div className={styles.pila}>
          <Card titulo="Lapso y sección">
            <SelectorLapso lapsos={lapsos} valor={lapsoSeleccionado} onCambiar={setLapsoId} />
            <SelectorSeccion secciones={secciones} valor={seccionId} onCambiar={setSeccionId} cargando={cargandoSecciones} />
          </Card>

          {seccionId !== null ? (
            <Card
              titulo={estudianteEditando === null ? 'Alta de alumno' : 'Editar alumno'}
              acciones={
                estudianteEditando !== null ? (
                  <Button variante="ghost" tamano="sm" onClick={cancelarEdicion}>
                    Cancelar edición
                  </Button>
                ) : undefined
              }
            >
              <FormularioEstudiante
                key={estudianteEditando?.id ?? `nuevo-${claveFormulario}`}
                secciones={secciones}
                valorInicial={valorInicial}
                enviando={crear.isPending || editar.isPending}
                error={errorMensaje}
                onSubmit={manejarSubmit}
              />
              <div className={styles.switchFila}>
                <Switch id="incluir-inactivos" checked={incluirInactivos} onChange={setIncluirInactivos}>
                  Mostrar inactivos
                </Switch>
              </div>
              {isLoading ? (
                <p className={styles.cargando}>
                  <Spinner /> Cargando…
                </p>
              ) : null}
              {error && !isLoading ? (
                <Alert
                  variante="error"
                  acciones={
                    <Button variante="secondary" tamano="sm" onClick={() => refetch()}>
                      Reintentar
                    </Button>
                  }
                >
                  {errorMensaje}
                </Alert>
              ) : null}
              {!isLoading && !error ? (
                <TablaEstudiantes
                  estudiantes={estudiantes}
                  incluirInactivos={incluirInactivos}
                  onDarDeBaja={manejarBaja}
                  onReactivar={manejarReactivar}
                  operandoId={operandoId}
                  expandidoId={filaExpandidaId}
                  onExpandir={alternarFila}
                  renderDetalle={renderDetalle}
                />
              ) : null}
            </Card>
          ) : null}

          <Card titulo="Todos los estudiantes">
            <div className={styles.busqueda}>
              <TextField
                id="buscar-estudiante"
                type="search"
                aria-label="buscar-estudiante"
                placeholder="Buscar por nombre o apellido"
                value={textoBusqueda}
                onChange={(evento) => setTextoBusqueda(evento.target.value)}
              />
            </div>
            <div className={styles.controles}>
              <Switch id="incluir-inactivos-global" checked={incluirInactivosGlobal} onChange={setIncluirInactivosGlobal}>
                Mostrar inactivos
              </Switch>
              <Switch id="mostrar-secciones-bajas" checked={mostrarSeccionesBajas} onChange={setMostrarSeccionesBajas}>
                Mostrar secciones dadas de baja
              </Switch>
            </div>
            {cargandoGlobal ? (
              <p className={styles.cargando}>
                <Spinner /> Cargando…
              </p>
            ) : null}
            {hayErrorPadron && !cargandoGlobal ? (
              <Alert
                variante="error"
                acciones={
                  <Button variante="secondary" tamano="sm" onClick={reintentarGlobal}>
                    Reintentar
                  </Button>
                }
              >
                Error: {errorGlobalMensaje}
              </Alert>
            ) : null}
            {errorGeneral !== null && !hayErrorPadron ? <Alert variante="error">{errorGeneral}</Alert> : null}
            {!cargandoGlobal && !hayErrorPadron ? (
              <TablaEstudiantesGlobal
                estudiantes={estudiantesFiltrados}
                etiquetaPorSeccion={etiquetaPorSeccion}
                incluirInactivos={incluirInactivosGlobal}
                onReactivar={manejarReactivar}
                mensajeVacio={mensajeVacio}
                operandoId={operandoId}
                expandidoId={filaExpandidaId}
                onExpandir={alternarFila}
                renderDetalle={renderDetalle}
              />
            ) : null}
            {mostrarSeccionesBajas && !hayErrorPadron ? (
              <div className={styles.bajas}>
                <h3 className={styles.bajasTitulo}>Secciones dadas de baja</h3>
                {seccionesInactivas.length === 0 ? (
                  <p>No hay secciones dadas de baja.</p>
                ) : (
                  <ListaSeccionesInactivas
                    secciones={seccionesInactivas}
                    onReactivar={manejarReactivarSeccion}
                    operandoId={operandoSeccionId}
                  />
                )}
              </div>
            ) : null}
          </Card>
        </div>
      ) : (
        <div className={estilosSecciones.pagina}>
          <section className={`${estilosSecciones.panelGlass} glass-panel`} aria-labelledby="titulo-formulario-seccion">
            <header className={estilosSecciones.cabeceraGlass}>
              <h2 className={estilosSecciones.panelTitulo} id="titulo-formulario-seccion">
                {seccionEditando === null ? 'Crear sección' : 'Editar sección'}
              </h2>
              {seccionEditando !== null ? (
                <Button variante="secondary" tamano="sm" onClick={cancelarEdicionSeccion}>
                  Cancelar edición
                </Button>
              ) : null}
            </header>
            <FormularioSeccion
              key={seccionEditando?.id ?? 'nueva'}
              valorInicial={valorInicialFormulario}
              enviando={crearSeccion.isPending || editarSeccion.isPending}
              error={errorMensajeSecciones}
              onSubmit={manejarSubmitSeccion}
            />
          </section>

          <section className={estilosSecciones.panel}>
            <header className={estilosSecciones.panelCabecera}>
              <h2 className={estilosSecciones.panelTitulo}>Listado</h2>
              <FiltroGrado grado={grado} onGradoChange={setGrado} />
            </header>
            <div className={estilosSecciones.panelCuerpo}>
              {isLoadingSecciones ? (
                <p className={estilosSecciones.listadoCargando} aria-live="polite">
                  Cargando secciones…
                </p>
              ) : null}
              {errorSeccionesListado && !isLoadingSecciones ? (
                <Alert
                  variante="error"
                  acciones={
                    <Button variante="secondary" tamano="sm" onClick={() => refetchSeccionesListado()}>
                      Reintentar
                    </Button>
                  }
                >
                  No se pudo cargar el listado. {errorMensajeSecciones}
                </Alert>
              ) : null}
              {!isLoadingSecciones && !errorSeccionesListado ? (
                <TablaSecciones
                  secciones={seccionesListado}
                  enBajaEnSesion={bajasEnSesion}
                  estaBajaEnSesion={estaBajaEnSesion}
                  onEditar={iniciarEdicionSeccion}
                  onDarDeBaja={manejarDarDeBajaSeccion}
                  onReactivar={manejarReactivarSeccionDirecto}
                  onEliminar={manejarEliminarSeccion}
                  operandoId={operandoIdSeccion}
                />
              ) : null}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default AlumnosYSeccionesPage
