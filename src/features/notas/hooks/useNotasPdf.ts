import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Lapso } from '../../../domain/lapso'
import type { FilaNota } from '../../../domain/nota'
import type { Seccion } from '../../../domain/seccion'
import { listarNotas } from '../api'
import { ERROR_GENERAR_PDF, ERROR_SIN_ESTUDIANTES } from '../constants'
import { armarGruposPdf, ordenarSecciones } from '../pdf/armado'
import { generarDocumentoPdf } from '../pdf/documento'
import { esNotaProvisional } from '../utils'
import { notasQueryKeys } from './useNotas'

export type OpcionesNotasPdf = {
  lapso: Lapso | null
  secciones: Seccion[]
  seccionId: string | null
}

export const useNotasPdf = ({ lapso, secciones, seccionId }: OpcionesNotasPdf) => {
  const queryClient = useQueryClient()
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = async (): Promise<void> => {
    if (lapso === null) return

    setError(null)
    setGenerando(true)

    try {
      const alcance =
        seccionId === null
          ? ordenarSecciones(secciones.filter((seccion) => seccion.active))
          : secciones.filter((seccion) => seccion.id === seccionId)

      if (alcance.length === 0) throw new Error(ERROR_SIN_ESTUDIANTES)

      const resultados = await Promise.all(
        alcance.map(async (seccion) => {
          const filas = await queryClient.fetchQuery({
            queryKey: notasQueryKeys.porPar(lapso.id, seccion.id),
            queryFn: () => listarNotas(lapso.id, seccion.id),
          })
          return [seccion.id, filas] as const
        }),
      )

      const grupos = armarGruposPdf(alcance, new Map<string, FilaNota[]>(resultados))

      if (grupos.every((grupo) => grupo.filas.length === 0)) {
        throw new Error(ERROR_SIN_ESTUDIANTES)
      }

      await generarDocumentoPdf({
        anioEscolar: lapso.school_year,
        lapso: lapso.lapse_number,
        provisional: esNotaProvisional(lapso.status),
        unaSeccion: seccionId !== null,
        grupos,
      })

    } catch (causa) {
      setError(causa instanceof Error && causa.message.length > 0 ? causa.message : ERROR_GENERAR_PDF)
    } finally {
      setGenerando(false)
    }
  }

  return { generar, generando, error }
}
