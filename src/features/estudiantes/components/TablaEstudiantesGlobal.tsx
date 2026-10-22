import type { ReactNode } from 'react'
import { Fragment } from 'react'
import type { Estudiante } from '../../../domain/estudiante'
import Badge from '../../../components/ui/Badge/Badge'
import Button from '../../../components/ui/Button/Button'
import EmptyState from '../../../components/ui/EmptyState/EmptyState'
import Table from '../../../components/ui/Table/Table'
import styles from './TablaEstudiantesGlobal.module.css'

export type PropsTablaEstudiantesGlobal = {
  estudiantes: Estudiante[]
  etiquetaPorSeccion: (idSeccion: string) => string
  incluirInactivos: boolean
  onReactivar: (id: string) => void
  mensajeVacio: string
  operandoId?: string | null
  expandidoId?: string | null
  onExpandir?: (id: string) => void
  renderDetalle?: (estudiante: Estudiante) => ReactNode
}

const TablaEstudiantesGlobal = ({
  estudiantes,
  etiquetaPorSeccion,
  incluirInactivos,
  onReactivar,
  mensajeVacio,
  operandoId,
  expandidoId = null,
  onExpandir,
  renderDetalle,
}: PropsTablaEstudiantesGlobal) => {
  const filas = incluirInactivos ? estudiantes : estudiantes.filter((e) => e.active)

  if (filas.length === 0) {
    return (
      <div aria-live="polite">
        <EmptyState>{mensajeVacio}</EmptyState>
      </div>
    )
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Apellido</th>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Sección</th>
          <th>Estado</th>
          <th className={styles.acciones}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((estudiante) => {
          const operando = operandoId === estudiante.id
          const expandido = expandidoId === estudiante.id
          return (
            <Fragment key={estudiante.id}>
              <tr>
                <td>{estudiante.last_name}</td>
                <td>{estudiante.first_name}</td>
                <td>{estudiante.phone ?? ''}</td>
                <td>{etiquetaPorSeccion(estudiante.id_section)}</td>
                <td>
                  {estudiante.active ? (
                    <Badge variante="ok">Activo</Badge>
                  ) : (
                    <Badge variante="danger">Dado de baja</Badge>
                  )}
                </td>
                <td className={styles.acciones}>
                  {onExpandir !== undefined ? (
                    <Button
                      variante="secondary"
                      tamano="sm"
                      aria-expanded={expandido}
                      aria-label={`expandir-estudiante-${estudiante.id}`}
                      onClick={() => onExpandir(estudiante.id)}
                    >
                      {expandido ? 'Cerrar' : 'Ver detalle'}
                    </Button>
                  ) : null}
                  {estudiante.active ? null : (
                    <Button
                      variante="secondary"
                      tamano="sm"
                      aria-label={`reactivar-estudiante-${estudiante.id}`}
                      onClick={() => onReactivar(estudiante.id)}
                      disabled={operando}
                    >
                      Reactivar
                    </Button>
                  )}
                </td>
              </tr>
              {expandido && renderDetalle !== undefined ? (
                <tr>
                  <td colSpan={6} className={styles.detalle}>
                    {renderDetalle(estudiante)}
                  </td>
                </tr>
              ) : null}
            </Fragment>
          )
        })}
      </tbody>
    </Table>
  )
}

export default TablaEstudiantesGlobal
