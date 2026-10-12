import type { Lapso } from '../../../domain/lapso'
import { ETIQUETAS_ESTADO } from '../constants'

export type PropsSelectorLapso = {
  lapsos: Lapso[]
  valor: string | null
  onCambiar: (id: string | null) => void
  cargando?: boolean
}

const etiquetaLapso = (lapso: Lapso): string =>
  `${lapso.school_year} · Lapso ${lapso.lapse_number} (${ETIQUETAS_ESTADO[lapso.status]})`

const SelectorLapso = ({ lapsos, valor, onCambiar, cargando = false }: PropsSelectorLapso) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', maxWidth: '320px' }}>
    <label htmlFor='selector-lapso'>Lapso</label>
    <select
      id='selector-lapso'
      aria-label='selector-lapso'
      value={valor ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onCambiar(v === '' ? null : v)
      }}
      disabled={cargando}
    >
      <option value=''>Selecciona un lapso</option>
      {lapsos.map((lapso) => (
        <option key={lapso.id} value={lapso.id}>
          {etiquetaLapso(lapso)}
        </option>
      ))}
    </select>
  </div>
)

export default SelectorLapso
