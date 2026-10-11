import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import FormularioSeccion from './FormularioSeccion'

describe('FormularioSeccion', () => {
  it('envía los valores seleccionados', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <FormularioSeccion
        valorInicial={{ grade_level: '1ro', section: 'A', shift: 'MATUTINO' }}
        enviando={false}
        onSubmit={onSubmit}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'guardar-seccion' }))

    expect(onSubmit).toHaveBeenCalledWith({ grade_level: '1ro', section: 'A', shift: 'MATUTINO' })
  })

  it('muestra el error recibido', () => {
    render(
      <FormularioSeccion
        valorInicial={{ grade_level: '1ro', section: 'A', shift: 'MATUTINO' }}
        enviando={false}
        error='El grado ya existe'
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('El grado ya existe')
  })

  it('deshabilita el botón mientras enviando', () => {
    render(
      <FormularioSeccion
        valorInicial={{ grade_level: '1ro', section: 'A', shift: 'MATUTINO' }}
        enviando={true}
        onSubmit={() => {}}
      />,
    )

    const botones = screen.getAllByRole('button', { name: 'guardar-seccion' })
    expect(botones.some((b) => b.hasAttribute('disabled'))).toBe(true)
  })
})
