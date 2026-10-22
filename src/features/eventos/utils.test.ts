import { describe, expect, it } from 'vitest'
import { esEventoPasado } from './utils'

const hoy = new Date(2026, 3, 10)

describe('esEventoPasado', () => {
  it('una fecha anterior a hoy es pasado', () => {
    expect(esEventoPasado('2026-04-09', hoy)).toBe(true)
  })

  it('la fecha de hoy no es pasado', () => {
    expect(esEventoPasado('2026-04-10', hoy)).toBe(false)
  })

  it('una fecha futura no es pasado', () => {
    expect(esEventoPasado('2026-04-11', hoy)).toBe(false)
  })
})
