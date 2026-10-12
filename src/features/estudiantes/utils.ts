import type { Estudiante } from '../../domain/estudiante'

export const normalizar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const filtrarEstudiantes = (estudiantes: Estudiante[], texto: string): Estudiante[] => {
  const busqueda = normalizar(texto.trim())
  if (busqueda === '') return estudiantes
  return estudiantes.filter((estudiante) =>
    normalizar(`${estudiante.first_name} ${estudiante.last_name}`).includes(busqueda),
  )
}
