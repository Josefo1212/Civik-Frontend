export type EstadoLapso = 'PLANNED' | 'ACTIVE' | 'CLOSED'

export type DiaSemana =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export type Lapso = {
  id: string
  school_year: number
  lapse_number: number
  start_date: string
  end_date: string
  practice_day: DiaSemana
  status: EstadoLapso
  created_at: string
  updated_at: string
}
