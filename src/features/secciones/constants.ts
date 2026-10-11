export const GRADOS = ['1ro', '2do', '3ro', '4to', '5to'] as const
export const TURNOS = ['MATUTINO', 'VESPERTINO'] as const

export type Grado = (typeof GRADOS)[number]
export type Turno = (typeof TURNOS)[number]

export const ETIQUETAS_TURNO: Record<Turno, string> = {
  MATUTINO: 'Matutino',
  VESPERTINO: 'Vespertino',
}

export const GRADO_TODOS = 'todos'
