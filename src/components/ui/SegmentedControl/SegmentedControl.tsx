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
}: Props<T>) => (
  <div className={styles.grupo} role="group" aria-label={etiquetaGrupo}>
    {opciones.map((opcion) => (
      <button
        key={opcion.valor}
        type="button"
        aria-pressed={opcion.valor === valor}
        className={[styles.opcion, opcion.valor === valor ? styles.activa : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onCambiar(opcion.valor)}
      >
        {opcion.etiqueta}
      </button>
    ))}
  </div>
)

export default SegmentedControl
