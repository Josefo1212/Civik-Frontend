import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import FormularioEvento from './FormularioEvento'

describe('FormularioEvento', () => {
  it('envía los campos escritos', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormularioEvento enviando={false} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('ev-fecha'), { target: { value: '2026-09-03' } })
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'ev-tipo' }), 'PRACTICA_REGULAR')
    await usuario.type(screen.getByRole('textbox', { name: 'ev-nombre' }), 'Práctica 1')
    await usuario.click(screen.getByRole('button', { name: 'guardar-evento' }))

    expect(onSubmit).toHaveBeenCalledWith({
      event_date: '2026-09-03',
      type_event: 'PRACTICA_REGULAR',
      event_name: 'Práctica 1',
    })
  })

  it('deshabilita guardar con campos incompletos y muestra el error', () => {
    render(<FormularioEvento enviando={false} error='Fuera del lapso' onSubmit={() => {}} />)

    expect(screen.getByRole('button', { name: 'guardar-evento' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Fuera del lapso')
  })
})
