import type { Evento } from '../../../domain/evento'
import { ETIQUETAS_ESTADO_EVENTO, ETIQUETAS_TIPO } from '../../eventos/constants'

export type PropsSelectorEvento = {
  eventos: Evento[]
  valor: string | null
  onCambiar: (id: string | null) => void
  cargando?: boolean
}

const etiquetaEvento = (evento: Evento): string => {
  const tipo = evento.type_event ? ` (${ETIQUETAS_TIPO[evento.type_event]})` : ''
  const cancelado = evento.status === 'CANCELLED'
  const marca = cancelado ? ` — ${ETIQUETAS_ESTADO_EVENTO.CANCELLED}` : ''
  return `${evento.event_date} · ${evento.event_name}${tipo}${marca}`
}

const SelectorEvento = ({ eventos, valor, onCambiar, cargando = false }: PropsSelectorEvento) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', maxWidth: '420px' }}>
    <label htmlFor='selector-evento'>Evento</label>
    <select
      id='selector-evento'
      aria-label='selector-evento'
      value={valor ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onCambiar(v === '' ? null : v)
      }}
      disabled={cargando}
    >
      <option value=''>Selecciona un evento</option>
      {eventos.map((evento) => (
        <option key={evento.id} value={evento.id} disabled={evento.status === 'CANCELLED'}>
          {etiquetaEvento(evento)}
        </option>
      ))}
    </select>
  </div>
)

export default SelectorEvento
