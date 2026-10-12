export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'

export type FilaPadron = {
  id_student: string
  first_name: string
  last_name: string
  state: EstadoAsistencia | null
}
