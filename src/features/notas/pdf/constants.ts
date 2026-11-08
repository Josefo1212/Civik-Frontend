export const TITULO_DOCUMENTO = 'Listado de notas de estudiantes de La Brigada del Valle'

export const tituloDocumento = (anioEscolar: number): string =>
  `${TITULO_DOCUMENTO} año escolar ${anioEscolar}`

export const COLUMNAS_PDF = ['Apellido', 'Nombre', 'Año', 'Sección', 'Nota final'] as const

export const LEYENDA_OVERRIDE = '(*) Nota editada manualmente.'

export const ETIQUETA_PROVISIONAL = 'Nota provisional'

export const ETIQUETA_DEFINITIVA = 'Nota definitiva'
