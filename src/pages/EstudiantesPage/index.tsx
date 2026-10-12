import { useMemo, useState } from 'react'
import type { Estudiante } from '../../domain/estudiante'
import SelectorSeccion from '../../features/estudiantes/components/SelectorSeccion'
import FormularioEstudiante, { type ValoresEstudiante } from '../../features/estudiantes/components/FormularioEstudiante'
import TablaEstudiantes from '../../features/estudiantes/components/TablaEstudiantes'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useEstudiantes } from '../../features/estudiantes/hooks/useEstudiantes'
import { useEstudianteMutations } from '../../features/estudiantes/hooks/useEstudianteMutations'

const EstudiantesPage = () => {
  const [seccionId, setSeccionId] = useState<string | null>(null)
  const [incluirInactivos, setIncluirInactivos] = useState(false)
  const [estudianteEditando, setEstudianteEditando] = useState<Estudiante | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [operandoId, setOperandoId] = useState<string | null>(null)
  const [claveFormulario, setClaveFormulario] = useState(0)

  const { data: secciones = [], isLoading: cargandoSecciones } = useSecciones(undefined)
  const { data: estudiantes = [], isLoading, error, refetch } = useEstudiantes(seccionId, incluirInactivos)
  const { crear, editar, baja, reactivar } = useEstudianteMutations()

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

  const cancelarEdicion = () => setEstudianteEditando(null)
  const errorMensaje = error instanceof Error ? error.message : errorGeneral

  return (
    <main style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Estudiantes</h1>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
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
    </main>
  )
}

export default EstudiantesPage
