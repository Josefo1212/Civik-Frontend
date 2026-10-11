import type { FormEvent } from 'react'
import { GRADOS, TURNOS } from '../constants'

export type ValoresFormulario = {
  grade_level: string
  section: string
  shift: string
}

export type PropsFormulario = {
  valorInicial?: ValoresFormulario
  enviando: boolean
  error?: string | null
  onSubmit: (valores: ValoresFormulario) => void
}

const FORMULARIO_VACIO: ValoresFormulario = {
  grade_level: '',
  section: '',
  shift: '',
}

const esFormularioInvalido = (valores: ValoresFormulario) => {
  return valores.grade_level === '' || valores.section.trim() === '' || valores.shift === ''
}

const FormularioSeccion = ({
  valorInicial,
  enviando,
  error,
  onSubmit,
}: PropsFormulario) => {
  const valores = valorInicial ?? FORMULARIO_VACIO

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onSubmit({
      grade_level: valores.grade_level,
      section: valores.section.trim(),
      shift: valores.shift,
    })
  }

  return (
    <form
      onSubmit={enviar}
      aria-label='formulario-seccion'
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
        <label htmlFor='grado'>Grado</label>
        <select
          id='grado'
          name='grado'
          value={valores.grade_level}
          onChange={() => {}}
          disabled={enviando}
          required
          aria-label='grado'
        >
          <option value='' disabled>
            Selecciona un grado
          </option>
          {GRADOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='seccion'>Subdivisión</label>
        <input
          id='seccion'
          name='seccion'
          type='text'
          value={valores.section}
          onChange={() => {}}
          disabled={enviando}
          required
          aria-label='seccion'
          placeholder='A, B, 1...'
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='turno'>Turno</label>
        <select
          id='turno'
          name='turno'
          value={valores.shift}
          onChange={() => {}}
          disabled={enviando}
          required
          aria-label='turno'
        >
          <option value='' disabled>
            Selecciona un turno
          </option>
          {TURNOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button type='submit' disabled={enviando || esFormularioInvalido(valores)} aria-label='guardar-seccion'>
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
        {error ? (
          <p style={{ color: '#dc2626', fontSize: '0.9rem' }} role='alert'>
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default FormularioSeccion
