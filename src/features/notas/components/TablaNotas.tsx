import type { FilaNota } from '../../../domain/nota'
import { SIN_NOTA } from '../constants'

export type PropsTablaNotas = {
  filas: FilaNota[]
}

const celda = { padding: '10px 8px', borderBottom: '1px solid #f1f5f9' } as const

const TablaNotas = ({ filas }: PropsTablaNotas) => {
  if (filas.length === 0) {
    return (
      <p style={{ padding: '12px' }} aria-live='polite'>
        Esta sección no tiene estudiantes.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estudiante</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Nota</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.id_student}>
              <td style={celda}>
                {fila.last_name}, {fila.first_name}
              </td>
              <td style={{ ...celda, color: fila.nota === null ? '#94a3b8' : undefined }}>
                {fila.nota ?? SIN_NOTA}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaNotas
