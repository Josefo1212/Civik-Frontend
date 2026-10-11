import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import FormularioEstudiante from './FormularioEstudiante'
import type { Seccion } from '../../../domain/seccion'

const secciones: Seccion[] = [{ id: 'sec1', grade_level: '1ro', section: 'A', shift: 'MATUTINO', active: true, created_at: '', updated_at: '' }]

describe('FormularioEstudiante', () => {
  it('envía los valores', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormularioEstudiante secciones={secciones} valorInicial={{ id_seccion: 'sec1', apellido: 'López', nombre: 'Ana', telefono: '123' }} enviando={false} onSubmit={onSubmit} />)
    await usuario.click(screen.getByRole('button', { name: 'guardar-estudiante' }))
    expect(onSubmit).toHaveBeenCalledWith({ id_seccion: 'sec1', apellido: 'López', nombre: 'Ana', telefono: '123' })
  })
  it('muestra error y deshabilita', () => {
    render(<FormularioEstudiante secciones={secciones} valorInicial={{ id_seccion: 'sec1', apellido: 'López', nombre: 'Ana', telefono: '' }} enviando={true} error='Error' onSubmit={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Error')
    const botones = screen.getAllByRole('button', { name: 'guardar-estudiante' })
    expect(botones.some((b) => b.hasAttribute('disabled'))).toBe(true)
  })
})
