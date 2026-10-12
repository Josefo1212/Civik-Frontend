import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import FormularioLapso from './FormularioLapso'

describe('FormularioLapso', () => {
  it('envía los campos escritos', async () => {
    const usuario = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormularioLapso enviando={false} onSubmit={onSubmit} />)

    await usuario.type(screen.getByRole('spinbutton', { name: 'lap-anio' }), '2026')
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'lap-numero' }), '1')
    fireEvent.change(screen.getByLabelText('lap-inicio'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('lap-fin'), { target: { value: '2026-09-30' } })
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'lap-dia' }), 'THURSDAY')
    await usuario.click(screen.getByRole('button', { name: 'guardar-lapso' }))

    expect(onSubmit).toHaveBeenCalledWith({
      school_year: '2026',
      lapse_number: '1',
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      practice_day: 'THURSDAY',
    })
  })

  it('deshabilita guardar con campos incompletos y muestra el error', () => {
    render(<FormularioLapso enviando={false} error='El lapso se solapa' onSubmit={() => {}} />)

    expect(screen.getByRole('button', { name: 'guardar-lapso' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('El lapso se solapa')
  })
})
