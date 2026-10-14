import { useMemo, useState } from 'react'
import type { Estudiante } from '../../domain/estudiante'
import SelectorSeccion from '../../features/estudiantes/components/SelectorSeccion'
import FormularioEstudiante, { type ValoresEstudiante } from '../../features/estudiantes/components/FormularioEstudiante'
import TablaEstudiantes from '../../features/estudiantes/components/TablaEstudiantes'
import TablaEstudiantesGlobal from '../../features/estudiantes/components/TablaEstudiantesGlobal'
import ListaSeccionesInactivas from '../../features/secciones/components/ListaSeccionesInactivas'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useSeccionMutations } from '../../features/secciones/hooks/useSeccionMutations'
import { useEstudiantes, useEstudiantesGlobal } from '../../features/estudiantes/hooks/useEstudiantes'
import { useEstudianteMutations } from '../../features/estudiantes/hooks/useEstudianteMutations'
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
import styles from './EstudiantesPage.module.css'

type Modo = 'por-seccion' | 'todos'

const OPCIONES_MODO = [
  { valor: 'por-seccion', etiqueta: 'Por sección' },
  { valor: 'todos', etiqueta: 'Todos' },
] as const

const EstudiantesPage = () => {
  const [modo, setModo] = useState<Modo>('por-seccion')
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

  return (
    <>
      <PageHeader
        titulo="Estudiantes"
        subtitulo="Alta, edición, baja y reactivación del padrón."
        acciones={
          <SegmentedControl
            etiquetaGrupo="modo-listado"
            opciones={OPCIONES_MODO}
            valor={modo}
            onCambiar={setModo}
          />
        }
      />

      {modo === 'por-seccion' ? (
        <div className={styles.pila}>
          <Card titulo="Seleccionar sección">
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
                />
              ) : null}
            </Card>
          ) : null}
        </div>
      ) : (
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
      )}
    </>
  )
}

export default EstudiantesPage
