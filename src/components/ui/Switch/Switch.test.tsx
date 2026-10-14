import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Switch from './Switch'

describe('Switch', () => {
  it('informa el cambio y expone el label', async () => {
    const usuario = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Switch id="incluir-inactivos" checked={false} onChange={onChange}>
        Mostrar inactivos
      </Switch>,
    )

    const control = screen.getByLabelText('Mostrar inactivos')
    expect(control).not.toBeChecked()

    await usuario.click(control)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('refleja el estado controlado', () => {
    render(
      <Switch id="x" checked onChange={() => {}}>
        Activo
      </Switch>,
    )

    expect(screen.getByLabelText('Activo')).toBeChecked()
  })
})
