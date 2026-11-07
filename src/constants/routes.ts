export const RUTAS = {
  inicio: '/',
  secciones: '/secciones',
  estudiantes: '/estudiantes',
  eventos: '/eventos',
  asistencia: '/asistencia',
} as const

export const NAVEGACION_PRINCIPAL = [
  { ruta: RUTAS.inicio, etiqueta: 'Inicio', etiquetaCorta: 'Inicio' },
  { ruta: RUTAS.estudiantes, etiqueta: 'Alumnos y secciones', etiquetaCorta: 'Alumnos' },
  { ruta: RUTAS.eventos, etiqueta: 'Eventos', etiquetaCorta: 'Eventos' },
  { ruta: RUTAS.asistencia, etiqueta: 'Asistencia', etiquetaCorta: 'Asistencia' },
] as const