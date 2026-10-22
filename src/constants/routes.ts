export const RUTAS = {
  secciones: '/secciones',
  estudiantes: '/estudiantes',
  eventos: '/eventos',
  asistencia: '/asistencia',
} as const

export const NAVEGACION_PRINCIPAL = [
  { ruta: RUTAS.secciones, etiqueta: 'Secciones' },
  { ruta: RUTAS.estudiantes, etiqueta: 'Estudiantes' },
  { ruta: RUTAS.eventos, etiqueta: 'Eventos' },
  { ruta: RUTAS.asistencia, etiqueta: 'Asistencia' },
] as const