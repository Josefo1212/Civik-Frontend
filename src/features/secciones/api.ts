import type { Seccion } from '../../domain/seccion'
import { apiSend } from '../../api/client'

export type CrearSeccionPayload = {
  grade_level: string
  section: string
  shift: string
}

export type EditarSeccionPayload = CrearSeccionPayload

const limpiarGrado = (grado?: string): string | undefined => {
  if (!grado) return undefined
  if (grado === 'todos') return undefined
  return grado
}

export const listarSecciones = async (grado?: string): Promise<Seccion[]> => {
  const g = limpiarGrado(grado)
  const params = g ? `?grado=${encodeURIComponent(g)}` : ''
  return await apiSend<Seccion[]>(`/sections${params}`, 'GET')
}

export const crearSeccion = async (payload: CrearSeccionPayload): Promise<Seccion> => {
  return await apiSend<Seccion>('/sections', 'POST', payload)
}

export const editarSeccion = async (id: string, payload: EditarSeccionPayload): Promise<Seccion> => {
  return await apiSend<Seccion>(`/sections/${id}`, 'PUT', payload)
}

export const darDeBajaSeccion = async (id: string): Promise<Seccion> => {
  return await apiSend<Seccion>(`/sections/${id}/baja`, 'POST')
}

export const reactivarSeccion = async (id: string): Promise<Seccion> => {
  return await apiSend<Seccion>(`/sections/${id}/reactivar`, 'POST')
}

export const eliminarSeccion = async (id: string): Promise<void> => {
  await apiSend<void>(`/sections/${id}`, 'DELETE')
}
