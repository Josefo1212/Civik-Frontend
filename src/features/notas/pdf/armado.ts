import type { FilaNota } from '../../../domain/nota'
import type { Seccion } from '../../../domain/seccion'
import { GRADOS } from '../../secciones/constants'

export type FilaPdf = {
  apellido: string
  nombre: string
  anio: string
  seccion: string
  nota: string | null
  esOverride: boolean
}

export type GrupoPdf = {
  idSeccion: string
  anio: string
  seccion: string
  turno: string
  filas: FilaPdf[]
}

const indiceGrado = (gradeLevel: string): number => {
  const indice = (GRADOS as readonly string[]).indexOf(gradeLevel)
  return indice === -1 ? GRADOS.length : indice
}

export const ordenarSecciones = (secciones: Seccion[]): Seccion[] =>
  [...secciones].sort((a, b) => {
    const porGrado = indiceGrado(a.grade_level) - indiceGrado(b.grade_level)
    if (porGrado !== 0) return porGrado
    return a.section.localeCompare(b.section, 'es', { sensitivity: 'base' })
  })

export const armarGruposPdf = (
  secciones: Seccion[],
  notasPorSeccion: ReadonlyMap<string, FilaNota[]>,
): GrupoPdf[] =>
  ordenarSecciones(secciones.filter((seccion) => seccion.active)).map((seccion) => ({
    idSeccion: seccion.id,
    anio: seccion.grade_level,
    seccion: seccion.section,
    turno: seccion.shift,
    filas: (notasPorSeccion.get(seccion.id) ?? []).map((fila) => ({
      apellido: fila.last_name,
      nombre: fila.first_name,
      anio: seccion.grade_level,
      seccion: seccion.section,
      nota: fila.nota,
      esOverride: fila.es_override,
    })),
  }))

const slug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const nombreArchivoPdf = (opciones: {
  anioEscolar: number
  lapso: number
  grupo?: Pick<GrupoPdf, 'anio' | 'seccion'>
}): string => {
  const base = `notas-${opciones.anioEscolar}-lapso-${opciones.lapso}`
  if (opciones.grupo === undefined) return `${base}.pdf`
  return `${base}-${slug(opciones.grupo.anio)}-${slug(opciones.grupo.seccion)}.pdf`
}
