import type { Seccion } from '../../../domain/seccion'
import { etiquetaSeccion } from '../utils'

export type PropsListaSeccionesInactivas = {
  secciones: Seccion[]
  onReactivar: (id: string) => void
  operandoId?: string | null
}

const celda = { padding: '8px', borderBottom: '1px solid #f1f5f9' } as const

const ListaSeccionesInactivas = ({
  secciones,
  onReactivar,
  operandoId,
}: PropsListaSeccionesInactivas) => {
  if (secciones.length === 0) return null

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Sección</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {secciones.map((seccion) => {
            const operando = operandoId === seccion.id
            return (
              <tr key={seccion.id}>
                <td style={celda}>{etiquetaSeccion(seccion)}</td>
                <td style={celda}>Dada de baja</td>
                <td style={{ ...celda, textAlign: 'right' }}>
                  <button
                    type='button'
                    aria-label={`reactivar-seccion-${seccion.id}`}
                    onClick={() => onReactivar(seccion.id)}
                    disabled={operando}
                  >
                    Reactivar
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ListaSeccionesInactivas
