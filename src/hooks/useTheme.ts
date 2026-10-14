import { useContext } from 'react'
import { ThemeContext } from '../context/themeContext'

export const useTheme = () => {
  const valor = useContext(ThemeContext)
  if (valor === null) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return valor
}
