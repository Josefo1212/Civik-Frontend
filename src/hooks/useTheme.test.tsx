import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import ThemeProvider from '../context/ThemeProvider'
import { CLAVE_TEMA } from '../context/themeContext'
import { useTheme } from './useTheme'

const envoltorio = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

const stubMatchMedia = (oscuro: boolean) => {
  const media = {
    matches: oscuro,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  }
  vi.stubGlobal('matchMedia', vi.fn(() => media))
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useTheme', () => {
  it('usa el sistema cuando no hay preferencia guardada', () => {
    stubMatchMedia(true)

    const { result } = renderHook(() => useTheme(), { wrapper: envoltorio })

    expect(result.current.tema).toBe('sistema')
    expect(result.current.temaResuelto).toBe('oscuro')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('persiste y aplica el tema forzado', () => {
    stubMatchMedia(false)

    const { result } = renderHook(() => useTheme(), { wrapper: envoltorio })
    act(() => result.current.cambiarTema('oscuro'))

    expect(result.current.temaResuelto).toBe('oscuro')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('oscuro')
  })

  it('alterna respecto del tema resuelto', () => {
    stubMatchMedia(false)

    const { result } = renderHook(() => useTheme(), { wrapper: envoltorio })
    act(() => result.current.alternarTema())

    expect(result.current.tema).toBe('oscuro')
    expect(result.current.temaResuelto).toBe('oscuro')
  })
})
