import { useState } from 'react'
import type { FormEvent } from 'react'
import Alert from '../../../components/ui/Alert/Alert'
import Button from '../../../components/ui/Button/Button'
import { GRADOS, TURNOS } from '../constants'
import styles from './FormularioSeccion.module.css'

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
  const [valores, setValores] = useState<ValoresFormulario>(valorInicial ?? FORMULARIO_VACIO)

  const actualizar = (campo: keyof ValoresFormulario, valor: string) => {
    setValores((previos) => ({ ...previos, [campo]: valor }))
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onSubmit({
      grade_level: valores.grade_level,
      section: valores.section.trim(),
      shift: valores.shift,
    })
  }

  return (
    <form onSubmit={enviar} aria-label='formulario-seccion' className={styles.formulario}>
      <div className={styles.campo}>
        <label htmlFor='grado'>Grado</label>
        <select
          id='grado'
          name='grado'
          value={valores.grade_level}
          onChange={(e) => actualizar('grade_level', e.target.value)}
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

      <div className={styles.campo}>
        <label htmlFor='seccion'>Subdivisión</label>
        <input
          id='seccion'
          name='seccion'
          type='text'
          value={valores.section}
          onChange={(e) => actualizar('section', e.target.value)}
          disabled={enviando}
          required
          aria-label='seccion'
          placeholder='A, B, 1...'
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor='turno'>Turno</label>
        <select
          id='turno'
          name='turno'
          value={valores.shift}
          onChange={(e) => actualizar('shift', e.target.value)}
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

      <div className={styles.acciones}>
        <Button type='submit' disabled={enviando || esFormularioInvalido(valores)} aria-label='guardar-seccion'>
          {enviando ? 'Guardando...' : 'Guardar sección'}
        </Button>
        {error ? <Alert variante="error">{error}</Alert> : null}
      </div>
    </form>
  )
}

export default FormularioSeccion
