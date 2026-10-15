import { useState } from 'react'
import type { FormEvent } from 'react'
import Alert from '../../../components/ui/Alert/Alert'
import { ETIQUETAS_TIPO, TIPOS_EVENTO } from '../constants'

export type ValoresEvento = {
  event_date: string
  type_event: string
  event_name: string
}

export type PropsFormularioEvento = {
  valorInicial?: ValoresEvento
  enviando: boolean
  error?: string | null
  onSubmit: (valores: ValoresEvento) => void
}

const VACIO: ValoresEvento = {
  event_date: '',
  type_event: '',
  event_name: '',
}

const estaIncompleto = (valores: ValoresEvento) =>
  valores.event_date.trim() === '' ||
  valores.type_event === '' ||
  valores.event_name.trim() === ''

const FormularioEvento = ({ valorInicial, enviando, error, onSubmit }: PropsFormularioEvento) => {
  const [valores, setValores] = useState<ValoresEvento>(valorInicial ?? VACIO)

  const actualizar = (campo: keyof ValoresEvento, valor: string) => {
    setValores((previos) => ({ ...previos, [campo]: valor }))
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onSubmit({ ...valores, event_name: valores.event_name.trim() })
  }

  return (
    <form
      aria-label='formulario-evento'
      onSubmit={enviar}
      style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        padding: '16px',
        border: '1px solid var(--color-borde-fuerte)',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='ev-fecha'>Fecha</label>
        <input
          id='ev-fecha'
          aria-label='ev-fecha'
          type='date'
          value={valores.event_date}
          onChange={(e) => actualizar('event_date', e.target.value)}
          disabled={enviando}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='ev-tipo'>Tipo</label>
        <select
          id='ev-tipo'
          aria-label='ev-tipo'
          value={valores.type_event}
          onChange={(e) => actualizar('type_event', e.target.value)}
          disabled={enviando}
          required
        >
          <option value='' disabled>
            Selecciona
          </option>
          {TIPOS_EVENTO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {ETIQUETAS_TIPO[tipo]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='ev-nombre'>Nombre</label>
        <input
          id='ev-nombre'
          aria-label='ev-nombre'
          type='text'
          value={valores.event_name}
          onChange={(e) => actualizar('event_name', e.target.value)}
          disabled={enviando}
          required
        />
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type='submit'
          aria-label='guardar-evento'
          disabled={enviando || estaIncompleto(valores)}
        >
          {enviando ? 'Guardando...' : 'Crear evento'}
        </button>
        {error ? (
          <Alert variante="error">{error}</Alert>
        ) : null}
      </div>
    </form>
  )
}

export default FormularioEvento
