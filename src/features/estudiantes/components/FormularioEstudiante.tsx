import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Seccion } from '../../../domain/seccion'
import Alert from '../../../components/ui/Alert/Alert'
import Button from '../../../components/ui/Button/Button'
import SelectField from '../../../components/ui/SelectField/SelectField'
import TextField from '../../../components/ui/TextField/TextField'
import styles from './FormularioEstudiante.module.css'

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
  const [valores, setValores] = useState<ValoresEstudiante>(valorInicial ?? VACIO)
  const activas = secciones.filter((s) => s.active)

  const actualizar = (campo: keyof ValoresEstudiante, valor: string) => {
    setValores((previos) => ({ ...previos, [campo]: valor }))
  }

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
    <form aria-label="formulario-estudiante" onSubmit={enviar} className={styles.formulario}>
      <SelectField
        id="est-id-seccion"
        aria-label="est-id-seccion"
        etiqueta="Sección"
        value={valores.id_seccion}
        onChange={(evento) => actualizar('id_seccion', evento.target.value)}
        disabled={enviando}
        required
      >
        <option value="" disabled>
          Selecciona una sección
        </option>
        {activas.map((s) => (
          <option key={s.id} value={s.id}>
            {s.grade_level} - {s.section} ({s.shift})
          </option>
        ))}
      </SelectField>
      <TextField
        id="est-apellido"
        aria-label="est-apellido"
        etiqueta="Apellido"
        value={valores.apellido}
        onChange={(evento) => actualizar('apellido', evento.target.value)}
        disabled={enviando}
        required
      />
      <TextField
        id="est-nombre"
        aria-label="est-nombre"
        etiqueta="Nombre"
        value={valores.nombre}
        onChange={(evento) => actualizar('nombre', evento.target.value)}
        disabled={enviando}
        required
      />
      <TextField
        id="est-telefono"
        aria-label="est-telefono"
        etiqueta="Teléfono (opcional)"
        value={valores.telefono}
        onChange={(evento) => actualizar('telefono', evento.target.value)}
        disabled={enviando}
      />
      <div className={styles.acciones}>
        <Button type="submit" aria-label="guardar-estudiante" disabled={enviando || invalido} cargando={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </Button>
        {error ? <Alert variante="error">{error}</Alert> : null}
      </div>
    </form>
  )
}

export default FormularioEstudiante
