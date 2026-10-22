import { useMemo, useState } from 'react'
import type { Seccion } from '../../domain/seccion' // usado en tipado
import FormularioSeccion, { type ValoresFormulario } from '../../features/secciones/components/FormularioSeccion'
import FiltroGrado from '../../features/secciones/components/FiltroGrado'
import TablaSecciones from '../../features/secciones/components/TablaSecciones'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useSeccionMutations } from '../../features/secciones/hooks/useSeccionMutations'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import styles from './SeccionesPage.module.css'

const SeccionesPage = () => {
  const [grado, setGrado] = useState<string>('todos')
  const [seccionEditando, setSeccionEditando] = useState<Seccion | null>(null)
  const [bajasEnSesion, setBajasEnSesion] = useState<Seccion[]>([])
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [operandoId, setOperandoId] = useState<string | null>(null)

  const { data: secciones = [], isLoading, error, refetch } = useSecciones(grado === 'todos' ? undefined : grado)
  const { crear, editar, darDeBaja, reactivar, eliminar } = useSeccionMutations()

  const valorInicialFormulario = useMemo<ValoresFormulario | undefined>(() => {
    if (seccionEditando === null) return undefined
    return {
      grade_level: seccionEditando.grade_level,
      section: seccionEditando.section,
      shift: seccionEditando.shift,
    }
  }, [seccionEditando])

  const estaBajaEnSesion = (id: string) => {
    return bajasEnSesion.some((s) => s.id === id)
  }

  const manejarSubmit = (valores: ValoresFormulario) => {
    setErrorGeneral(null)
    if (seccionEditando !== null) {
      setOperandoId(seccionEditando.id)
      editar.mutate(
        { id: seccionEditando.id, payload: valores },
        {
          onSuccess: () => {
            setSeccionEditando(null)
            setOperandoId(null)
          },
          onError: (e: unknown) => {
            setOperandoId(null)
            const mensaje = e instanceof Error ? e.message : 'No se pudo editar la sección'
            setErrorGeneral(mensaje)
          },
        },
      )
      return
    }

    setOperandoId(null)
    crear.mutate(valores, {
      onSuccess: () => {
        setSeccionEditando(null)
        setOperandoId(null)
      },
      onError: (e: unknown) => {
        setOperandoId(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo crear la sección'
        setErrorGeneral(mensaje)
      },
    })
  }

  const iniciarEdicion = (seccion: Seccion) => {
    setSeccionEditando(seccion)
    setErrorGeneral(null)
  }

  const cancelarEdicion = () => {
    setSeccionEditando(null)
  }

  const manejarDarDeBaja = (seccion: Seccion) => {
    setErrorGeneral(null)
    setOperandoId(seccion.id)
    darDeBaja.mutate(seccion.id, {
      onSuccess: () => {
        setBajasEnSesion((prev) => {
          if (prev.some((s) => s.id === seccion.id)) return prev
          return [...prev, { ...seccion, active: false }]
        })
        setOperandoId(null)
      },
      onError: (e: unknown) => {
        setOperandoId(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo dar de baja la sección'
        setErrorGeneral(mensaje)
      },
    })
  }

  const manejarReactivar = (seccion: Seccion) => {
    setErrorGeneral(null)
    setOperandoId(seccion.id)
    reactivar.mutate(seccion.id, {
      onSuccess: () => {
        setBajasEnSesion((prev) => prev.filter((s) => s.id !== seccion.id))
        setOperandoId(null)
      },
      onError: (e: unknown) => {
        setOperandoId(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo reactivar la sección'
        setErrorGeneral(mensaje)
      },
    })
  }

  const manejarEliminar = (seccion: Seccion) => {
    setErrorGeneral(null)
    setOperandoId(seccion.id)
    eliminar.mutate(seccion.id, {
      onSuccess: () => {
        setOperandoId(null)
      },
      onError: (e: unknown) => {
        setOperandoId(null)
        const mensaje = e instanceof Error ? e.message : 'No se pudo eliminar la sección'
        setErrorGeneral(mensaje)
      },
    })
  }

  const errorMensaje = error instanceof Error ? error.message : errorGeneral

  return (
    <div className={styles.pagina}>
      <PageHeader
        titulo='Secciones'
        subtitulo='Grados, subdivisiones y turnos del grupo. El listado refleja lo que responde el servidor.'
      />

      <section className={`${styles.panelGlass} glass-panel`} aria-labelledby='titulo-formulario'>
        <header className={styles.cabeceraGlass}>
          <h2 className={styles.panelTitulo} id='titulo-formulario'>
            {seccionEditando === null ? 'Crear sección' : 'Editar sección'}
          </h2>
          {seccionEditando !== null ? (
            <Button variante='secondary' tamano='sm' onClick={cancelarEdicion}>
              Cancelar edición
            </Button>
          ) : null}
        </header>
        <FormularioSeccion
          key={seccionEditando?.id ?? 'nueva'}
          valorInicial={valorInicialFormulario}
          enviando={crear.isPending || editar.isPending}
          error={errorMensaje}
          onSubmit={manejarSubmit}
        />
      </section>

      <section className={styles.panel}>
        <header className={styles.panelCabecera}>
          <h2 className={styles.panelTitulo}>Listado</h2>
          <FiltroGrado grado={grado} onGradoChange={setGrado} />
        </header>
        <div className={styles.panelCuerpo}>
          {isLoading ? (
            <p className={styles.listadoCargando} aria-live='polite'>
              Cargando secciones…
            </p>
          ) : null}
          {error && !isLoading ? (
            <Alert
              variante='error'
              acciones={
                <Button variante='secondary' tamano='sm' onClick={() => refetch()}>
                  Reintentar
                </Button>
              }
            >
              No se pudo cargar el listado. {errorMensaje}
            </Alert>
          ) : null}
          {!isLoading && !error ? (
            <TablaSecciones
              secciones={secciones}
              enBajaEnSesion={bajasEnSesion}
              estaBajaEnSesion={estaBajaEnSesion}
              onEditar={iniciarEdicion}
              onDarDeBaja={manejarDarDeBaja}
              onReactivar={manejarReactivar}
              onEliminar={manejarEliminar}
              operandoId={operandoId}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default SeccionesPage
