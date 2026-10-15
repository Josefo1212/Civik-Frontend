import type { Evento } from '../../../domain/evento'
import Button from '../../../components/ui/Button/Button'
import { ETIQUETAS_ESTADO_EVENTO, ETIQUETAS_ORIGEN, ETIQUETAS_TIPO } from '../constants'
import AccionCancelarEvento from './AccionCancelarEvento'

export type PropsListaEventos = {
  eventos: Evento[]
  eventoCancelandoId: string | null
  operandoId?: string | null
  onIniciarCancelar: (id: string) => void
  onCancelarCancelar: () => void
  onConfirmarCancelar: (id: string, motivo: string) => void
}

const celda = { padding: '8px', borderBottom: '1px solid var(--vidrio-borde)', verticalAlign: 'top' } as const

const etiquetaTipo = (evento: Evento): string =>
  evento.type_event ? ETIQUETAS_TIPO[evento.type_event] : '—'

const etiquetaOrigen = (evento: Evento): string =>
  evento.source ? ETIQUETAS_ORIGEN[evento.source] : '—'

const ListaEventos = ({
  eventos,
  eventoCancelandoId,
  operandoId,
  onIniciarCancelar,
  onCancelarCancelar,
  onConfirmarCancelar,
}: PropsListaEventos) => {
  if (eventos.length === 0) {
    return (
      <p style={{ padding: '12px' }} aria-live='polite'>
        Este lapso todavía no tiene eventos.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Fecha</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Tipo</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Origen</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) => {
            const cancelado = evento.status === 'CANCELLED'
            const operando = operandoId === evento.id
            return (
              <tr key={evento.id}>
                <td style={celda}>{evento.event_date}</td>
                <td style={celda}>{evento.event_name}</td>
                <td style={celda}>{etiquetaTipo(evento)}</td>
                <td style={celda}>{etiquetaOrigen(evento)}</td>
                <td style={celda}>
                  {evento.status ? ETIQUETAS_ESTADO_EVENTO[evento.status] : '—'}
                  {evento.cancelled_reason ? (
                    <div style={{ color: 'var(--color-texto-suave)', fontSize: '0.85rem' }}>
                      Motivo: {evento.cancelled_reason}
                    </div>
                  ) : null}
                </td>
                <td style={{ ...celda, textAlign: 'right' }}>
                  {cancelado ? null : eventoCancelandoId === evento.id ? (
                    <AccionCancelarEvento
                      enviando={operando}
                      onConfirmar={(motivo) => onConfirmarCancelar(evento.id, motivo)}
                      onCancelar={onCancelarCancelar}
                    />
                  ) : (
                    <Button
                      variante='danger'
                      tamano='sm'
                      aria-label={`cancelar-evento-${evento.id}`}
                      onClick={() => onIniciarCancelar(evento.id)}
                      disabled={operando}
                    >
                      Cancelar
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ListaEventos
