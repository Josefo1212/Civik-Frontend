import { GRADO_TODOS } from '../constants'
import styles from './FiltroGrado.module.css'

export type PropsFiltro = {
  grado: string
  onGradoChange: (grado: string) => void
}

const GRADOS_FILTRO = ['todos', '1ro', '2do', '3ro', '4to', '5to'] as const

const FiltroGrado = ({ grado, onGradoChange }: PropsFiltro) => {
  return (
    <div className={styles.filtro}>
      <label htmlFor='filtro-grado'>Grado</label>
      <select
        id='filtro-grado'
        aria-label='filtro-grado'
        value={grado}
        onChange={(evento) => {
          onGradoChange(evento.target.value)
        }}
      >
        {GRADOS_FILTRO.map((g) => (
          <option key={g} value={g}>
            {g === GRADO_TODOS ? 'Todos' : g}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FiltroGrado
