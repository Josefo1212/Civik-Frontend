import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SegmentedControl from './SegmentedControl'

const OPCIONES = [
  { valor: 'por-seccion', etiqueta: 'Por sección' },
  { valor: 'todos', etiqueta: 'Todos' },
] as const

describe('SegmentedControl', () => {
  it('marca la opción activa y notifica el cambio', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(
      <SegmentedControl
        etiquetaGrupo="modo-listado"
        opciones={OPCIONES}
        valor="por-seccion"
        onCambiar={onCambiar}
      />,
    )

    expect(screen.getByRole('group', { name: 'modo-listado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Por sección' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await usuario.click(screen.getByRole('button', { name: 'Todos' }))
    expect(onCambiar).toHaveBeenCalledWith('todos')
  })
})
