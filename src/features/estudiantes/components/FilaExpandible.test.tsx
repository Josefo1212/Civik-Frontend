import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Evento } from '../../../domain/evento'
import type { EstadoLapso } from '../../../domain/lapso'
import type { FilaNota } from '../../../domain/nota'
import type { FilaFusionada } from '../../../sync/fusionar'
import FilaExpandible from './FilaExpandible'

const evento = (over: Partial<Evento>): Evento => ({
  id: 'e1',
  id_lapse: 'l1',
  event_date: '2026-04-05',
  type_event: 'PRACTICA_REGULAR',
  source: 'AUTO',
  event_name: 'Práctica 1',
  status: 'SCHEDULED',
  cancelled_reason: null,
  created_at: null,
  updated_at: null,
  ...over,
})

const fila = (over: Partial<FilaFusionada>): FilaFusionada => ({
  id_student: 's1',
  first_name: 'Ana',
  last_name: 'López',
  state: 'PRESENTE',
  estadoSync: null,
  ...over,
})

const mapaCon = (eventos: Evento[], fila_unica: FilaFusionada): Map<string, FilaFusionada> =>
  new Map(eventos.map((e) => [e.id, fila_unica]))

const renderCon = (props: Partial<Parameters<typeof FilaExpandible>[0]>) => {
  const porDefecto = {
    eventos: [evento({})],
    porEvento: mapaCon([evento({})], fila({})),
    nota: null as FilaNota | null,
    estadoLapso: 'ACTIVE' as EstadoLapso,
    onCorregir: vi.fn(),
  }
  return render(<FilaExpandible {...porDefecto} {...props} />)
}

describe('FilaExpandible', () => {
  it('lista los eventos del lapso con su estado', () => {
    const eventos = [evento({ id: 'e1', event_name: 'Práctica 1' }), evento({ id: 'e2', event_name: 'Práctica 2' })]
    const porEvento = new Map<string, FilaFusionada>([
      ['e1', fila({ state: 'PRESENTE' })],
      ['e2', fila({ state: 'AUSENTE' })],
    ])
    renderCon({ eventos, porEvento })

    expect(screen.getByText('Práctica 1')).toBeInTheDocument()
    expect(screen.getByText('Práctica 2')).toBeInTheDocument()
    const mostrados = within(screen.getByTestId('asistencia-lapso')).getAllByText(/^(Presente|Ausente)$/)
    expect(mostrados.length).toBeGreaterThan(0)
  })

  it('muestra un evento pasado sin estado como pendiente, no como ausencia', () => {
    renderCon({
      porEvento: new Map([['e1', fila({ state: null })]]),
    })
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument()
  })

  it('marca los eventos cancelados con su motivo y sin control de corrección', () => {
    const cancelado = evento({ id: 'e1', status: 'CANCELLED', cancelled_reason: 'Lluvia' })
    renderCon({
      eventos: [cancelado],
      porEvento: new Map([['e1', fila({ state: null })]]),
    })

    expect(screen.getByText(/Lluvia/)).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('permite corregir el estado de un evento programado', async () => {
    const onCorregir = vi.fn()
    const usuario = userEvent.setup()
    renderCon({ onCorregir })

    await usuario.click(screen.getByRole('radio', { name: 'AUSENTE-s1-e1' }))
    expect(onCorregir).toHaveBeenCalledWith('e1', 'AUSENTE')
  })

  it('muestra la nota con aviso provisional cuando el lapso no está cerrado', () => {
    renderCon({
      nota: { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '18.50', es_override: false },
      estadoLapso: 'ACTIVE',
    })
    expect(screen.getByText('18.50')).toBeInTheDocument()
    expect(screen.getByText(/provisional/i)).toBeInTheDocument()
  })

  it('marca la nota definitiva cuando el lapso está cerrado', () => {
    renderCon({
      nota: { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '18.50', es_override: false },
      estadoLapso: 'CLOSED',
    })
    expect(screen.getByText(/definitiva/i)).toBeInTheDocument()
  })

  it('marca la nota editada manualmente', () => {
    renderCon({
      nota: { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: '18.50', es_override: true },
    })
    expect(screen.getByText('Editada manualmente')).toBeInTheDocument()
  })

  it('distingue "sin nota" de cero', () => {
    renderCon({
      nota: { id_student: 's1', first_name: 'Ana', last_name: 'López', nota: null, es_override: false },
    })
    expect(screen.getByText('Sin nota')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('indica cuando el lapso no tiene eventos', () => {
    renderCon({ eventos: [], porEvento: new Map() })
    expect(screen.getByText(/no tiene eventos/i)).toBeInTheDocument()
  })

  it('marca la corrección como pendiente de sincronizar', () => {
    const filaPendiente = { ...fila({ state: 'JUSTIFICADO' }), estadoSync: 'pendiente' as const }
    renderCon({ porEvento: new Map([['e1', filaPendiente]]) })
    const zona = within(screen.getByTestId('asistencia-lapso'))
    expect(zona.getByText(/pendiente/i)).toBeInTheDocument()
  })
})
