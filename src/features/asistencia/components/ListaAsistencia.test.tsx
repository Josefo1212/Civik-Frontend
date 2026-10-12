import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import type { FilaPadron } from '../../../domain/asistencia'
import ListaAsistencia from './ListaAsistencia'

const filas: FilaPadron[] = [
  { id_student: 's1', first_name: 'Ana', last_name: 'López', state: null },
  { id_student: 's2', first_name: 'Luis', last_name: 'Pérez', state: 'PRESENTE' },
]

describe('ListaAsistencia', () => {
  it('muestra "Sin marcar" cuando no hay estado y el estado cuando lo hay', () => {
    render(<ListaAsistencia filas={filas} estados={{ s1: null, s2: 'PRESENTE' }} onCambiar={() => {}} />)

    expect(screen.getByText('Sin marcar')).toBeInTheDocument()
    expect(screen.getAllByText('Presente').length).toBeGreaterThan(0)
    expect(screen.getByText('López, Ana')).toBeInTheDocument()
  })

  it('notifica el cambio de estado', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(<ListaAsistencia filas={filas} estados={{ s1: null, s2: 'PRESENTE' }} onCambiar={onCambiar} />)

    await usuario.click(screen.getByRole('radio', { name: 'AUSENTE-s1' }))

    expect(onCambiar).toHaveBeenCalledWith('s1', 'AUSENTE')
  })
})
