import type { Lapso } from '../../../domain/lapso'
import { ETIQUETAS_DIA, ETIQUETAS_ESTADO } from '../constants'

export type PropsTablaLapsos = {
  lapsos: Lapso[]
  onActivar: (id: string) => void
  onCerrar: (id: string) => void
  operandoId?: string | null
}

const celda = { padding: '8px', borderBottom: '1px solid var(--vidrio-borde)' } as const

const TablaLapsos = ({ lapsos, onActivar, onCerrar, operandoId }: PropsTablaLapsos) => {
  if (lapsos.length === 0) {
    return (
      <p style={{ padding: '12px' }} aria-live='polite'>
        Todavía no hay lapsos.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Año</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Número</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Fechas</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Día de práctica</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lapsos.map((lapso) => {
            const operando = operandoId === lapso.id
            return (
              <tr key={lapso.id}>
                <td style={celda}>{lapso.school_year}</td>
                <td style={celda}>{lapso.lapse_number}</td>
                <td style={celda}>
                  {lapso.start_date} — {lapso.end_date}
                </td>
                <td style={celda}>{ETIQUETAS_DIA[lapso.practice_day]}</td>
                <td style={celda}>{ETIQUETAS_ESTADO[lapso.status]}</td>
                <td style={{ ...celda, textAlign: 'right' }}>
                  {lapso.status === 'PLANNED' ? (
                    <button type='button' onClick={() => onActivar(lapso.id)} disabled={operando}>
                      Activar
                    </button>
                  ) : null}
                  {lapso.status === 'ACTIVE' ? (
                    <button type='button' onClick={() => onCerrar(lapso.id)} disabled={operando}>
                      Cerrar
                    </button>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TablaLapsos
