import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import FormularioEstudiante from './FormularioEstudiante'
import type { Seccion } from '../../../domain/seccion'

const secciones: Seccion[] = [{ id: 'sec1', grade_level: '1ro', section: 'A', shift: 'MATUTINO', active: true, created_at: '', updated_at: '' }]

describe('FormularioEstudiante', () => {
  it('envía los valores', () => {
    const onSubmit = vi.fn()
    render(<FormularioEstudiante secciones={secciones} valorInicial={{ id_seccion: 'sec1', apellido: 'López', nombre: 'Ana', telefono: '123' }} enviando={false} onSubmit={onSubmit} />)
    fireEvent.submit(screen.getByRole('form', { name: 'formulario-estudiante' }))
    expect(onSubmit).toHaveBeenCalledWith({ id_seccion: 'sec1', apellido: 'López', nombre: 'Ana', telefono: '123' })
  })
  it('muestra error sin botón interno', () => {
    render(<FormularioEstudiante secciones={secciones} valorInicial={{ id_seccion: 'sec1', apellido: 'López', nombre: 'Ana', telefono: '' }} enviando={true} error='Error' onSubmit={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Error')
    expect(screen.queryByRole('button', { name: 'guardar-estudiante' })).not.toBeInTheDocument()
  })

  it('permite escribir los campos y envía lo escrito', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormularioEstudiante secciones={secciones} enviando={false} onSubmit={onSubmit} />)

    await usuario.selectOptions(screen.getByRole('combobox', { name: 'est-id-seccion' }), 'sec1')
    await usuario.type(screen.getByRole('textbox', { name: 'est-apellido' }), 'Pérez')
    await usuario.type(screen.getByRole('textbox', { name: 'est-nombre' }), 'Luis')
    fireEvent.submit(screen.getByRole('form', { name: 'formulario-estudiante' }))

    expect(onSubmit).toHaveBeenCalledWith({ id_seccion: 'sec1', apellido: 'Pérez', nombre: 'Luis', telefono: '' })
  })
})
