export type EstadoEvento = 'SCHEDULED' | 'CANCELLED'

export type TipoEvento = 'PRACTICA_REGULAR' | 'PRACTICA_EXTRA' | 'PRESENTACION'

export type OrigenEvento = 'AUTO' | 'MANUAL'

export type Evento = {
  id: string
  id_lapse: string
  event_date: string
  type_event: TipoEvento | null
  source: OrigenEvento | null
  event_name: string
  status: EstadoEvento | null
  cancelled_reason: string | null
  created_at: string | null
  updated_at: string | null
}
