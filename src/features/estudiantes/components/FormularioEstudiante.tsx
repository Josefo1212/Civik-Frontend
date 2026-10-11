import type { FormEvent } from 'react'
import type { Seccion } from '../../../domain/seccion'

export type ValoresEstudiante = {
  id_seccion: string
  apellido: string
  nombre: string
  telefono: string
}

export type PropsFormularioEst = {
  secciones: Seccion[]
  valorInicial?: ValoresEstudiante
  enviando: boolean
  error?: string | null
  onSubmit: (valores: ValoresEstudiante) => void
}

const VACIO: ValoresEstudiante = {
  id_seccion: '',
  apellido: '',
  nombre: '',
  telefono: '',
}

const FormularioEstudiante = ({ secciones, valorInicial, enviando, error, onSubmit }: PropsFormularioEst) => {
  const valores = valorInicial ?? VACIO
  const activas = secciones.filter((s) => s.active)

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({
      id_seccion: valores.id_seccion,
      apellido: valores.apellido.trim(),
      nombre: valores.nombre.trim(),
      telefono: valores.telefono.trim(),
    })
  }

  const invalido = valores.id_seccion === '' || valores.apellido.trim() === '' || valores.nombre.trim() === ''

  return (
    <form
      aria-label='formulario-estudiante'
      onSubmit={enviar}
      style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='est-id-seccion'>Sección</label>
        <select
          id='est-id-seccion'
          aria-label='est-id-seccion'
          value={valores.id_seccion}
          onChange={() => {}}
          disabled={enviando}
          required
        >
          <option value='' disabled>
            Selecciona una sección
          </option>
          {activas.map((s) => (
            <option key={s.id} value={s.id}>
              {s.grade_level} - {s.section} ({s.shift})
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='est-apellido'>Apellido</label>
        <input id='est-apellido' aria-label='est-apellido' value={valores.apellido} onChange={() => {}} disabled={enviando} required />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='est-nombre'>Nombre</label>
        <input id='est-nombre' aria-label='est-nombre' value={valores.nombre} onChange={() => {}} disabled={enviando} required />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='est-telefono'>Teléfono (opcional)</label>
        <input id='est-telefono' aria-label='est-telefono' value={valores.telefono} onChange={() => {}} disabled={enviando} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type='submit' aria-label='guardar-estudiante' disabled={enviando || invalido}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
        {error ? (
          <p role='alert' style={{ color: '#dc2626' }}>
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default FormularioEstudiante
