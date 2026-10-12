import { describe, expect, it } from 'vitest'
import { AVISO_DEFINITIVA, AVISO_PROVISIONAL } from './constants'
import { esNotaProvisional, textoEstadoNota } from './utils'

describe('esNotaProvisional', () => {
  it('es provisional mientras el lapso no está cerrado', () => {
    expect(esNotaProvisional('PLANNED')).toBe(true)
    expect(esNotaProvisional('ACTIVE')).toBe(true)
  })

  it('es definitiva con el lapso cerrado', () => {
    expect(esNotaProvisional('CLOSED')).toBe(false)
  })
})

describe('textoEstadoNota', () => {
  it('devuelve el aviso según el estado', () => {
    expect(textoEstadoNota('ACTIVE')).toBe(AVISO_PROVISIONAL)
    expect(textoEstadoNota('CLOSED')).toBe(AVISO_DEFINITIVA)
  })
})
