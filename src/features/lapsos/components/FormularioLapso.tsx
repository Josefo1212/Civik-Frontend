import { useState } from 'react'
import type { FormEvent } from 'react'
import { DIAS_SEMANA, ETIQUETAS_DIA, NUMEROS_LAPSO } from '../constants'

export type ValoresLapso = {
  school_year: string
  lapse_number: string
  start_date: string
  end_date: string
  practice_day: string
}

export type PropsFormularioLapso = {
  valorInicial?: ValoresLapso
  enviando: boolean
  error?: string | null
  onSubmit: (valores: ValoresLapso) => void
}

const VACIO: ValoresLapso = {
  school_year: '',
  lapse_number: '',
  start_date: '',
  end_date: '',
  practice_day: '',
}

const estaIncompleto = (valores: ValoresLapso) =>
  Object.values(valores).some((valor) => valor.trim() === '')

const FormularioLapso = ({ valorInicial, enviando, error, onSubmit }: PropsFormularioLapso) => {
  const [valores, setValores] = useState<ValoresLapso>(valorInicial ?? VACIO)

  const actualizar = (campo: keyof ValoresLapso, valor: string) => {
    setValores((previos) => ({ ...previos, [campo]: valor }))
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onSubmit(valores)
  }

  return (
    <form
      aria-label='formulario-lapso'
      onSubmit={enviar}
      style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='lap-anio'>Año escolar</label>
        <input
          id='lap-anio'
          aria-label='lap-anio'
          type='number'
          value={valores.school_year}
          onChange={(e) => actualizar('school_year', e.target.value)}
          disabled={enviando}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='lap-numero'>Número</label>
        <select
          id='lap-numero'
          aria-label='lap-numero'
          value={valores.lapse_number}
          onChange={(e) => actualizar('lapse_number', e.target.value)}
          disabled={enviando}
          required
        >
          <option value='' disabled>
            Selecciona
          </option>
          {NUMEROS_LAPSO.map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='lap-inicio'>Inicio</label>
        <input
          id='lap-inicio'
          aria-label='lap-inicio'
          type='date'
          value={valores.start_date}
          onChange={(e) => actualizar('start_date', e.target.value)}
          disabled={enviando}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='lap-fin'>Fin</label>
        <input
          id='lap-fin'
          aria-label='lap-fin'
          type='date'
          value={valores.end_date}
          onChange={(e) => actualizar('end_date', e.target.value)}
          disabled={enviando}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='lap-dia'>Día de práctica</label>
        <select
          id='lap-dia'
          aria-label='lap-dia'
          value={valores.practice_day}
          onChange={(e) => actualizar('practice_day', e.target.value)}
          disabled={enviando}
          required
        >
          <option value='' disabled>
            Selecciona
          </option>
          {DIAS_SEMANA.map((dia) => (
            <option key={dia} value={dia}>
              {ETIQUETAS_DIA[dia]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type='submit'
          aria-label='guardar-lapso'
          disabled={enviando || estaIncompleto(valores)}
        >
          {enviando ? 'Guardando...' : 'Crear lapso'}
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

export default FormularioLapso
