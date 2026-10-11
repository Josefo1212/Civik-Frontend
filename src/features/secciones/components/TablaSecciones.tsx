import type { Seccion } from '../../../domain/seccion'
import { ETIQUETAS_TURNO } from '../constants'

export type PropsTabla = {
  secciones: Seccion[]
  enBajaEnSesion: Seccion[]
  estaBajaEnSesion: (id: string) => boolean
  onEditar: (seccion: Seccion) => void
  onDarDeBaja: (seccion: Seccion) => void
  onReactivar: (seccion: Seccion) => void
  onEliminar: (seccion: Seccion) => void
  operandoId?: string | null
}

const marcarSiBajaEnSesion = (seccion: Seccion, enBajaEnSesion: Seccion[]) => {
  return enBajaEnSesion.some((s) => s.id === seccion.id) ? { ...seccion, active: false } : seccion
}

const combinarSecciones = (secciones: Seccion[], enBajaEnSesion: Seccion[]) => {
  const combinadas = secciones.map((s) => marcarSiBajaEnSesion(s, enBajaEnSesion))
  const idsActivos = new Set(secciones.map((s) => s.id))
  const extras = enBajaEnSesion.filter((s) => !idsActivos.has(s.id))
  return [...combinadas, ...extras]
}

const TablaSecciones = ({
  secciones,
  enBajaEnSesion,
  estaBajaEnSesion,
  onEditar,
  onDarDeBaja,
  onReactivar,
  onEliminar,
  operandoId,
}: PropsTabla) => {
  const filas = combinarSecciones(secciones, enBajaEnSesion)

  if (filas.length === 0) {
    return (
      <p style={{ padding: '16px' }} aria-live='polite'>
        No hay secciones para este filtro.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Grado</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Subdivisión</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Turno</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((seccion) => {
            const bajaEnSesion = estaBajaEnSesion(seccion.id)
            const activa = seccion.active && !bajaEnSesion
            const operando = operandoId === seccion.id

            return (
              <tr key={seccion.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>{seccion.grade_level}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>{seccion.section}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  {ETIQUETAS_TURNO[seccion.shift as keyof typeof ETIQUETAS_TURNO] ?? seccion.shift}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  {activa ? 'Activa' : 'Dada de baja'}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      type='button'
                      onClick={() => {
                        onEditar(seccion)
                      }}
                      disabled={operando}
                    >
                      Editar
                    </button>
                    {activa ? (
                      <button
                        type='button'
                        onClick={() => {
                          onDarDeBaja(seccion)
                        }}
                        disabled={operando}
                      >
                        Dar de baja
                      </button>
                    ) : (
                      <button
                        type='button'
                        onClick={() => {
                          onReactivar(seccion)
                        }}
                        disabled={operando}
                      >
                        Reactivar
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => {
                        onEliminar(seccion)
                      }}
                      disabled={operando}
                    >
                      Eliminar
                    </button>
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

export default TablaSecciones
