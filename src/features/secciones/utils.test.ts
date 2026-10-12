import { describe, expect, it } from 'vitest'
import type { Seccion } from '../../domain/seccion'
import { etiquetaSeccion } from './utils'

const base: Seccion = {
  id: '1',
  grade_level: '1ro',
  section: 'A',
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
}

describe('etiquetaSeccion', () => {
  it('arma grado, letra y turno traducido', () => {
    expect(etiquetaSeccion(base)).toBe('1ro A — Matutino')
  })

  it('usa el valor crudo si el turno no está en el catálogo', () => {
    expect(etiquetaSeccion({ ...base, shift: 'NOCTURNO' })).toBe('1ro A — NOCTURNO')
  })

  it('distingue secciones con igual grado y letra por el turno', () => {
    const matutino = etiquetaSeccion(base)
    const vespertino = etiquetaSeccion({ ...base, shift: 'VESPERTINO' })
    expect(matutino).not.toBe(vespertino)
  })
})
