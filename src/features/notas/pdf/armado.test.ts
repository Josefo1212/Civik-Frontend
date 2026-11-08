import { describe, expect, it } from 'vitest'
import type { FilaNota } from '../../../domain/nota'
import type { Seccion } from '../../../domain/seccion'
import { armarGruposPdf, nombreArchivoPdf, ordenarSecciones } from './armado'

const seccion = (parcial: Partial<Seccion> & Pick<Seccion, 'id' | 'grade_level' | 'section'>): Seccion => ({
  shift: 'MATUTINO',
  active: true,
  created_at: '',
  updated_at: '',
  ...parcial,
})

const fila = (parcial: Partial<FilaNota> & Pick<FilaNota, 'id_student' | 'first_name' | 'last_name'>): FilaNota => ({
  nota: '19.0',
  es_override: false,
  ...parcial,
})

describe('ordenarSecciones', () => {
  it('ordena de 1ro a 5to y, dentro del grado, por subdivisión', () => {
    const secciones = [
      seccion({ id: 's5', grade_level: '5to', section: 'a' }),
      seccion({ id: 's1b', grade_level: '1ro', section: 'b' }),
      seccion({ id: 's1a', grade_level: '1ro', section: 'a' }),
      seccion({ id: 's3', grade_level: '3ro', section: 'a' }),
    ]

    expect(ordenarSecciones(secciones).map((s) => s.id)).toEqual(['s1a', 's1b', 's3', 's5'])
  })

  it('manda al final un grado fuera del catálogo sin romper el orden', () => {
    const secciones = [
      seccion({ id: 'raro', grade_level: '6to', section: 'a' }),
      seccion({ id: 'primero', grade_level: '1ro', section: 'a' }),
    ]

    expect(ordenarSecciones(secciones).map((s) => s.id)).toEqual(['primero', 'raro'])
  })

  it('no muta el arreglo original', () => {
    const secciones = [
      seccion({ id: 's5', grade_level: '5to', section: 'a' }),
      seccion({ id: 's1', grade_level: '1ro', section: 'a' }),
    ]

    ordenarSecciones(secciones)

    expect(secciones.map((s) => s.id)).toEqual(['s5', 's1'])
  })
})

describe('armarGruposPdf', () => {
  it('descarta las secciones inactivas', () => {
    const secciones = [
      seccion({ id: 'activa', grade_level: '1ro', section: 'a' }),
      seccion({ id: 'baja', grade_level: '2do', section: 'a', active: false }),
    ]

    expect(armarGruposPdf(secciones, new Map()).map((g) => g.idSeccion)).toEqual(['activa'])
  })

  it('mapea apellido, nombre, año, sección, nota y override', () => {
    const secciones = [seccion({ id: 's1', grade_level: '1ro', section: 'a' })]
    const notas = new Map([
      [
        's1',
        [
          fila({ id_student: 'a', first_name: 'Ana', last_name: 'Pérez', nota: '18.50', es_override: true }),
          fila({ id_student: 'b', first_name: 'Luis', last_name: 'Núñez', nota: null }),
        ],
      ],
    ])

    const [grupo] = armarGruposPdf(secciones, notas)

    expect(grupo.etiqueta).toBe('1ro a — Matutino')
    expect(grupo.filas).toEqual([
      { apellido: 'Pérez', nombre: 'Ana', anio: '1ro', seccion: 'a', nota: '18.50', esOverride: true },
      { apellido: 'Núñez', nombre: 'Luis', anio: '1ro', seccion: 'a', nota: null, esOverride: false },
    ])
  })

  it('preserva el orden del roster que devuelve el backend', () => {
    const secciones = [seccion({ id: 's1', grade_level: '1ro', section: 'a' })]
    const notas = new Map([
      [
        's1',
        [
          fila({ id_student: 'a', first_name: 'Ana', last_name: 'Pérez' }),
          fila({ id_student: 'b', first_name: 'Luis', last_name: 'Núñez' }),
        ],
      ],
    ])

    const [grupo] = armarGruposPdf(secciones, notas)

    expect(grupo.filas.map((f) => f.apellido)).toEqual(['Pérez', 'Núñez'])
  })

  it('deja el grupo con filas vacías si la sección no tiene notas', () => {
    const secciones = [seccion({ id: 's1', grade_level: '1ro', section: 'a' })]

    const [grupo] = armarGruposPdf(secciones, new Map())

    expect(grupo.filas).toEqual([])
  })
})

describe('nombreArchivoPdf', () => {
  it('usa año escolar y lapso cuando el alcance es todas las secciones', () => {
    expect(nombreArchivoPdf({ anioEscolar: 2026, lapso: 2 })).toBe('notas-2026-lapso-2.pdf')
  })

  it('agrega año y subdivisión cuando el alcance es una sección', () => {
    expect(
      nombreArchivoPdf({ anioEscolar: 2026, lapso: 2, grupo: { anio: '1ro', seccion: 'A' } }),
    ).toBe('notas-2026-lapso-2-1ro-a.pdf')
  })

  it('quita acentos y espacios del nombre de la sección', () => {
    expect(
      nombreArchivoPdf({ anioEscolar: 2026, lapso: 3, grupo: { anio: '2do', seccion: 'B ' } }),
    ).toBe('notas-2026-lapso-3-2do-b.pdf')
  })
})
