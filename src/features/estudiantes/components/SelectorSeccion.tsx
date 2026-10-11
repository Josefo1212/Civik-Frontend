import type { Seccion } from '../../../domain/seccion'

export type PropsSelector = {
  secciones: Seccion[]
  valor: string | null
  onCambiar: (id: string | null) => void
  cargando?: boolean
}

const SelectorSeccion = ({ secciones, valor, onCambiar, cargando = false }: PropsSelector) => {
  const activas = secciones.filter((s) => s.active)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', maxWidth: '320px' }}>
      <label htmlFor='selector-seccion'>Sección</label>
      <select
        id='selector-seccion'
        aria-label='selector-seccion'
        value={valor ?? ''}
        onChange={(e) => {
          const v = e.target.value
          onCambiar(v === '' ? null : v)
        }}
        disabled={cargando}
      >
        <option value=''>Selecciona una sección</option>
        {activas.map((s) => (
          <option key={s.id} value={s.id}>
            {s.grade_level} - {s.section} ({s.shift})
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectorSeccion
