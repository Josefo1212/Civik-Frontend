import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('smoke', () => {
  it('renderiza con jsdom y matchers de jest-dom', () => {
    render(<div>hola</div>)
    expect(screen.getByText('hola')).toBeInTheDocument()
  })
})