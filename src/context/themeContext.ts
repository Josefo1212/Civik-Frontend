import { createContext } from 'react'

export type Tema = 'claro' | 'oscuro' | 'sistema'

export type TemaResuelto = 'claro' | 'oscuro'

export interface ValorTema {
  tema: Tema
  temaResuelto: TemaResuelto
  cambiarTema: (tema: Tema) => void
  alternarTema: () => void
}

export const CLAVE_TEMA = 'civik-tema'

export const ThemeContext = createContext<ValorTema | null>(null)
