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
  idFormulario?: string
}

const VACIO: ValoresEvento = {
  event_date: '',
  type_event: '',
  event_name: '',
}

const FormularioEvento = ({ valorInicial, enviando, error, onSubmit, idFormulario }: PropsFormularioEvento) => {
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
      id={idFormulario}
      onSubmit={enviar}
      style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: '1fr',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {error ? <Alert variante="error">{error}</Alert> : null}
      </div>
    </form>
  )
}

export default FormularioEvento
