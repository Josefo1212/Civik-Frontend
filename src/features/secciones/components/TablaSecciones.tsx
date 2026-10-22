import type { Seccion } from '../../../domain/seccion'
import Badge from '../../../components/ui/Badge/Badge'
import Button from '../../../components/ui/Button/Button'
import { ETIQUETAS_TURNO } from '../constants'
import styles from './TablaSecciones.module.css'

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
      <p className={styles.vacio} aria-live='polite'>
        No hay secciones para este filtro.
      </p>
    )
  }

  return (
    <div className={styles.contenedor}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Grado</th>
            <th>Subdivisión</th>
            <th>Turno</th>
            <th>Estado</th>
            <th className={styles.numAlin}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((seccion) => {
            const bajaEnSesion = estaBajaEnSesion(seccion.id)
            const activa = seccion.active && !bajaEnSesion
            const operando = operandoId === seccion.id

            return (
              <tr key={seccion.id}>
                <td className={styles.dato}>{seccion.grade_level}</td>
                <td className={styles.dato}>{seccion.section}</td>
                <td className={styles.dato}>
                  {ETIQUETAS_TURNO[seccion.shift as keyof typeof ETIQUETAS_TURNO] ?? seccion.shift}
                </td>
                <td>
                  <Badge variante={activa ? 'ok' : 'neutral'}>
                    {activa ? 'Activa' : 'Dada de baja'}
                  </Badge>
                </td>
                <td>
                  <div className={styles.acciones}>
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
