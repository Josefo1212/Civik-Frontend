import type { EstadoAsistencia } from '../../../domain/asistencia'
import type { Estudiante } from '../../../domain/estudiante'
import type { Evento } from '../../../domain/evento'
import type { EstadoLapso } from '../../../domain/lapso'
import type { FilaFusionada } from '../../../sync/fusionar'
import { useNotas } from '../../notas/hooks/useNotas'
import Spinner from '../../../components/ui/Spinner/Spinner'
import FilaExpandible from './FilaExpandible'
import styles from './DetalleEstudiante.module.css'

export type PropsDetalleEstudiante = {
  estudiante: Estudiante
  lapsoId: string | null
  estadoLapso: EstadoLapso
  eventos: Evento[]
  asistencia: Map<string, FilaFusionada> | undefined
  onCorregir: (idEvent: string, state: EstadoAsistencia) => void
  enviando?: boolean
}

const DetalleEstudiante = ({
  estudiante,
  lapsoId,
  estadoLapso,
  eventos,
  asistencia,
  onCorregir,
  enviando = false,
}: PropsDetalleEstudiante) => {
  const { data: filas = [], isLoading } = useNotas(lapsoId, estudiante.id_section)
  const nota = filas.find((fila) => fila.id_student === estudiante.id) ?? null

  if (lapsoId === null) {
    return (
      <p className={styles.aviso} aria-live="polite">
        Elegí un lapso para ver la asistencia y la nota.
      </p>
    )
  }

  if (isLoading) {
    return (
      <p className={styles.aviso} aria-live="polite">
        <Spinner /> Cargando…
      </p>
    )
  }

  return (
    <FilaExpandible
      eventos={eventos}
      porEvento={asistencia ?? new Map<string, FilaFusionada>()}
      nota={nota}
      estadoLapso={estadoLapso}
      onCorregir={onCorregir}
      enviando={enviando}
    />
  )
}

export default DetalleEstudiante
