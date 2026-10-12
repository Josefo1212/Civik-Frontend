export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'

export type FilaPadron = {
  id_student: string
  first_name: string
  last_name: string
  state: EstadoAsistencia | null
}

export type ResultadoSync = 'creado' | 'aplicado' | 'sin_cambio' | 'conflicto'

export type ItemSync = {
  id_student: string
  state: EstadoAsistencia
  cambio_en: string
}

export type ItemResultadoSync = {
  id_student: string
  resultado: ResultadoSync
  state: EstadoAsistencia | null
  updated_at: string
}
