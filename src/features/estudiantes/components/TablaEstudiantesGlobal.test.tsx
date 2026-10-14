import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Estudiante } from '../../../domain/estudiante'
import TablaEstudiantesGlobal from './TablaEstudiantesGlobal'

const alumno = (over: Partial<Estudiante> = {}): Estudiante => ({
  id: 'e1',
  id_section: 's1',
  first_name: 'Ana',
  last_name: 'López',
  phone: null,
  active: true,
  created_at: '',
  updated_at: '',
  ...over,
})

const etiquetaPorSeccion = (id: string) => (id === 's1' ? '1ro A — Matutino' : 'Sección dada de baja')

const mensajeVacio = 'No hay estudiantes para mostrar.'

describe('TablaEstudiantesGlobal', () => {
  it('muestra el rótulo de sección de cada fila', () => {
    render(
      <TablaEstudiantesGlobal
        estudiantes={[alumno()]}
        etiquetaPorSeccion={etiquetaPorSeccion}
        mensajeVacio={mensajeVacio}
        incluirInactivos={false}
        onReactivar={() => {}}
      />,
    )
    expect(screen.getByText('1ro A — Matutino')).toBeInTheDocument()
  })

  it('usa el respaldo si la sección no se resuelve', () => {
    render(
      <TablaEstudiantesGlobal
        estudiantes={[alumno({ id_section: 'x' })]}
        etiquetaPorSeccion={etiquetaPorSeccion}
        mensajeVacio={mensajeVacio}
        incluirInactivos={false}
        onReactivar={() => {}}
      />,
    )
    expect(screen.getByText('Sección dada de baja')).toBeInTheDocument()
  })

  it('oculta a los inactivos si no se incluyen', () => {
    render(
      <TablaEstudiantesGlobal
        estudiantes={[alumno({ id: 'baja', active: false })]}
        etiquetaPorSeccion={etiquetaPorSeccion}
        mensajeVacio={mensajeVacio}
        incluirInactivos={false}
        onReactivar={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: /reactivar-estudiante/ })).not.toBeInTheDocument()
    expect(screen.getByText(mensajeVacio)).toBeInTheDocument()
  })

  it('muestra y reactiva a un inactivo', async () => {
    const usuario = userEvent.setup()
    const onReactivar = vi.fn()
    render(
      <TablaEstudiantesGlobal
        estudiantes={[alumno({ id: 'baja', active: false })]}
        etiquetaPorSeccion={etiquetaPorSeccion}
        mensajeVacio={mensajeVacio}
        incluirInactivos
        onReactivar={onReactivar}
      />,
    )
    await usuario.click(screen.getByRole('button', { name: 'reactivar-estudiante-baja' }))
    expect(onReactivar).toHaveBeenCalledWith('baja')
  })

  it('muestra el mensaje vacío que recibe', () => {
    render(
      <TablaEstudiantesGlobal
        estudiantes={[]}
        etiquetaPorSeccion={etiquetaPorSeccion}
        mensajeVacio='Sin coincidencias para «zzz».'
        incluirInactivos={false}
        onReactivar={() => {}}
      />,
    )
    expect(screen.getByText('Sin coincidencias para «zzz».')).toBeInTheDocument()
  })
})
