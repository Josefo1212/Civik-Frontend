import type { ReactNode } from 'react'
import { Fragment } from 'react'
import type { Estudiante } from '../../../domain/estudiante'
import Badge from '../../../components/ui/Badge/Badge'
import Button from '../../../components/ui/Button/Button'
import EmptyState from '../../../components/ui/EmptyState/EmptyState'
import Table from '../../../components/ui/Table/Table'
import styles from './TablaEstudiantes.module.css'

export type PropsTablaEst = {
  estudiantes: Estudiante[]
  incluirInactivos: boolean
  onDarDeBaja: (id: string) => void
  onReactivar: (id: string) => void
  operandoId?: string | null
  expandidoId?: string | null
  onExpandir?: (id: string) => void
  renderDetalle?: (estudiante: Estudiante) => ReactNode
}

const TablaEstudiantes = ({
  estudiantes,
  incluirInactivos,
  onDarDeBaja,
  onReactivar,
  operandoId,
  expandidoId = null,
  onExpandir,
  renderDetalle,
}: PropsTablaEst) => {
  const filas = incluirInactivos ? estudiantes : estudiantes.filter((e) => e.active)

  if (filas.length === 0) {
    return (
      <div aria-live="polite">
        <EmptyState>No hay alumnos para mostrar.</EmptyState>
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
          <th>Estado</th>
          <th className={styles.acciones}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((e) => {
          const operando = operandoId === e.id
          const expandido = expandidoId === e.id
          return (
            <Fragment key={e.id}>
              <tr>
                <td>{e.last_name}</td>
                <td>{e.first_name}</td>
                <td>{e.phone ?? ''}</td>
                <td>{e.active ? <Badge variante="ok">Activo</Badge> : <Badge variante="danger">Dado de baja</Badge>}</td>
                <td className={styles.acciones}>
                  {onExpandir !== undefined ? (
                    <Button
                      variante="secondary"
                      tamano="sm"
                      aria-expanded={expandido}
                      aria-label={`expandir-estudiante-${e.id}`}
                      onClick={() => onExpandir(e.id)}
                    >
                      {expandido ? 'Cerrar' : 'Ver detalle'}
                    </Button>
                  ) : null}
                  {e.active ? (
                    <Button
                      variante="danger"
                      tamano="sm"
                      onClick={() => onDarDeBaja(e.id)}
                      disabled={operando}
                    >
                      Dar de baja
                    </Button>
                  ) : (
                    <Button
                      variante="secondary"
                      tamano="sm"
                      onClick={() => onReactivar(e.id)}
                      disabled={operando}
                    >
                      Reactivar
                    </Button>
                  )}
                </td>
              </tr>
              {expandido && renderDetalle !== undefined ? (
                <tr>
                  <td colSpan={5} className={styles.detalle}>
                    {renderDetalle(e)}
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

export default TablaEstudiantes
