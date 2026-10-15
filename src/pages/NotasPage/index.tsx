import { useState } from 'react'
import SelectorLapso from '../../features/lapsos/components/SelectorLapso'
import { useLapsos } from '../../features/lapsos/hooks/useLapsos'
import SelectorSeccion from '../../features/estudiantes/components/SelectorSeccion'
import { useSecciones } from '../../features/secciones/hooks/useSecciones'
import { useNotas } from '../../features/notas/hooks/useNotas'
import AvisoNota from '../../features/notas/components/AvisoNota'
import TablaNotas from '../../features/notas/components/TablaNotas'
import Alert from '../../components/ui/Alert/Alert'
import Button from '../../components/ui/Button/Button'

const NotasPage = () => {
  const [lapsoId, setLapsoId] = useState<string | null>(null)
  const [seccionId, setSeccionId] = useState<string | null>(null)

  const { data: lapsos = [], isLoading: cargandoLapsos } = useLapsos()
  const { data: secciones = [], isLoading: cargandoSecciones } = useSecciones(undefined)
  const { data: filas = [], isLoading: cargandoNotas, error: errorNotas, refetch } =
    useNotas(lapsoId, seccionId)

  const lapso = lapsos.find((l) => l.id === lapsoId)
  const errorMensaje = errorNotas instanceof Error ? errorNotas.message : null

  return (
    <main style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Notas</h1>

      {cargandoLapsos ? <p>Cargando lapsos...</p> : null}
      {!cargandoLapsos && lapsos.length === 0 ? (
        <p aria-live='polite'>Todavía no hay lapsos.</p>
      ) : null}
      {lapsos.length > 0 ? (
        <SelectorLapso lapsos={lapsos} valor={lapsoId} onCambiar={setLapsoId} cargando={cargandoLapsos} />
      ) : null}

      {cargandoSecciones ? <p>Cargando secciones...</p> : null}
      {!cargandoSecciones && secciones.filter((s) => s.active).length === 0 ? (
        <p aria-live='polite'>No hay secciones activas. Creá una en la pantalla de Secciones.</p>
      ) : null}
      {secciones.filter((s) => s.active).length > 0 ? (
        <SelectorSeccion
          secciones={secciones}
          valor={seccionId}
          onCambiar={setSeccionId}
          cargando={cargandoSecciones}
        />
      ) : null}

      {lapsoId === null || seccionId === null ? (
        <p aria-live='polite'>Elegí un lapso y una sección para ver las notas.</p>
      ) : null}

      {lapsoId !== null && seccionId !== null && lapso ? (
        <section>
          <AvisoNota estado={lapso.status} />
          {cargandoNotas ? <p>Cargando notas...</p> : null}
          {errorMensaje && !cargandoNotas ? (
            <Alert
              variante="error"
              acciones={
                <Button variante="secondary" tamano="sm" onClick={() => refetch()}>
                  Reintentar
                </Button>
              }
            >
              Error: {errorMensaje}
            </Alert>
          ) : null}
          {!cargandoNotas && !errorMensaje ? <TablaNotas filas={filas} /> : null}
        </section>
      ) : null}
    </main>
  )
}

export default NotasPage
