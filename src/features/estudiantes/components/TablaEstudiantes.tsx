import type { Estudiante } from '../../../domain/estudiante'

export type PropsTablaEst = {
  estudiantes: Estudiante[]
  incluirInactivos: boolean
  onDarDeBaja: (id: string) => void
  onReactivar: (id: string) => void
  operandoId?: string | null
}

const TablaEstudiantes = ({ estudiantes, incluirInactivos, onDarDeBaja, onReactivar, operandoId }: PropsTablaEst) => {
  const filas = incluirInactivos ? estudiantes : estudiantes.filter((e) => e.active)

  if (filas.length === 0) {
    return (
      <p style={{ padding: '12px' }} aria-live='polite'>
        No hay alumnos para mostrar.
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
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((e) => {
            const operando = operandoId === e.id
            return (
              <tr key={e.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>{e.last_name}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>{e.first_name}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>{e.phone ?? ''}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>{e.active ? 'Activo' : 'Dado de baja'}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                  {e.active ? (
                    <button type='button' onClick={() => onDarDeBaja(e.id)} disabled={operando}>
                      Dar de baja
                    </button>
                  ) : (
                    <button type='button' onClick={() => onReactivar(e.id)} disabled={operando}>
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

export default TablaEstudiantes
