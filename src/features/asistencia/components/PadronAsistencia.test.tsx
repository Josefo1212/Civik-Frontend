import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import type { FilaPadron } from '../../../domain/asistencia'
import PadronAsistencia from './PadronAsistencia'

const filas: FilaPadron[] = [
  { id_student: 's1', first_name: 'Ana', last_name: 'López', state: null },
  { id_student: 's2', first_name: 'Luis', last_name: 'Pérez', state: 'PRESENTE' },
]

describe('PadronAsistencia', () => {
  it('mantiene guardar deshabilitado sin cambios', () => {
    render(<PadronAsistencia filas={filas} enviando={false} onGuardar={() => {}} />)

    expect(screen.getByRole('button', { name: 'guardar-asistencia' })).toBeDisabled()
  })

  it('habilita y guarda solo los cambios', async () => {
    const usuario = userEvent.setup()
    const onGuardar = vi.fn()
    render(<PadronAsistencia filas={filas} enviando={false} onGuardar={onGuardar} />)

    await usuario.click(screen.getByRole('radio', { name: 'AUSENTE-s1' }))
    const boton = screen.getByRole('button', { name: 'guardar-asistencia' })
    expect(boton).toBeEnabled()

    await usuario.click(boton)

    expect(onGuardar).toHaveBeenCalledWith([{ id_student: 's1', state: 'AUSENTE' }])
  })

  it('muestra el error y deshabilita mientras envía', () => {
    render(<PadronAsistencia filas={filas} enviando={true} error='No se puede registrar asistencia en un evento cancelado' onGuardar={() => {}} />)

    expect(screen.getByRole('alert')).toHaveTextContent('evento cancelado')
    expect(screen.getByRole('button', { name: 'guardar-asistencia' })).toBeDisabled()
  })
})
