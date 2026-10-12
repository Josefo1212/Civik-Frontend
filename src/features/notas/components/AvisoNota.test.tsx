import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AVISO_DEFINITIVA, AVISO_PROVISIONAL } from '../constants'
import AvisoNota from './AvisoNota'

describe('AvisoNota', () => {
  it('avisa provisional mientras el lapso está abierto', () => {
    render(<AvisoNota estado='ACTIVE' />)

    expect(screen.getByRole('status')).toHaveTextContent(AVISO_PROVISIONAL)
  })

  it('avisa definitiva con el lapso cerrado', () => {
    render(<AvisoNota estado='CLOSED' />)

    expect(screen.getByRole('status')).toHaveTextContent(AVISO_DEFINITIVA)
  })
})
