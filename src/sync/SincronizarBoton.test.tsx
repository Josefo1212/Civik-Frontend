import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { db } from './db'
import { encolar } from './outbox'
import { refrescarPendientes } from './syncManager'
import SincronizarBoton from './SincronizarBoton'

const envoltorio = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

beforeEach(async () => {
  await db.outbox.clear()
  await refrescarPendientes()
})

describe('SincronizarBoton', () => {
  it('queda deshabilitado sin pendientes', () => {
    render(<SincronizarBoton />, { wrapper: envoltorio })

    const boton = screen.getByRole('button', { name: 'sincronizar' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveTextContent('Sincronizar')
  })

  it('muestra el contador de pendientes', async () => {
    await encolar([{ id_event: 'e1', id_student: 's1', state: 'PRESENTE' }])
    await refrescarPendientes()

    render(<SincronizarBoton />, { wrapper: envoltorio })

    const boton = screen.getByRole('button', { name: 'sincronizar' })
    expect(boton).toBeEnabled()
    expect(boton).toHaveTextContent('(1)')
  })
})
