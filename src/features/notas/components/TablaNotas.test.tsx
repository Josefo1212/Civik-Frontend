import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FilaNota } from '../../../domain/nota'
import TablaNotas from './TablaNotas'

const filas: FilaNota[] = [
  { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '19.5', es_override: false },
  { id_student: 's2', first_name: 'Luis', last_name: 'Pérez', nota: null, es_override: false },
  { id_student: 's3', first_name: 'Eva', last_name: 'Gómez', nota: '0.00', es_override: false },
]

describe('TablaNotas', () => {
  it('muestra la nota tal cual y distingue "Sin nota" de 0', () => {
    render(<TablaNotas filas={filas} />)

    expect(screen.getByText('19.5')).toBeInTheDocument()
    expect(screen.getByText('Sin nota')).toBeInTheDocument()
    expect(screen.getByText('0.00')).toBeInTheDocument()
    expect(screen.getByText('López, Ana')).toBeInTheDocument()
  })

  it('no marca una nota calculada', () => {
    render(<TablaNotas filas={filas} />)

    expect(screen.queryByText('Editada manualmente')).not.toBeInTheDocument()
  })

  it('marca la nota editada manualmente', () => {
    render(
      <TablaNotas
        filas={[{ id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '18.50', es_override: true }]}
      />,
    )

    expect(screen.getByText('18.50')).toBeInTheDocument()
    expect(screen.getByText('Editada manualmente')).toBeInTheDocument()
  })

  it('muestra un vacío sin estudiantes', () => {
    render(<TablaNotas filas={[]} />)

    expect(screen.getByText('Esta sección no tiene estudiantes.')).toBeInTheDocument()
  })
})
