import type { Lapso } from '../../../domain/lapso'
import Button from '../../../components/ui/Button/Button'
import { ETIQUETAS_DIA, ETIQUETAS_ESTADO } from '../constants'

export type PropsTablaLapsos = {
  lapsos: Lapso[]
  onActivar: (id: string) => void
  onCerrar: (id: string) => void
  onEditar?: (lapso: Lapso) => void
  onReprogramar?: (lapso: Lapso) => void
  onGenerarPracticas?: (id: string) => void
  operandoId?: string | null
}

const celda = { padding: '8px', borderBottom: '1px solid var(--vidrio-borde)' } as const

const TablaLapsos = ({ lapsos, onActivar, onCerrar, onEditar, onReprogramar, onGenerarPracticas, operandoId }: PropsTablaLapsos) => {
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
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Nro. de lapso</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Fechas</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Día de práctica regular</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lapsos.map((lapso) => {
            const operando = operandoId === lapso.id
            const puedeEditar = lapso.status === 'PLANNED' && onEditar
            const puedeReprogramar = lapso.status === 'ACTIVE' && onReprogramar
            const puedeGenerar = lapso.status === 'ACTIVE' && onGenerarPracticas
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
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {puedeEditar ? (
                      <Button variante='secondary' tamano='sm' onClick={() => onEditar!(lapso)} disabled={operando}>
                        Editar
                      </Button>
                    ) : null}
                    {puedeReprogramar ? (
                      <Button variante='secondary' tamano='sm' onClick={() => onReprogramar!(lapso)} disabled={operando}>
                        Reprogramar día
                      </Button>
                    ) : null}
                    {puedeGenerar ? (
                      <Button variante='secondary' tamano='sm' onClick={() => onGenerarPracticas!(lapso.id)} disabled={operando}>
                        Generar prácticas
                      </Button>
                    ) : null}
                    {lapso.status === 'PLANNED' ? (
                      <Button variante='primary' tamano='sm' onClick={() => onActivar(lapso.id)} disabled={operando}>
                        Activar
                      </Button>
                    ) : null}
                    {lapso.status === 'ACTIVE' ? (
                      <Button variante='secondary' tamano='sm' onClick={() => onCerrar(lapso.id)} disabled={operando}>
                        Cerrar
                      </Button>
                    ) : null}
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

export default TablaLapsos
