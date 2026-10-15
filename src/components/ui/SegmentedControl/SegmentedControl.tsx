import { useIndicadorDeslizante } from '../../../hooks/useIndicadorDeslizante'
import styles from './SegmentedControl.module.css'

interface Opcion<T extends string> {
  valor: T
  etiqueta: string
}

interface Props<T extends string> {
  opciones: readonly Opcion<T>[]
  valor: T
  onCambiar: (valor: T) => void
  etiquetaGrupo: string
}

const SegmentedControl = <T extends string>({
  opciones,
  valor,
  onCambiar,
  etiquetaGrupo,
}: Props<T>) => {
  const { contenedorRef, indicadorRef } = useIndicadorDeslizante<HTMLDivElement>(
    valor,
    '[data-activo="true"]',
  )

  return (
    <div
      ref={contenedorRef}
      className={styles.grupo}
      role="group"
      aria-label={etiquetaGrupo}
    >
      <span ref={indicadorRef} className={styles.indicador} aria-hidden="true" />
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activa}
            data-activo={activa ? 'true' : undefined}
            className={[styles.opcion, activa ? styles.activa : ''].filter(Boolean).join(' ')}
            onClick={() => onCambiar(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
