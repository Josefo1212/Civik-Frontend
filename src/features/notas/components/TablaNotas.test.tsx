import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FilaNota } from '../../../domain/nota'
import TablaNotas from './TablaNotas'

const filas: FilaNota[] = [
  { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '19.5' },
  { id_student: 's2', first_name: 'Luis', last_name: 'Pérez', nota: null },
  { id_student: 's3', first_name: 'Eva', last_name: 'Gómez', nota: '0.00' },
]

describe('TablaNotas', () => {
  it('muestra la nota tal cual y distingue "Sin nota" de 0', () => {
    render(<TablaNotas filas={filas} />)

    expect(screen.getByText('19.5')).toBeInTheDocument()
    expect(screen.getByText('Sin nota')).toBeInTheDocument()
    expect(screen.getByText('0.00')).toBeInTheDocument()
    expect(screen.getByText('López, Ana')).toBeInTheDocument()
  })

  it('muestra un vacío sin estudiantes', () => {
    render(<TablaNotas filas={[]} />)

    expect(screen.getByText('Esta sección no tiene estudiantes.')).toBeInTheDocument()
  })
})
