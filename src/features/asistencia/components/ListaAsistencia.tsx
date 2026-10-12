import type { EstadoAsistencia } from '../../../domain/asistencia'
import type { FilaConSync } from '../../../sync/fusionar'
import { SIN_MARCAR, ESTADOS_ASISTENCIA, ETIQUETAS_ESTADO_ASISTENCIA } from '../constants'

export type PropsListaAsistencia = {
  filas: FilaConSync[]
  estados: Record<string, EstadoAsistencia | null>
  onCambiar: (idStudent: string, estado: EstadoAsistencia) => void
}

const celda = { padding: '10px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' } as const

const ListaAsistencia = ({ filas, estados, onCambiar }: PropsListaAsistencia) => {
  if (filas.length === 0) {
    return (
      <p style={{ padding: '12px' }} aria-live='polite'>
        Este evento no tiene estudiantes en el padrón.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estudiante</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Marcar</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const actual = estados[fila.id_student] ?? null
            const grupo = `asistencia-${fila.id_student}`
            return (
              <tr key={fila.id_student}>
                <td style={celda}>
                  {fila.last_name}, {fila.first_name}
                </td>
                <td style={celda}>
                  {actual ? ETIQUETAS_ESTADO_ASISTENCIA[actual] : SIN_MARCAR}
                  {fila.estadoSync ? (
                    <span
                      role='status'
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.75rem',
                        color: fila.estadoSync === 'error' ? '#dc2626' : '#b45309',
                      }}
                    >
                      {fila.estadoSync === 'error' ? 'error' : 'pendiente'}
                    </span>
                  ) : null}
                </td>
                <td style={celda}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {ESTADOS_ASISTENCIA.map((estado) => (
                      <label key={estado} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type='radio'
                          name={grupo}
                          aria-label={`${estado}-${fila.id_student}`}
                          checked={actual === estado}
                          onChange={() => onCambiar(fila.id_student, estado)}
                        />
                        {ETIQUETAS_ESTADO_ASISTENCIA[estado]}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ListaAsistencia
