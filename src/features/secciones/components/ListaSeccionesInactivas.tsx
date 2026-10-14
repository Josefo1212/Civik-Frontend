import type { Seccion } from '../../../domain/seccion'
import Badge from '../../../components/ui/Badge/Badge'
import Button from '../../../components/ui/Button/Button'
import Table from '../../../components/ui/Table/Table'
import { etiquetaSeccion } from '../utils'
import styles from './ListaSeccionesInactivas.module.css'

export type PropsListaSeccionesInactivas = {
  secciones: Seccion[]
  onReactivar: (id: string) => void
  operandoId?: string | null
}

const ListaSeccionesInactivas = ({
  secciones,
  onReactivar,
  operandoId,
}: PropsListaSeccionesInactivas) => {
  if (secciones.length === 0) return null

  return (
    <Table>
      <thead>
        <tr>
          <th>Sección</th>
          <th>Estado</th>
          <th className={styles.acciones}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {secciones.map((seccion) => {
          const operando = operandoId === seccion.id
          return (
            <tr key={seccion.id}>
              <td>{etiquetaSeccion(seccion)}</td>
              <td>
                <Badge variante="danger">Dada de baja</Badge>
              </td>
              <td className={styles.acciones}>
                <Button
                  variante="secondary"
                  tamano="sm"
                  aria-label={`reactivar-seccion-${seccion.id}`}
                  onClick={() => onReactivar(seccion.id)}
                  disabled={operando}
                >
                  Reactivar
                </Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default ListaSeccionesInactivas
