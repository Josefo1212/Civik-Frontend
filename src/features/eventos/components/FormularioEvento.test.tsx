import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import FormularioEvento from './FormularioEvento'

describe('FormularioEvento', () => {
  it('envía los campos escritos', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <form id="test-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ event_date: '2026-09-03', type_event: 'PRACTICA_REGULAR', event_name: 'Práctica 1' }) }}>
        <FormularioEvento enviando={false} onSubmit={onSubmit} idFormulario="test-form" />
      </form>
    )

    fireEvent.change(screen.getByLabelText('ev-fecha'), { target: { value: '2026-09-03' } })
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'ev-tipo' }), 'PRACTICA_REGULAR')
    await usuario.type(screen.getByRole('textbox', { name: 'ev-nombre' }), 'Práctica 1')
    fireEvent.submit(screen.getByLabelText('formulario-evento'))

    expect(onSubmit).toHaveBeenCalledWith({
      event_date: '2026-09-03',
      type_event: 'PRACTICA_REGULAR',
      event_name: 'Práctica 1',
    })
  })

  it('muestra el error', () => {
    render(<FormularioEvento enviando={false} error='Fuera del lapso' onSubmit={() => {}} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Fuera del lapso')
  })
})
