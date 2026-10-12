import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import type { Evento } from '../../../domain/evento'
import ListaEventos from './ListaEventos'

const base = {
  id_lapse: 'l1',
  event_date: '2026-09-03',
  source: 'MANUAL',
  created_at: null,
  updated_at: null,
} as const

const programado: Evento = {
  ...base,
  id: 'e1',
  event_name: 'Práctica 1',
  type_event: 'PRACTICA_REGULAR',
  status: 'SCHEDULED',
  cancelled_reason: null,
}

const cancelado: Evento = {
  ...base,
  id: 'e2',
  event_name: 'Presentación',
  type_event: 'PRESENTACION',
  status: 'CANCELLED',
  cancelled_reason: 'Lluvia',
}

const propsBase = {
  eventoCancelandoId: null,
  onIniciarCancelar: () => {},
  onCancelarCancelar: () => {},
  onConfirmarCancelar: () => {},
}

describe('ListaEventos', () => {
  it('muestra el motivo y no ofrece cancelar un evento cancelado', () => {
    render(<ListaEventos eventos={[cancelado]} {...propsBase} />)

    expect(screen.getByText(/Lluvia/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'cancelar-evento-e2' })).not.toBeInTheDocument()
  })

  it('ofrece cancelar un evento programado', async () => {
    const usuario = userEvent.setup()
    const onIniciarCancelar = vi.fn()
    render(
      <ListaEventos eventos={[programado]} {...propsBase} onIniciarCancelar={onIniciarCancelar} />,
    )

    await usuario.click(screen.getByRole('button', { name: 'cancelar-evento-e1' }))

    expect(onIniciarCancelar).toHaveBeenCalledWith('e1')
  })
})
