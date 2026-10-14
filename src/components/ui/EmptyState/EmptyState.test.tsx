import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('muestra el mensaje recibido', () => {
    render(<EmptyState>No hay estudiantes para mostrar.</EmptyState>)

    expect(screen.getByText('No hay estudiantes para mostrar.')).toBeInTheDocument()
  })
})
