import { useState } from 'react'
import type { EstadoAsistencia } from '../../../domain/asistencia'
import type { FilaConSync } from '../../../sync/fusionar'
import Alert from '../../../components/ui/Alert/Alert'
import Button from '../../../components/ui/Button/Button'
import ListaAsistencia from './ListaAsistencia'

export type CambioPadron = {
  id_student: string
  state: EstadoAsistencia
}

export type PropsPadronAsistencia = {
  filas: FilaConSync[]
  enviando: boolean
  error?: string | null
  onGuardar: (cambios: CambioPadron[]) => void
}

const construirIniciales = (filas: FilaConSync[]): Record<string, EstadoAsistencia | null> => {
  return Object.fromEntries(filas.map((fila) => [fila.id_student, fila.state]))
}

const PadronAsistencia = ({ filas, enviando, error, onGuardar }: PropsPadronAsistencia) => {
  const [estados, setEstados] = useState<Record<string, EstadoAsistencia | null>>(() =>
    construirIniciales(filas),
  )

  const cambiar = (idStudent: string, estado: EstadoAsistencia) => {
    setEstados((previos) => ({ ...previos, [idStudent]: estado }))
  }

  const originalDe = (idStudent: string): EstadoAsistencia | null =>
    filas.find((fila) => fila.id_student === idStudent)?.state ?? null

  const cambios: CambioPadron[] = Object.entries(estados)
    .filter(([id, estado]) => estado !== null && estado !== originalDe(id))
    .map(([id, estado]) => ({ id_student: id, state: estado as EstadoAsistencia }))

  const hayCambios = cambios.length > 0

  return (
    <div>
      <ListaAsistencia filas={filas} estados={estados} onCambiar={cambiar} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <Button
          style={{ alignSelf: 'flex-start' }}
          aria-label='guardar-asistencia'
          onClick={() => onGuardar(cambios)}
          disabled={enviando || !hayCambios}
        >
          {enviando ? 'Guardando...' : 'Guardar asistencia'}
        </Button>
        {error ? (
          <Alert variante="error">{error}</Alert>
        ) : null}
      </div>
    </div>
  )
}

export default PadronAsistencia
