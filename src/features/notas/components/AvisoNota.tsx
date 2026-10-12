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
        backgroundColor: provisional ? '#fffbeb' : '#f0fdf4',
        color: provisional ? '#b45309' : '#15803d',
        border: `1px solid ${provisional ? '#fde68a' : '#bbf7d0'}`,
      }}
    >
      {textoEstadoNota(estado)}
    </p>
  )
}

export default AvisoNota
