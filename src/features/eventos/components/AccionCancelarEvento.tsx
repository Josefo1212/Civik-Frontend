import { useState } from 'react'

export type PropsAccionCancelarEvento = {
  enviando: boolean
  onConfirmar: (motivo: string) => void
  onCancelar: () => void
}

const AccionCancelarEvento = ({ enviando, onConfirmar, onCancelar }: PropsAccionCancelarEvento) => {
  const [motivo, setMotivo] = useState('')

  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      <input
        aria-label='motivo-cancelacion'
        placeholder='Motivo de cancelación'
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        disabled={enviando}
      />
      <button
        type='button'
        aria-label='confirmar-cancelacion'
        onClick={() => onConfirmar(motivo.trim())}
        disabled={enviando || motivo.trim() === ''}
      >
        Confirmar
      </button>
      <button type='button' aria-label='deshacer-cancelacion' onClick={onCancelar} disabled={enviando}>
        Deshacer
      </button>
    </div>
  )
}

export default AccionCancelarEvento
