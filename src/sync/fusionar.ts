import type { EstadoAsistencia, FilaPadron } from '../domain/asistencia'
import type { ItemOutbox } from './db'

export type EstadoSyncFila = 'pendiente' | 'error' | null

export type FilaConSync = FilaPadron & { estadoSync?: EstadoSyncFila }

export type FilaFusionada = FilaPadron & { estadoSync: EstadoSyncFila }

export const fusionarPadron = (
  filas: FilaPadron[],
  pendientes: ItemOutbox[],
): FilaFusionada[] => {
  const porEstudiante = new Map(pendientes.map((item) => [item.id_student, item]))

  return filas.map((fila) => {
    const pendiente = porEstudiante.get(fila.id_student)
    if (!pendiente) {
      return { ...fila, estadoSync: null }
    }
    return {
      ...fila,
      state: pendiente.state as EstadoAsistencia,
      estadoSync: pendiente.error ? 'error' : 'pendiente',
    }
  })
}
