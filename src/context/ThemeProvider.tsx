import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CLAVE_TEMA, ThemeContext } from './themeContext'
import type { Tema, TemaResuelto } from './themeContext'

const leerPreferencia = (): Tema => {
  try {
    const valor = localStorage.getItem(CLAVE_TEMA)
    if (valor === 'claro' || valor === 'oscuro' || valor === 'sistema') return valor
  } catch {
    return 'sistema'
  }
  return 'sistema'
}

const prefiereOscuro = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

const COLOR_TEMA: Record<TemaResuelto, string> = {
  claro: '#2563eb',
  oscuro: '#0b1020',
}

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<Tema>(leerPreferencia)
  const [oscuroSistema, setOscuroSistema] = useState(prefiereOscuro)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = (evento: MediaQueryListEvent) => setOscuroSistema(evento.matches)
    media.addEventListener('change', alCambiar)
    return () => media.removeEventListener('change', alCambiar)
  }, [])

  const temaResuelto: TemaResuelto =
    tema === 'sistema' ? (oscuroSistema ? 'oscuro' : 'claro') : tema

  useEffect(() => {
    document.documentElement.dataset.theme = temaResuelto === 'oscuro' ? 'dark' : 'light'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta !== null) meta.setAttribute('content', COLOR_TEMA[temaResuelto])
  }, [temaResuelto])

  const cambiarTema = useCallback((nuevo: Tema) => {
    setTema(nuevo)
    try {
      localStorage.setItem(CLAVE_TEMA, nuevo)
    } catch {
      /* el tema igual se aplica en memoria */
    }
  }, [])

  const alternarTema = useCallback(
    () => cambiarTema(temaResuelto === 'oscuro' ? 'claro' : 'oscuro'),
    [cambiarTema, temaResuelto],
  )

  const valor = useMemo(
    () => ({ tema, temaResuelto, cambiarTema, alternarTema }),
    [tema, temaResuelto, cambiarTema, alternarTema],
  )

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
