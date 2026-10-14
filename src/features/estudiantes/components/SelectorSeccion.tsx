import type { Seccion } from '../../../domain/seccion'
import SelectField from '../../../components/ui/SelectField/SelectField'
import styles from './SelectorSeccion.module.css'

export type PropsSelector = {
  secciones: Seccion[]
  valor: string | null
  onCambiar: (id: string | null) => void
  cargando?: boolean
}

const SelectorSeccion = ({ secciones, valor, onCambiar, cargando = false }: PropsSelector) => {
  const activas = secciones.filter((s) => s.active)

  return (
    <div className={styles.selector}>
      <SelectField
        id="selector-seccion"
        aria-label="selector-seccion"
        etiqueta="Sección"
        value={valor ?? ''}
        onChange={(evento) => {
          const v = evento.target.value
          onCambiar(v === '' ? null : v)
        }}
        disabled={cargando}
      >
        <option value="">Selecciona una sección</option>
        {activas.map((s) => (
          <option key={s.id} value={s.id}>
            {s.grade_level} - {s.section} ({s.shift})
          </option>
        ))}
      </SelectField>
    </div>
  )
}

export default SelectorSeccion
