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
}

const TablaEstudiantes = ({ estudiantes, incluirInactivos, onDarDeBaja, onReactivar, operandoId }: PropsTablaEst) => {
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
          return (
            <tr key={e.id}>
              <td>{e.last_name}</td>
              <td>{e.first_name}</td>
              <td>{e.phone ?? ''}</td>
              <td>{e.active ? <Badge variante="ok">Activo</Badge> : <Badge variante="danger">Dado de baja</Badge>}</td>
              <td className={styles.acciones}>
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
          )
        })}
      </tbody>
    </Table>
  )
}

export default TablaEstudiantes
