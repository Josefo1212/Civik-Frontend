import Alert from '../../../components/ui/Alert/Alert'
import Button from '../../../components/ui/Button/Button'
import SelectField from '../../../components/ui/SelectField/SelectField'
import type { Seccion } from '../../../domain/seccion'
import { etiquetaSeccion } from '../../secciones/utils'
import styles from './BarraPdf.module.css'

export type PropsBarraPdf = {
  secciones: Seccion[]
  valor: string | null
  onCambiar: (id: string | null) => void
  onGenerar: () => void
  generando: boolean
  deshabilitado: boolean
  motivoDeshabilitado?: string
  error?: string | null
}

const BarraPdf = ({
  secciones,
  valor,
  onCambiar,
  onGenerar,
  generando,
  deshabilitado,
  motivoDeshabilitado,
  error,
}: PropsBarraPdf) => (
  <div className={styles.contenedor}>
    <div className={styles.barra}>
      <SelectField
        id='selector-seccion-pdf'
        etiqueta='Sección'
        value={valor ?? ''}
        onChange={(evento) => {
          const siguiente = evento.target.value
          onCambiar(siguiente === '' ? null : siguiente)
        }}
        disabled={generando}
      >
        <option value=''>Todas las secciones</option>
        {secciones
          .filter((seccion) => seccion.active)
          .map((seccion) => (
            <option key={seccion.id} value={seccion.id}>
              {etiquetaSeccion(seccion)}
            </option>
          ))}
      </SelectField>
      <Button
        variante='secondary'
        className={styles.botonPdf}
        cargando={generando}
        disabled={deshabilitado}
        title={motivoDeshabilitado}
        onClick={onGenerar}
      >
        Generar PDF
      </Button>
    </div>
    {error !== undefined && error !== null ? (
      <Alert variante='error'>{error}</Alert>
    ) : null}
  </div>
)

export default BarraPdf
