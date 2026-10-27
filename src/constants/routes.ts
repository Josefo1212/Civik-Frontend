export const RUTAS = {
  inicio: '/',
  secciones: '/secciones',
  estudiantes: '/estudiantes',
  eventos: '/eventos',
  asistencia: '/asistencia',
} as const

export const NAVEGACION_PRINCIPAL = [
  { ruta: RUTAS.inicio, etiqueta: 'Inicio' },
  { ruta: RUTAS.estudiantes, etiqueta: 'Alumnos y secciones' },
  { ruta: RUTAS.eventos, etiqueta: 'Eventos' },
  { ruta: RUTAS.asistencia, etiqueta: 'Asistencia' },
] as const