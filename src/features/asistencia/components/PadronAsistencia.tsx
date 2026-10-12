import { useState } from 'react'
import type { EstadoAsistencia, FilaPadron } from '../../../domain/asistencia'
import ListaAsistencia from './ListaAsistencia'

export type ItemNuevo = {
  id_student: string
  state: string
}

export type PropsPadronAsistencia = {
  filas: FilaPadron[]
  enviando: boolean
  error?: string | null
  onGuardar: (items: ItemNuevo[]) => void
}

const construirIniciales = (filas: FilaPadron[]): Record<string, EstadoAsistencia | null> => {
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

  const cambios: ItemNuevo[] = Object.entries(estados)
    .filter(([id, estado]) => estado !== null && estado !== originalDe(id))
    .map(([id, estado]) => ({ id_student: id, state: estado as string }))

  const hayCambios = cambios.length > 0

  return (
    <div>
      <ListaAsistencia filas={filas} estados={estados} onCambiar={cambiar} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <button
          type='button'
          aria-label='guardar-asistencia'
          onClick={() => onGuardar(cambios)}
          disabled={enviando || !hayCambios}
        >
          {enviando ? 'Guardando...' : 'Guardar asistencia'}
        </button>
        {error ? (
          <p style={{ color: '#dc2626', fontSize: '0.9rem' }} role='alert'>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default PadronAsistencia
