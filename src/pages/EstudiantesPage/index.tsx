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

type Modo = 'por-seccion' | 'todos'

const celdaCheckbox = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } as const

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
    <main style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Estudiantes</h1>
      <div role='group' aria-label='modo-listado' style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button type='button' aria-pressed={modo === 'por-seccion'} onClick={() => setModo('por-seccion')}>
          Por sección
        </button>
        <button type='button' aria-pressed={modo === 'todos'} onClick={() => setModo('todos')}>
          Todos
        </button>
      </div>

      {modo === 'por-seccion' ? (
        <>
          <section>
            <h2>Seleccionar sección</h2>
            <SelectorSeccion secciones={secciones} valor={seccionId} onCambiar={setSeccionId} cargando={cargandoSecciones} />
          </section>
          {seccionId !== null ? (
            <section>
              <h2>{estudianteEditando === null ? 'Alta de alumno' : 'Editar alumno'}</h2>
              <FormularioEstudiante
                key={estudianteEditando?.id ?? `nuevo-${claveFormulario}`}
                secciones={secciones}
                valorInicial={valorInicial}
                enviando={crear.isPending || editar.isPending}
                error={errorMensaje}
                onSubmit={manejarSubmit}
              />
              {estudianteEditando !== null ? (
                <button type='button' onClick={cancelarEdicion} style={{ marginBottom: '12px' }}>
                  Cancelar edición
                </button>
              ) : null}
              <div style={celdaCheckbox}>
                <input
                  type='checkbox'
                  id='incluir-inactivos'
                  checked={incluirInactivos}
                  onChange={(e) => setIncluirInactivos(e.target.checked)}
                />
                <label htmlFor='incluir-inactivos'>Mostrar inactivos</label>
              </div>
              {isLoading ? <p>Cargando...</p> : null}
              {error && !isLoading ? (
                <div>
                  <p style={{ color: '#dc2626' }}>{errorMensaje}</p>
                  <button type='button' onClick={() => refetch()}>
                    Reintentar
                  </button>
                </div>
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
            </section>
          ) : null}
        </>
      ) : (
        <section>
          <h2>Todos los estudiantes</h2>
          <div style={{ marginBottom: '12px', maxWidth: '320px' }}>
            <input
              type='search'
              aria-label='buscar-estudiante'
              placeholder='Buscar por nombre o apellido'
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              style={{ width: '100%', padding: '6px' }}
            />
          </div>
          <div style={celdaCheckbox}>
            <input
              type='checkbox'
              id='incluir-inactivos-global'
              checked={incluirInactivosGlobal}
              onChange={(e) => setIncluirInactivosGlobal(e.target.checked)}
            />
            <label htmlFor='incluir-inactivos-global'>Mostrar inactivos</label>
          </div>
          <div style={celdaCheckbox}>
            <input
              type='checkbox'
              id='mostrar-secciones-bajas'
              checked={mostrarSeccionesBajas}
              onChange={(e) => setMostrarSeccionesBajas(e.target.checked)}
            />
            <label htmlFor='mostrar-secciones-bajas'>Mostrar secciones dadas de baja</label>
          </div>
          {cargandoGlobal ? <p>Cargando...</p> : null}
          {hayErrorPadron && !cargandoGlobal ? (
            <div>
              <p style={{ color: '#dc2626' }}>Error: {errorGlobalMensaje}</p>
              <button type='button' onClick={reintentarGlobal}>
                Reintentar
              </button>
            </div>
          ) : null}
          {errorGeneral !== null && !hayErrorPadron ? (
            <p style={{ color: '#dc2626' }}>{errorGeneral}</p>
          ) : null}
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
            <div style={{ marginTop: '24px' }}>
              <h3>Secciones dadas de baja</h3>
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
        </section>
      )}
    </main>
  )
}

export default EstudiantesPage
