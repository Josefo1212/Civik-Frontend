import type { FilaNota } from '../../../domain/nota'
import { MARCA_OVERRIDE, SIN_NOTA } from '../constants'

export type PropsTablaNotas = {
  filas: FilaNota[]
}

const celda = { padding: '10px 8px', borderBottom: '1px solid var(--vidrio-borde)' } as const

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
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Estudiante</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Nota</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.id_student}>
              <td style={celda}>
                {fila.last_name}, {fila.first_name}
              </td>
              <td style={{ ...celda, color: fila.nota === null ? 'var(--color-texto-tenue)' : undefined }}>
                {fila.nota ?? SIN_NOTA}
                {fila.es_override ? (
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '0.75rem',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(168, 85, 247, 0.18)',
                      color: '#c4b5fd',
                    }}
                  >
                    {MARCA_OVERRIDE}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaNotas
