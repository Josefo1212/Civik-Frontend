import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Seccion } from '../../../domain/seccion'
import BarraPdf, { type PropsBarraPdf } from './BarraPdf'

const seccion = (parcial: Partial<Seccion> & Pick<Seccion, 'id' | 'grade_level' | 'section'>): Seccion => ({
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
  ...parcial,
})

const secciones = [
  seccion({ id: 's1', grade_level: '1ro', section: 'a' }),
  seccion({ id: 's2', grade_level: '2do', section: 'b', shift: 'VESPERTINO' }),
]

const propsBase: PropsBarraPdf = {
  secciones,
  valor: null,
  onCambiar: () => {},
  onGenerar: () => {},
  generando: false,
  deshabilitado: false,
}

describe('BarraPdf', () => {
  it('ofrece "Todas las secciones" y cada sección activa', () => {
    render(<BarraPdf {...propsBase} />)

    const selector = screen.getByRole('combobox', { name: 'Sección' })
    expect(selector).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Todas las secciones' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '1ro a — Matutino' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '2do b — Vespertino' })).toBeInTheDocument()
  })

  it('no ofrece las secciones dadas de baja', () => {
    render(
      <BarraPdf
        {...propsBase}
        secciones={[...secciones, seccion({ id: 'baja', grade_level: '3ro', section: 'a', active: false })]}
      />,
    )

    expect(screen.queryByRole('option', { name: /3ro a/i })).not.toBeInTheDocument()
  })

  it('deshabilita el botón y explica el motivo', () => {
    render(<BarraPdf {...propsBase} deshabilitado motivoDeshabilitado='Elige un lapso' />)

    const boton = screen.getByRole('button', { name: /generar pdf/i })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('title', 'Elige un lapso')
  })

  it('cambia el alcance a una sección', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(<BarraPdf {...propsBase} onCambiar={onCambiar} />)

    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Sección' }), 's2')

    expect(onCambiar).toHaveBeenCalledWith('s2')
  })

  it('cambia el alcance a todas las secciones', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(<BarraPdf {...propsBase} valor='s1' onCambiar={onCambiar} />)

    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Sección' }), '')

    expect(onCambiar).toHaveBeenCalledWith(null)
  })

  it('llama a onGenerar al pulsar el botón', async () => {
    const usuario = userEvent.setup()
    const onGenerar = vi.fn()
    render(<BarraPdf {...propsBase} onGenerar={onGenerar} />)

    await usuario.click(screen.getByRole('button', { name: /generar pdf/i }))

    expect(onGenerar).toHaveBeenCalledTimes(1)
  })

  it('muestra el estado de carga y evita generar dos veces', () => {
    render(<BarraPdf {...propsBase} generando />)

    const boton = screen.getByRole('button', { name: /generar pdf/i })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
  })

  it('muestra el error recibido', () => {
    render(<BarraPdf {...propsBase} error='No hay estudiantes para incluir en el PDF.' />)

    expect(screen.getByRole('alert')).toHaveTextContent('No hay estudiantes para incluir en el PDF.')
  })
})
