import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Seccion } from '../../../domain/seccion'
import ListaSeccionesInactivas from './ListaSeccionesInactivas'

const seccionBaja: Seccion = {
  id: 's1',
  grade_level: '2do',
  section: 'B',
  shift: 'VESPERTINO',
  active: false,
  created_at: '',
  updated_at: '',
}

describe('ListaSeccionesInactivas', () => {
  it('muestra el rótulo y reactiva la sección', async () => {
    const usuario = userEvent.setup()
    const onReactivar = vi.fn()
    render(<ListaSeccionesInactivas secciones={[seccionBaja]} onReactivar={onReactivar} />)

    expect(screen.getByText('2do B — Vespertino')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'reactivar-seccion-s1' }))
    expect(onReactivar).toHaveBeenCalledWith('s1')
  })

  it('no renderiza nada si no hay secciones dadas de baja', () => {
    const { container } = render(
      <ListaSeccionesInactivas secciones={[]} onReactivar={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
