import { describe, expect, it } from 'vitest'
import type { Estudiante } from '../../domain/estudiante'
import { filtrarEstudiantes, normalizar } from './utils'

const alumno = (first_name: string, last_name: string, id = first_name): Estudiante => ({
  id,
  id_section: 's1',
  first_name,
  last_name,
  phone: null,
  active: true,
  created_at: '',
  updated_at: '',
})

const lista = [alumno('Ana', 'López'), alumno('Luis', 'Pérez'), alumno('Eva', 'Gómez')]

describe('normalizar', () => {
  it('pasa a minúsculas y quita acentos', () => {
    expect(normalizar('López')).toBe('lopez')
  })
})

describe('filtrarEstudiantes', () => {
  it('coincide por nombre', () => {
    expect(filtrarEstudiantes(lista, 'ana').map((e) => e.id)).toEqual(['Ana'])
  })

  it('coincide por apellido ignorando acentos y mayúsculas', () => {
    expect(filtrarEstudiantes(lista, 'LOPEZ').map((e) => e.id)).toEqual(['Ana'])
  })

  it('texto vacío (o solo espacios) devuelve todo', () => {
    expect(filtrarEstudiantes(lista, '   ')).toHaveLength(3)
  })

  it('sin coincidencias devuelve vacío', () => {
    expect(filtrarEstudiantes(lista, 'zzz')).toEqual([])
  })
})
