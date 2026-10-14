import type { Estudiante } from '../../../domain/estudiante'

export type PropsTablaEstudiantesGlobal = {
  estudiantes: Estudiante[]
  etiquetaPorSeccion: (idSeccion: string) => string
  incluirInactivos: boolean
  onReactivar: (id: string) => void
  mensajeVacio: string
  operandoId?: string | null
}

const celda = { padding: '8px', borderBottom: '1px solid #f1f5f9' } as const

const TablaEstudiantesGlobal = ({
  estudiantes,
  etiquetaPorSeccion,
  incluirInactivos,
  onReactivar,
  mensajeVacio,
  operandoId,
}: PropsTablaEstudiantesGlobal) => {
  const filas = incluirInactivos ? estudiantes : estudiantes.filter((e) => e.active)

  if (filas.length === 0) {
    return (
      <p style={{ padding: '12px' }} aria-live='polite'>
        {mensajeVacio}
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Apellido</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Teléfono</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Sección</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((estudiante) => {
            const operando = operandoId === estudiante.id
            return (
              <tr key={estudiante.id}>
                <td style={celda}>{estudiante.last_name}</td>
                <td style={celda}>{estudiante.first_name}</td>
                <td style={celda}>{estudiante.phone ?? ''}</td>
                <td style={celda}>{etiquetaPorSeccion(estudiante.id_section)}</td>
                <td style={celda}>{estudiante.active ? 'Activo' : 'Dado de baja'}</td>
                <td style={{ ...celda, textAlign: 'right' }}>
                  {estudiante.active ? null : (
                    <button
                      type='button'
                      aria-label={`reactivar-estudiante-${estudiante.id}`}
                      onClick={() => onReactivar(estudiante.id)}
                      disabled={operando}
                    >
                      Reactivar
                    </button>
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

export default TablaEstudiantesGlobal
