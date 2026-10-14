import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renderiza el texto y dispara onClick', async () => {
    const usuario = userEvent.setup()
    const alClic = vi.fn()
    render(<Button onClick={alClic}>Guardar</Button>)

    const boton = screen.getByRole('button', { name: 'Guardar' })
    expect(boton).toHaveAttribute('type', 'button')

    await usuario.click(boton)
    expect(alClic).toHaveBeenCalledTimes(1)
  })

  it('queda deshabilitado mientras carga', () => {
    render(<Button cargando>Guardar</Button>)

    const boton = screen.getByRole('button', { name: 'Guardar' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
  })

  it('respeta el disabled propio', () => {
    render(<Button disabled>Guardar</Button>)

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })
})
