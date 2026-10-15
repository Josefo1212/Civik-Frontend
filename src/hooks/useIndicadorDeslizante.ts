import { useLayoutEffect, useRef } from 'react'

export const useIndicadorDeslizante = <T extends HTMLElement>(
  dependencia: unknown,
  selectorActivo: string,
) => {
  const contenedorRef = useRef<T>(null)
  const indicadorRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const contenedor = contenedorRef.current
    const indicador = indicadorRef.current
    if (contenedor === null || indicador === null) return

    const posicionar = () => {
      const activo = contenedor.querySelector<HTMLElement>(selectorActivo)
      if (activo === null) {
        indicador.style.opacity = '0'
        return
      }
      const cajaContenedor = contenedor.getBoundingClientRect()
      const cajaActivo = activo.getBoundingClientRect()
      indicador.style.width = `${cajaActivo.width}px`
      indicador.style.height = `${cajaActivo.height}px`
      indicador.style.transform = `translate(${cajaActivo.left - cajaContenedor.left}px, ${
        cajaActivo.top - cajaContenedor.top
      }px)`
      indicador.style.opacity = '1'
    }

    posicionar()

    const observador =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(posicionar)
    observador?.observe(contenedor)
    window.addEventListener('resize', posicionar)
    if (typeof document !== 'undefined' && document.fonts !== undefined) {
      void document.fonts.ready.then(posicionar)
    }

    return () => {
      observador?.disconnect()
      window.removeEventListener('resize', posicionar)
    }
  }, [dependencia, selectorActivo])

  return { contenedorRef, indicadorRef }
}
