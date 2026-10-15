import type { Seccion } from '../../../domain/seccion'
import Button from '../../../components/ui/Button/Button'
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
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Grado</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Subdivisión</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Turno</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Estado</th>
            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--color-borde-fuerte)' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((seccion) => {
            const bajaEnSesion = estaBajaEnSesion(seccion.id)
            const activa = seccion.active && !bajaEnSesion
            const operando = operandoId === seccion.id

            return (
              <tr key={seccion.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--vidrio-borde)' }}>{seccion.grade_level}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--vidrio-borde)' }}>{seccion.section}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--vidrio-borde)' }}>
                  {ETIQUETAS_TURNO[seccion.shift as keyof typeof ETIQUETAS_TURNO] ?? seccion.shift}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--vidrio-borde)' }}>
                  {activa ? 'Activa' : 'Dada de baja'}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--vidrio-borde)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Button
                      variante='secondary'
                      tamano='sm'
                      onClick={() => {
                        onEditar(seccion)
                      }}
                      disabled={operando}
                    >
                      Editar
                    </Button>
                    {activa ? (
                      <Button
                        variante='danger'
                        tamano='sm'
                        onClick={() => {
                          onDarDeBaja(seccion)
                        }}
                        disabled={operando}
                      >
                        Dar de baja
                      </Button>
                    ) : (
                      <Button
                        variante='secondary'
                        tamano='sm'
                        onClick={() => {
                          onReactivar(seccion)
                        }}
                        disabled={operando}
                      >
                        Reactivar
                      </Button>
                    )}
                    <Button
                      variante='danger'
                      tamano='sm'
                      onClick={() => {
                        onEliminar(seccion)
                      }}
                      disabled={operando}
                    >
                      Eliminar
                    </Button>
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
