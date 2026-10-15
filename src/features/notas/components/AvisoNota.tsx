import type { EstadoLapso } from '../../../domain/lapso'
import { esNotaProvisional, textoEstadoNota } from '../utils'

export type PropsAvisoNota = {
  estado: EstadoLapso
}

const AvisoNota = ({ estado }: PropsAvisoNota) => {
  const provisional = esNotaProvisional(estado)

  return (
    <p
      role='status'
      style={{
        padding: '8px 12px',
        margin: '0 0 12px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        backgroundColor: provisional ? 'rgba(251, 191, 36, 0.14)' : 'rgba(74, 222, 128, 0.14)',
        color: provisional ? 'var(--color-aviso)' : 'var(--color-ok)',
        border: `1px solid ${provisional ? 'rgba(251, 191, 36, 0.4)' : 'rgba(74, 222, 128, 0.4)'}`,
      }}
    >
      {textoEstadoNota(estado)}
    </p>
  )
}

export default AvisoNota
